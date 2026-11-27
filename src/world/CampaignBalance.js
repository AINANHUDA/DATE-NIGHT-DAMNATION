/** MONKEY MIND III | MODULE
 * Checkpoint healing, boss-entry supplies and nearest-banana hints.
 * Customization map: docs/CUSTOMIZATION.md
 */
// Campaign supplies and route guidance. No rendering or browser dependencies.
export const supplies=Object.freeze({
 easy:{checkpointHp:85,gateHp:85,gateAmmo:8},
 normal:{checkpointHp:65,gateHp:70,gateAmmo:5},
 hard:{checkpointHp:50,gateHp:55,gateAmmo:3}
});
const rules=d=>supplies[d]||supplies.normal;
export function checkpointHealth(hp,difficulty){return Math.min(100,Math.max(hp,rules(difficulty).checkpointHp));}
export function gateSupplies(hp,ammo,difficulty){const r=rules(difficulty);return {hp:Math.min(100,Math.max(hp,r.gateHp)),ammo:Math.max(ammo,r.gateAmmo)};}
export function nextBanana(bananas,x,y){
 let best=null,score=Infinity;
 for(const b of bananas){if(!b.g?.active)continue;const d=Math.abs(b.x-x)+Math.abs(b.y-(y-62))*.7;if(d<score){best=b;score=d;}}
 if(!best)return null;
 const dx=best.x-x;
 return {direction:Math.abs(dx)<38?'ABOVE / NEARBY':dx<0?'LEFT':'RIGHT',distance:Math.round(Math.abs(dx)),x:best.x,y:best.y};
}
