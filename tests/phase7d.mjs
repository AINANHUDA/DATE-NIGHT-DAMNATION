import assert from 'node:assert/strict';
import fs from 'node:fs';
const code=fs.readFileSync(new URL('../src/combat/BossDirector.js',import.meta.url),'utf8');
const {BossDirector,bossPhase,bossPattern,inZone,sweptHit}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
assert.equal(bossPhase(0,1,110),0);assert.equal(bossPhase(1,109,155),0);assert.equal(bossPhase(1,108,155),1);assert.equal(bossPhase(1,54,155),2);
assert.deepEqual([0,1,2].map(i=>bossPattern(0,0,i).id),['orbit','gravity','nova']);assert.equal(bossPattern(1,0,0).id,'serpent');assert.equal(bossPattern(1,1,0).id,'curse');assert.equal(bossPattern(1,2,0).id,'storm');
assert(inZone({x:100,y:540},100,80,540,'zone'));assert(!inZone({x:100,y:380},100,80,540,'zone'));assert(!inZone({x:300,y:540},100,80,540,'zone'));assert(sweptHit(0,200,100,40));
function obj(){return {active:true,width:100,height:100,setDepth(){return this},setOrigin(){return this},setText(v){this.text=v;return this},setVisible(v){this.visible=v;return this},setAlpha(){return this},setScale(){return this},setFlipX(){return this},destroy(){this.active=false},clear(){return this},fillStyle(){return this},lineStyle(){return this},fillRect(){return this},lineBetween(){return this},fillEllipse(){return this},strokeEllipse(){return this}};}
let hits=0;const scene={stage:0,now:3500,graceUntil:0,boss:{hp:110,maxHp:110,x:950,y:540,dir:-1,vx:0,ready:0,stun:0},player:{hp:100,x:500,y:540,invulnerable:0},add:{graphics:obj,image:obj,circle:obj},textures:{exists:()=>true},text:obj,sub:obj(),cameras:{main:{flash(){}}},floatText(){},pose(){},flash(){},damage(){hits++}};
let d=new BossDirector(scene,1280,540);d.control(.016);assert.equal(d.cast.pattern.id,'orbit');assert.equal(d.hazards.length,0);d.update(.016);assert.equal(hits,0);scene.now=d.cast.at;d.release(d.cast.attack);assert.equal(d.hazards.length,3);d.release(d.cast.attack);assert.equal(d.hazards.length,3);d.clear();assert.equal(d.hazards.length,0);
// Cast interrupted by hit before release does not produce hazards.
d.start(bossPattern(0,0,1));const canceled=d.cast.attack;scene.boss.attack=null;scene.now+=10;d.control(.016);d.release(canceled);assert.equal(d.hazards.length,0);assert.equal(d.cast,null);
// Gravity well locks position and only damages once, including on subsequent frames.
scene.now=6000;d.start(bossPattern(0,0,1));const lock=d.cast.x;scene.player.x=lock+250;scene.now=d.cast.at;d.release(d.cast.attack);d.update(.016);assert.equal(hits,0);scene.player.x=lock+10;d.update(.016);assert.equal(hits,1);d.update(.016);assert.equal(hits,1);scene.now+=1200;d.update(.016);assert.equal(d.hazards.length,0);
// Phase transitions change the move set. Final storm creates 3 separated zones.
d.clear();scene.stage=1;scene.boss.maxHp=155;scene.boss.hp=100;scene.boss.attack=null;scene.boss.ready=0;scene.now=10000;d.control(.016);assert.equal(d.phase,1);scene.boss.hp=50;scene.boss.attack=null;scene.boss.ready=0;scene.now+=1000;d.control(.016);assert.equal(d.phase,2);d.clear();d.start(bossPattern(1,2,0));scene.now=d.cast.at;d.release(d.cast.attack);assert.equal(d.hazards.length,3);d.clear();assert.equal(d.hazards.length,0);
console.log('PASS: distinct attack sets, phase thresholds, telegraph before release, canceled casts, no duplicate release, dodge zone, single damage, expiry, storm and cleanup.');
