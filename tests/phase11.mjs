import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {EventEmitter} from 'node:events';
import {CONTROL_LAYOUT,CONTROL_ICONS,makeFightInput} from '../src/ui/FightInput.js';
import {meter,hudPlate} from '../src/ui/Presentation.js';
import {loadManifest,approvedFiles} from '../tools/release-build.mjs';
const root=new URL('../',import.meta.url);
assert.equal(CONTROL_LAYOUT.length,10);
for(const [action,x,y,r] of CONTROL_LAYOUT){assert(r>=48);assert(x-r>=0&&x+r<=1280&&y-r>=0&&y+r<=720);assert(CONTROL_ICONS[action].length);for(const [other,ox,oy,or] of CONTROL_LAYOUT)if(other!==action)assert(Math.hypot(x-ox,y-oy)>=r+or);}
class Target extends EventEmitter{addEventListener(k,f){this.on(k,f)}removeEventListener(k,f){this.off(k,f)}}
class El extends Target{constructor(){super();this.children=[];this.dataset={};this.style={setProperty(){}};this.classes=new Set();this.classList={toggle:(v,on)=>on?this.classes.add(v):this.classes.delete(v)};this.hidden=false;}appendChild(e){this.children.push(e);return e;}append(...e){this.children.push(...e)}setAttribute(){}setPointerCapture(){}remove(){this.removed=true;}closest(){return this;}}
class Obj extends Target{setOrigin(){return this}setScrollFactor(){return this}setDepth(){return this}setStrokeStyle(){return this}setInteractive(){return this}setColor(){return this}setFillStyle(){return this}setText(t){this.text=t;return this}setVisible(v){this.visible=v;return this}lineStyle(){return this}lineBetween(){return this}}
const media=new Target();media.matches=true;
const win=new Target();win.matchMedia=()=>media;win.dispatchEvent=e=>win.emit(e.type,e);
const doc=new Target();doc.body=new El();doc.createElement=()=>new El();doc.createElementNS=()=>new El();globalThis.window=win;globalThis.document=doc;
const scene={add:{circle:()=>new Obj(),text:()=>new Obj(),graphics:()=>new Obj()},input:new EventEmitter(),game:{events:new EventEmitter()},events:new EventEmitter(),time:{now:100},energy:0};
const input=makeFightInput(scene,1280,720);const dock=doc.body.children[0];assert(!dock.hidden);assert(input.buttons.every(b=>b.bg.visible===false&&b.icon));const all=dock.children[1].children.flatMap(g=>g.children);assert.equal(all.length,10);const btn=a=>all.find(b=>b.dataset.action===a);const touch=id=>({pointerId:id,preventDefault(){}});
btn('left').emit('pointerdown',touch(1));btn('jump').emit('pointerdown',touch(2));btn('attack').emit('pointerdown',touch(3));let o=input.sample();assert(o.left&&o.jump&&o.attack&&o.jumpPressed);doc.elementFromPoint=()=>btn('right');btn('left').emit('pointermove',touch(1));assert(input.sample().right&&!input.sample().left);btn('left').emit('pointercancel',touch(1));assert(!input.sample().right&&input.sample().attack);btn('jump').emit('lostpointercapture',touch(2));assert(!input.sample().jump);scene.energy=100;input.sample();assert(btn('ultimate').classes.has('ready'));let paused=false;input.setPauseHandler(()=>{paused=true;scene.menuOpening=true;scene.events.emit('pause');});dock.children[0].children[0].emit('click');assert(paused&&dock.hidden&&!input.sample().attack);scene.menuOpening=false;scene.events.emit('resume');assert(!dock.hidden);media.matches=false;media.emit('change');assert(dock.hidden&&input.buttons.every(b=>b.bg.visible===true));scene.events.emit('shutdown');assert(dock.removed&&media.listenerCount('change')===0);
const g={fillStyle(){return this},fillRoundedRect(){return this},fillRect(){return this},lineStyle(){return this},strokeRoundedRect(){return this},lineBetween(){return this}};hudPlate(g,0,0,500,100);meter(g,20,20,400,26,.3,0xabcdef,{trail:.8});
const m=await loadManifest(fileURLToPath(root));const files=approvedFiles(m);for(const cue of ['meme-faa','meme-bonk','meme-scratch'])assert(m.audio.some(x=>x.key==='sfx-'+cue));for(const f of files.filter(f=>f.includes('/music/')||f.includes('/sfx/'))){const b=fs.readFileSync(new URL('../public/'+f,import.meta.url));assert(b.length>1000);if(f.endsWith('.ogg'))assert.equal(b.subarray(0,4).toString(),'OggS');}
console.log('PASS: ten non-overlapping 96px touch targets, vector icons, portrait dock, simultaneous touches, directional sliding, cancel, pause, orientation changes, cleanup, HUD rendering and registered audio.');
