import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {makeFightInput} from '../src/ui/FightInput.js';
class Obj extends EventEmitter{setOrigin(){return this}setScrollFactor(){return this}setDepth(){return this}setStrokeStyle(){return this}setInteractive(){return this}setColor(){return this}setFillStyle(){return this}setText(t){this.text=t;return this}}
const win=new EventEmitter();globalThis.window={addEventListener:(k,f)=>win.on(k,f),removeEventListener:(k,f)=>win.off(k,f)};
const scene={add:{circle:()=>new Obj(),text:()=>new Obj()},input:new EventEmitter(),game:{events:new EventEmitter()},events:new EventEmitter(),time:{now:100},energy:0};
const input=makeFightInput(scene,1280,720);const key=(code,repeat=false)=>({code,repeat,preventDefault(){}});
win.emit('keydown',key('KeyJ'));assert(input.sample().attackPressed);input.consume('attack');scene.time.now+=200;win.emit('keydown',key('KeyJ',true));assert(input.sample().attackPressed,'held attack still repeats through game logic');
input.clear();win.emit('keydown',key('KeyJ',true));assert(!input.sample().attackPressed,'OS repeats cannot restore a cleared held key');win.emit('keyup',key('KeyJ'));win.emit('keydown',key('KeyJ'));assert(input.sample().attackPressed,'fresh press accepted');
input.clear();win.emit('keydown',key('KeyA',true));assert(!input.sample().left,'movement does not resume from stale repeat');win.emit('keyup',key('KeyA'));win.emit('keydown',key('KeyA'));assert(input.sample().left);scene.events.emit('shutdown');assert.equal(win.listenerCount('keydown'),0);
console.log('PASS: stale keyboard repeats after pause/blur ignored; fresh movement and attack presses accepted; held attack repeat preserved.');
