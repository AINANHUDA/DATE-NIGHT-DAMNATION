import assert from 'node:assert/strict';
import { checkpointHealth,gateSupplies,nextBanana } from '../src/world/CampaignBalance.js';
import { END,GROUND,REQUIRED,TOTAL,ground,ledges,secrets,groundBananas,secretBananas,gaps,hazards,checkpointXs,potionHomes,enemyHomes,safeGround } from '../src/world/ExpeditionLayout.js';
import { MOTION } from '../src/combat/Movement.js';
import fs from 'node:fs';
import vm from 'node:vm';
assert.equal(TOTAL,83);assert.equal(REQUIRED,52);
const all=[...groundBananas,...secretBananas,...ledges.flatMap(([x,y,w])=>[[x+w*.3,y-30],[x+w*.73,y-30]])];
assert.equal(new Set(all.map(([x,y])=>`${x}:${y}`)).size,TOTAL);
assert(all.every(([x,y])=>x>0&&x<END&&y>0&&y<GROUND));
assert([...checkpointXs,...potionHomes,...enemyHomes,...groundBananas.map(b=>b[0])].every(safeGround));
const surfaces=[...ground,...ledges.map(([x,y,w])=>({x,y,w})),...secrets];
assert(all.every(([x,y])=>surfaces.some(p=>x>=p.x&&x<=p.x+p.w&&p.y-y>=25&&p.y-y<=45)));
// Simulate the exact semi-implicit gravity and landing logic from the chase.
for(const hz of [30,60,120])for(const [a,b] of gaps){let x=a-22,y=GROUND,vy=-MOTION.jump,second=false,landed=false;
 for(let i=0;i<hz*3;i++){const dt=1/hz,oldY=y;if(!second&&vy>=0){vy=-MOTION.doubleJump;second=true;}x+=MOTION.run*dt;vy+=MOTION.gravity*dt;y+=vy*dt;if(vy>=0){const hit=surfaces.filter(p=>x>=p.x-8&&x<=p.x+p.w+8&&oldY<=p.y+.1&&y>=p.y).sort((a,b)=>a.y-b.y)[0];if(hit){landed=x>=b-8;break;}}if(y>800)break;}
 assert(landed,`Gap ${a}-${b} unreachable by this simulated route at ${hz} FPS`);}
for(const [d,h,a] of [['easy',85,8],['normal',70,5],['hard',55,3]]){assert.deepEqual(gateSupplies(1,0,d),{hp:h,ammo:a});assert.deepEqual(gateSupplies(100,32,d),{hp:100,ammo:32});}
assert.equal(checkpointHealth(20,'normal'),65);assert.equal(checkpointHealth(90,'normal'),90);assert.equal(checkpointHealth(20,'hard'),50);assert.equal(checkpointHealth(20,'easy'),85);
const pickup=(x,y,active=true)=>({x,y,g:{active}});assert.equal(nextBanana([pickup(100,500,false),pickup(50,500),pickup(500,500)],200,540).direction,'LEFT');assert.equal(nextBanana([pickup(250,500)],200,540).direction,'RIGHT');assert.equal(nextBanana([pickup(200,350)],200,540).direction,'ABOVE / NEARBY');assert.equal(nextBanana([],0,0),null);
// Invoke the real updated scene methods against mocked Phaser objects.
const src=fs.readFileSync(new URL('../src/scenes/ChaseScene.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace('export class','class');
const settings={difficulty:'normal'};let saved,transition,notice;
const C=vm.runInNewContext(src+'\nChaseScene',{Phaser:{Scene:class{}},settings,checkpointHealth,gateSupplies,nextBanana,checkpointXs,markChapter:(_,__,c)=>{saved=c},console:{info(){},error(){}}});
const c=new C();Object.assign(c,{hp:20,hero:{x:4600,y:GROUND},ammo:0,energy:42,count:52,usedBananas:new Set(['1:2']),usedPotions:new Set(),deadEnemies:new Set(),flash(){},inputState:{tell(){}},audio:{cue(){}},notice:{setText(v){notice=v}},scene:{get(){return true},start(k,d){transition={k,d}}}});
c.saveCheckpoint();assert.equal(c.hp,65);assert.equal(saved.hp,65);assert.equal(saved.x,4600);c.hp=12;c.saveCheckpoint();assert.equal(c.hp,12);c.end(true);assert.equal(transition.k,'StoryScene');assert.equal(transition.d.chapter,'mini');assert.equal(transition.d.payload.hp,70);assert.equal(transition.d.payload.ammo,5);assert.equal(transition.d.payload.energy,42);assert.equal(transition.d.payload.bananas,52);
console.log('PASS: 83 unique bananas, 52-banana gate, safe item locations, all five gaps at 30/60/120 FPS, difficulty-dependent checkpoint and boss supplies, nearest-pickup guidance and actual chase scene checkpoint/gate methods.');
