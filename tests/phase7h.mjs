import assert from 'node:assert/strict';
import fs from 'node:fs';
import {EventEmitter} from 'node:events';
import {coverSize,cover,cameraTarget,damp,meter,setTextIfChanged,Atmosphere,syncShadow} from '../src/ui/Presentation.js';
import {makeFightInput} from '../src/ui/FightInput.js';
assert.deepEqual(coverSize(1920,1080,1280,720),{width:1280,height:720});
assert.deepEqual(coverSize(1000,1000,1280,720),{width:1280,height:1280});
for(const [w,h] of [[600,1800],[1800,600],[1280,720]]){const s=coverSize(w,h,1280,720,1.04);assert(s.width>=1280&&s.height>=720);assert(Math.abs(s.width/s.height-w/h)<1e-9);}
assert.equal(cameraTarget(10,-200,1280,13800),0);assert.equal(cameraTarget(13700,200,1280,13800),12520);assert(cameraTarget(4000,200,1280,13800)>cameraTarget(4000,-200,1280,13800));
const after=hz=>{let x=0;for(let i=0;i<hz;i++)x=damp(x,100,1/hz);return x;};assert(Math.abs(after(30)-after(120))<1e-9);
let writes=0;const label={text:'test',setText(v){this.text=v;writes++;}};setTextIfChanged(label,'test');setTextIfChanged(label,'new');assert.equal(writes,1);
const fills=[];const g={fillStyle(){return this},fillRoundedRect(){return this},fillRect(...a){fills.push(a);return this},lineStyle(){return this},strokeRoundedRect(){return this}};meter(g,10,20,100,12,.25,1,{trail:.5,reverse:true});assert.equal(fills[0][0],60);assert.equal(fills[1][0],85);assert.equal(fills[1][2],25);meter(g,0,0,100,10,-2,1);assert(fills.every(a=>a[2]>=0));
class Obj extends EventEmitter{constructor(){super();this.text='';this.writes=0;} setOrigin(){return this}setScrollFactor(){return this}setDepth(){return this}setStrokeStyle(){return this}setInteractive(){return this}setColor(){return this}setFillStyle(){this.writes++;return this}setText(t){this.text=t;return this}setPosition(x,y){this.x=x;this.y=y;return this}setAlpha(a){this.alpha=a;return this}setScale(a,b){this.sx=a;this.sy=b;return this}}
const windowEmitter=new EventEmitter();globalThis.window={addEventListener:(k,f)=>windowEmitter.on(k,f),removeEventListener:(k,f)=>windowEmitter.off(k,f)};
const scene={add:{circle:()=>new Obj(),text:()=>new Obj()},input:new EventEmitter(),game:{events:new EventEmitter()},events:new EventEmitter(),time:{now:100},energy:0};
const input=makeFightInput(scene,1280,720);assert.equal(input.buttons.length,10);input.sample();const first=input.buttons[0].bg.writes;input.sample();assert.equal(input.buttons[0].bg.writes,first);
const key=code=>({code,preventDefault(){}});windowEmitter.emit('keydown',key('KeyA'));assert(input.sample().left);input.buttons.find(b=>b.action==='jump').bg.emit('pointerdown',{id:1});assert(input.sample().jumpPressed);input.consume('jump');assert(!input.sample().jumpPressed);scene.input.emit('pointerup',{id:1});assert(!input.sample().jump);input.clear();scene.menuOpening=true;windowEmitter.emit('keydown',key('KeyJ'));assert(!input.sample().attackPressed);scene.menuOpening=false;scene.energy=100;input.sample();assert.equal(input.buttons.find(b=>b.action==='ultimate').visual,'false:true');scene.events.emit('shutdown');assert.equal(windowEmitter.listenerCount('keydown'),0);
const atmosphere=new Atmosphere(scene,1280,720);const count=atmosphere.motes.length;for(let i=0;i<200;i++)atmosphere.update(.016);assert.equal(atmosphere.motes.length,count);assert(atmosphere.motes.every(m=>m.node.x>=0&&m.node.x<1280));const shadow=new Obj();syncShadow(shadow,100,300,540);assert(shadow.alpha<.29&&shadow.sx<1);syncShadow(shadow,100,540,540);assert.equal(shadow.sx,1);
console.log('PASS: background proportions, camera bounds and frame-rate independent damping, cached HUD text, health meter geometry, ten input buttons, touch and keyboard, paused input, ultimate feedback, listener cleanup, bounded ambient pool and shadows.');
