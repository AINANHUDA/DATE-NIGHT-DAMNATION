/** MONKEY MIND III | MODULE
 * Combat clock, combo cancellation, hit-stop, projectile intersections and impact feedback.
 * Customization map: docs/CUSTOMIZATION.md
 */
// Shared combat timing. Simulation deadlines use this clock; input uses wall time.
export const BASIC = ['attack1','attack2','attack3'];
export function initCombat(scene){scene.combatNow=0;scene.freezeUntil=0;scene.frozenActors=new Set();}
export function combatFrame(scene,delta){
 if(scene.time.now<scene.freezeUntil)return 0;
 for(const sprite of scene.frozenActors){if(sprite.active)sprite.anims.resume();}
 scene.frozenActors.clear();
 const dt=Math.min(Math.max(delta,0),35)/1000;
 scene.combatNow+=dt*1000;return dt;
}
export function impactPause(scene,actors,ms){
 scene.freezeUntil=Math.max(scene.freezeUntil,scene.time.now+ms);
 for(const sprite of actors){if(sprite?.active&&sprite.anims.isPlaying&&!sprite.anims.isPaused){sprite.anims.pause();scene.frozenActors.add(sprite);}}
}
export function canCancel(attack,now){return !!(attack?.confirmed&&BASIC.includes(attack.state)&&now>=attack.cancelAt);}
export function canStart(f,now,state){return f.attack?((BASIC.includes(state)||state==='skill1')&&canCancel(f.attack,now)):now>=f.ready;}
export function nextBasic(f,now){return now<= (f.chainUntil??-1)?BASIC[((f.chainIndex??-1)+1)%3]:'attack1';}
export function confirmBasic(f,attack,now){if(!BASIC.includes(attack.state))return;attack.confirmed=true;f.chainIndex=BASIC.indexOf(attack.state);f.chainUntil=now+650;f.ready=Math.min(f.ready,attack.end);}
export function attackTiming(data,emitter){const times=data.frames.map((_,i)=>data.durationsMs?.[i]??1000/data.fps);const index=Math.max(0,Math.min(times.length-1,emitter?.frame??2));const impact=times.slice(0,index).reduce((a,b)=>a+b,0);const duration=times.reduce((a,b)=>a+b,0);return {impact,duration,cancel:Math.min(duration,impact+85)};}
export function strikeDamage(attack){return Math.round(attack.rule.damage*(attack.finisher?1.25:1));}
export function projectileCrosses(previous,next,target,radius){return Math.min(previous,next)<=target+radius&&Math.max(previous,next)>=target-radius;}
export function motionPlayback(sprite,state,vx){const scale=state==='run'?Math.max(.78,Math.min(1.12,Math.abs(vx)/215)):state==='walk'?Math.max(.65,Math.min(1.15,Math.abs(vx)/115)):1;if(sprite.anims.timeScale!==scale)sprite.anims.timeScale=scale;}
export function impactSparks(scene,x,y,dir,strong=false,guard=false){
 const color=guard?0xb6e4ff:strong?0xffb750:0xffe9ac;
 const n=strong?9:5;
 for(let i=0;i<n;i++){const a=(i/(n-1)-.5)*2.5;const dx=dir*Math.cos(a)*(strong?78:44),dy=Math.sin(a)*(strong?78:44);const spark=scene.add.rectangle(x,y,strong?14:10,strong?3:2,color,1).setRotation(Math.atan2(dy,dx)).setDepth(9);scene.tweens.add({targets:spark,x:x+dx,y:y+dy,alpha:0,duration:strong?250:165,ease:'Cubic.Out',onComplete:()=>spark.destroy()});}
}
