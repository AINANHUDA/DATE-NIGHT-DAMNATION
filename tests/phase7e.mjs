import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8');
const C=await import('data:text/javascript;base64,'+Buffer.from(read('combat/CinematicDirector.js')).toString('base64'));
const F=await import('data:text/javascript;base64,'+Buffer.from(read('combat/CombatFlow.js')).toString('base64'));
function obj(){const o={active:true,width:1600,height:686,destroy(){this.active=false}};for(const k of ['ScrollFactor','Depth','Scale','Alpha','Origin','X','Y'])o['set'+k]=function(...args){this[k]=args;return this};return o;}
function actor(paused=false){return {active:true,anims:{isPlaying:true,isPaused:paused,pause(){this.isPaused=true},resume(){this.isPaused=false}}};}
const scene={time:{now:0},events:{once(){}},textures:{exists:()=>true},add:{rectangle:obj,image:obj,text:obj},inputState:{consume(a){consumed.push(a)}}};let consumed=[];
const d=new C.CinematicDirector(scene,1280,720);const a=actor(),b=actor(true);F.initCombat(scene);F.combatFrame(scene,16);
assert(d.start('ainan',[a,b]));assert(a.anims.isPaused);assert(b.anims.isPaused);assert(!d.start('maliha',[a]));const objects=d.sequence.objects;assert(objects.every(o=>o.ScrollFactor[0]===0));
scene.time.now=400;assert(d.update());assert.equal(scene.combatNow,16);assert(d.active);scene.time.now=820;assert(d.update());assert(!d.active);assert(!a.anims.isPaused);assert(b.anims.isPaused);assert(objects.every(o=>!o.active));assert.equal(consumed.length,7);assert(!d.update());F.combatFrame(scene,16);assert.equal(scene.combatNow,32);
scene.textures.exists=()=>false;assert(!d.start('ainan',[a]));assert(!a.anims.isPaused);assert(C.cutInProgress(820,820).done);assert.equal(C.cutInProgress(0,820).enter,0);
let tweenComplete,timerComplete,transitions=0;scene.tweens={add(o){tweenComplete=o.onComplete}};scene.time.delayedCall=(ms,cb)=>timerComplete=cb;C.chapterWipe(scene,1280,720,()=>transitions++);timerComplete();tweenComplete();assert.equal(transitions,1);
// Verify actual arena update returns before combat simulation while cinematic is active.
const Boss=vm.runInNewContext(read('scenes/BossBattleScene.js').replace(/^import .*;\s*$/gm,'').replace('export class BossBattleScene','class BossBattleScene')+'\nBossBattleScene',{Phaser:{Scene:class{}},combatFrame:F.combatFrame});const arena=new Boss();arena.inputState={sample:()=>({})};arena.cinematic={update:()=>true};arena.combatNow=99;arena.updateArena(0,16);assert.equal(arena.combatNow,99);
const Chase=vm.runInNewContext(read('scenes/ChaseScene.js').replace(/^import .*;\s*$/gm,'').replace('export class ChaseScene','class ChaseScene')+'\nChaseScene',{Phaser:{Scene:class{}},combatFrame:F.combatFrame});const chase=new Chase();chase.inputState={sample:()=>({})};chase.cinematic={update:()=>true};chase.combatNow=99;chase.update(0,16);assert.equal(chase.combatNow,99);
console.log('PASS: cut-in timing, pause ownership, frozen combat, cleanup, missing-art fallback, duplicate prevention, idempotent transition and scene integration.');
