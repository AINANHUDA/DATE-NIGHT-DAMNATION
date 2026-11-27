/** MONKEY MIND III | MODULE
 * Map length, regions, platform geometry, hazards, enemy/potion positions and banana requirements.
 * Customization map: docs/CUSTOMIZATION.md
 */
// World geometry is independent of rendering and combat.
export const END=13800, GROUND=540, REQUIRED=52;
export const zones=[{x:0,name:'I / THE WHISPERING WOODS',bg:'forest-bg',theme:'woods'},{x:4600,name:'II / THE HARBOR CROSSING',bg:'harbor-bg',theme:'harbor'},{x:9200,name:'III / THE CURSED SANCTUARY',bg:'prologue-bg',theme:'sanctuary'}];
export const checkpointXs=[4600,9200];
export const gaps=[[2220,2350],[5500,5635],[7650,7800],[11100,11250],[12160,12290]];
export const hazards=[{x:3350,w:72},{x:6870,w:78},{x:10180,w:82},{x:12600,w:78}];
export const enemyHomes=[950,1760,2650,3540,4470,5360,6300,7150,8040,8950,9900,10800,11750,12800];
export const potionHomes=[1550,3200,4800,6500,8150,9900,11500,13200];
export const ground=[];
let start=0;for(const [a,b] of gaps){ground.push({x:start,y:GROUND,w:a-start});start=b;}ground.push({x:start,y:GROUND,w:END-start});
export const ledges=Array.from({length:24},(_,i)=>[450+i*540,[420,350,405,385,435,365][i%6],[210,245,270,200][i%4]]);
// Optional upper routes. Reachable using the nearby normal ledges and double jump.
export const secrets=[{x:1060,y:220,w:185},{x:5920,y:250,w:190},{x:11820,y:225,w:190}];
export function groundAt(x){return ground.find(p=>x>=p.x&&x<=p.x+p.w);}
export function themeAt(x){return x>=9200?'sanctuary':x>=4600?'harbor':'woods';}
export function safeGround(x){const p=groundAt(x);return !!p&&x>=p.x+42&&x<=p.x+p.w-42&&!hazards.some(h=>x>=h.x-45&&x<=h.x+h.w+45);}
function safeBanana(x){if(safeGround(x))return x;for(let d=10;d<=250;d+=10){if(safeGround(x-d))return x-d;if(safeGround(x+d))return x+d;}throw new Error('No safe banana location');}
export const groundBananas=Array.from({length:26},(_,i)=>[safeBanana(270+i*510),GROUND-42]);
export const secretBananas=secrets.flatMap(p=>[.25,.5,.75].map(f=>[p.x+p.w*f,p.y-30]));
export const TOTAL=groundBananas.length+ledges.length*2+secretBananas.length;
