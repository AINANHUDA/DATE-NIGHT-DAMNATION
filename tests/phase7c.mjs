import {gateSupplies} from '../src/world/CampaignBalance.js';
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8');
const F=await import('data:text/javascript;base64,'+Buffer.from(read('combat/CombatFlow.js')).toString('base64'));
const frames={frames:['a','b','c','d'],fps:10,durationsMs:[100,100,100,100]};
assert.deepEqual(F.attackTiming(frames,{frame:2}),{impact:200,duration:400,cancel:285});
const states=['idle','attack1','attack2','attack3','skill1','ultimate'];
const char={animations:Object.fromEntries(states.map(s=>[s,frames])),metrics:{emitters:{}},texture:'test'};
const CHARACTERS={ainan:char,'mini-maliha':char,maliha:char};
const rules=Object.fromEntries(states.map(s=>[s,{damage:20,reach:150,cooldown:500,fx:'impact'}]));
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const Phaser={Scene:class{},Math:{Clamp:clamp,Linear:(a,b,t)=>a+(b-a)*t}};
const load=(path,klass)=>vm.runInNewContext(read(path).replace(/^import .*;\s*$/gm,'').replace('export class '+klass,'class '+klass)+'\n'+klass,{...F,gateSupplies,settings:{difficulty:'normal'},CHARACTERS,ATTACKS:rules,Phaser,clamp,W:1280,H:720,GROUND:599,REQUIRED:52,console,chapterWipe:(s,w,h,cb)=>cb()});
const Boss=load('scenes/BossBattleScene.js','BossBattleScene');
const b=new Boss();const p={id:'ainan',x:100,y:599,dir:1,ready:0,stun:0,hp:100,sprite:{scaleX:1,scaleY:1}};const target={x:200,y:599,hp:100};b.player=p;b.boss=target;b.now=0;b.pose=()=>{};b.flash=()=>{};let hits=[];b.damage=(_,n)=>{hits.push(n);return true;};
assert.equal(b.beginAttack(p,'attack1',rules.attack1,'impact'),true);b.now=199;b.impact(p,target);assert.equal(hits.length,0);b.now=200;b.impact(p,target);b.impact(p,target);assert.deepEqual(hits,[20]);assert.equal(F.nextBasic(p,200),'attack2');b.now=284;assert.equal(b.beginAttack(p,'attack2',rules.attack2,'impact'),false);b.now=285;assert.equal(b.beginAttack(p,'attack2',rules.attack2,'impact'),true);b.now=485;b.impact(p,target);b.now=570;assert.equal(b.beginAttack(p,'attack3',rules.attack3,'impact'),true);b.now=770;b.impact(p,target);assert.deepEqual(hits,[20,20,25]);
// A missed attack cannot cancel and does not advance the chain.
p.attack=null;p.ready=0;p.chainUntil=-1;b.now=900;target.x=900;assert(b.beginAttack(p,'attack1',rules.attack1,'impact'));b.now=1100;b.impact(p,target);assert.equal(F.nextBasic(p,b.now),'attack1');b.now=1185;assert.equal(b.beginAttack(p,'attack2',rules.attack2,'impact'),false);assert.equal(hits.length,3);
// Freeze both the animation and the simulation clock. Resume at deadline.
const actor={active:true,anims:{isPlaying:true,isPaused:false,pause(){this.isPaused=true},resume(){this.isPaused=false}}};const clock={time:{now:0}};F.initCombat(clock);F.combatFrame(clock,16);F.impactPause(clock,[actor],45);assert(actor.anims.isPaused);clock.time.now=30;assert.equal(F.combatFrame(clock,16),0);assert.equal(clock.combatNow,16);clock.time.now=46;assert.equal(F.combatFrame(clock,16),.016);assert.equal(clock.combatNow,32);assert(!actor.anims.isPaused);
assert(F.projectileCrosses(0,120,60,10));assert(F.projectileCrosses(120,0,60,10));assert(!F.projectileCrosses(0,20,60,10));
const Chase=load('scenes/ChaseScene.js','ChaseScene');const c=new Chase();c.hero={x:100,y:599,scaleX:1,scaleY:1};c.dir=1;c.combatNow=0;c.ready=0;c.pose=()=>{};c.flash=()=>{};c.enemies=[{hp:100,s:{x:150,y:599}}];let chaseHits=[];c.damageEnemy=(e,d)=>{chaseHits.push(d);return true;};assert(c.beginAttack('attack1'));c.combatNow=200;c.updateAttack(200);c.updateAttack(200);assert.deepEqual(chaseHits,[20]);c.combatNow=285;assert(c.beginAttack(F.nextBasic(c,285)));assert.equal(c.attack.state,'attack2');
// Gate and boss handoffs preserve progress with the new minimum health supply.
let transition;c.finished=false;c.count=52;c.ammo=14;c.energy=90;c.hp=60;c.notice={setText(){}};c.scene={get:()=>({}),start:(key,data)=>transition={key,data}};c.end(true);assert.equal(transition.key,'StoryScene');assert.equal(transition.data.chapter,'mini');assert.equal(transition.data.payload.hp,70);
b.init({stage:1,ammo:12,energy:55,hp:80,bananas:52});b.boss={vx:10};b.player={hp:30};b.ammo=10;b.energy=50;b.collectedBananas=52;b.sfx=()=>{};b.floatText=()=>{};b.time={delayedCall:(ms,cb)=>cb()};b.scene={start:(key,data)=>transition={key,data}};b.advance();assert.equal(transition.data.chapter,'final');assert.equal(transition.data.payload.hp,65);b.inputState={clear(){}};b.finish(true);assert.equal(transition.data.chapter,'ending');assert.equal(typeof b.stepFighterPhysics,'function');assert.equal(typeof b.physics,'undefined');
console.log('PASS: source-timed hits, three-hit cancel chain, finisher bonus, whiff recovery, freeze/resume, swept projectiles, chase combo, gate and boss transitions.');
