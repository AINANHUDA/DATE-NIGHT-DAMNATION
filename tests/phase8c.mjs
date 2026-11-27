import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import fs from 'node:fs';
import vm from 'node:vm';
import {makeFightInput} from '../src/ui/FightInput.js';
import {BossDirector,bossTiming,bossTempo,bossPattern} from '../src/combat/BossDirector.js';
class Obj extends EventEmitter {setOrigin(){return this}setScrollFactor(){return this}setDepth(){return this}setStrokeStyle(){return this}setInteractive(){return this}setColor(){return this}setFillStyle(){return this}setText(t){this.text=t;return this}}
const win=new EventEmitter();globalThis.window={addEventListener:(k,f)=>win.on(k,f),removeEventListener:(k,f)=>win.off(k,f)};
const scene={add:{circle:()=>new Obj(),text:()=>new Obj()},input:new EventEmitter(),game:{events:new EventEmitter()},events:new EventEmitter(),time:{now:100},combatNow:100,energy:0};
const input=makeFightInput(scene,1280,720);const key=code=>({code,preventDefault(){}});
win.emit('keydown',key('KeyJ'));win.emit('keyup',key('KeyJ'));scene.time.now+=900;assert(input.sample().attackPressed,'a buffered attack survives a stopped combat clock');scene.combatNow+=451;assert(!input.sample().attackPressed,'expired after actual simulation time');
win.emit('keydown',key('Space'));win.emit('keyup',key('Space'));scene.time.now+=500;assert(input.sample().jumpPressed);input.consume('jump');assert(!input.sample().jumpPressed);scene.events.emit('shutdown');
const pattern=bossPattern(1,2,0);assert(bossTiming(pattern,2,'easy').warn>bossTiming(pattern,2,'normal').warn);assert(bossTiming(pattern,2,'hard').recover<bossTiming(pattern,2,'normal').recover);assert.equal(bossTiming(pattern,2,'normal').warn,930);assert.equal(bossTempo('invalid').gap,1);
let difficulty='easy';const s={stage:1,now:100,boss:{x:1000,dir:-1},player:{x:500},add:{graphics:()=>new Obj()},text:()=>new Obj(),pose(){}};const d=new BossDirector(s,1280,540,()=>difficulty);d.phase=2;d.start(pattern);const easy=d.cast.at-s.now;const easyGap=d.nextSpecial-d.cast.end;difficulty='hard';d.start(pattern);assert(d.cast.at-s.now<easy);assert(d.nextSpecial-d.cast.end<easyGap);assert.equal(d.cast.warn,d.cast.at-s.now);
const code=fs.readFileSync(new URL('../src/scenes/ChaseScene.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace('export class','class');
const C=vm.runInNewContext(code+'\nChaseScene',{Phaser:{Scene:class{}},incomingDamage:x=>x,impactSparks(){},impactPause(){},combatFrame:()=>.016,drive(){throw Error('drive must not run while stunned')},MOTION:{gravity:1450}});
const c=new C();Object.assign(c,{hp:100,combatNow:100,damageUntil:0,dashUntil:0,guard:true,dir:1,hero:{setTint(){},clearTint(){}},time:{delayedCall(){}},cameras:{main:{shake(){}}},enemies:[],pose(){}});c.hit(20,-1);assert.equal(c.hp,96,'front guard reduces to 20%');c.combatNow=1000;c.hit(20,1);assert.equal(c.hp,76,'rear hit bypasses guard');assert.equal(c.vx,155);assert(c.stunUntil>c.combatNow);
const sentinel=Error('after movement');Object.assign(c,{inputState:{sample:()=>({left:false,right:true,guard:false})},hero:{get y(){throw sentinel}},finished:false});assert.throws(()=>c.update(0,16),e=>e===sentinel);assert(c.vx>140&&c.vx<155,'knockback decays instead of being replaced by player drive');
console.log('PASS: combat-clock input buffering, difficulty-dependent boss warnings/recovery/cadence, front/rear guard, and stunned knockback preservation.');
