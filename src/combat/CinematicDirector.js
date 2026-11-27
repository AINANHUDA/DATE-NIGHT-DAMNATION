/** MONKEY MIND III | MODULE
 * Ultimate cut-ins, combat freeze and chapter transitions.
 * Customization map: docs/CUSTOMIZATION.md
 */
// Visual presentation only. Combat deadlines remain on the simulation clock.
export const ULTIMATE_TITLES = {
 ainan:'SOLAR BANANA OVERDRIVE',
 'mini-maliha':'COSMIC NOVA',
 maliha:'QUEEN OF CHAOS'
};
const ACCENTS={ainan:0xffd17a,'mini-maliha':0xb8a0ff,maliha:0xff9a9e};
const TAPS=['jump','dash','attack','heavy','skill','shoot','ultimate'];
const clamp01=x=>Math.max(0,Math.min(1,x));
export function cutInProgress(elapsed,duration){const t=clamp01(elapsed/duration);return {enter:1-Math.pow(1-clamp01(t/.22),3),exit:clamp01((t-.72)/.28),done:t>=1};}
export class CinematicDirector {
 constructor(scene,width,height){this.s=scene;this.w=width;this.h=height;this.sequence=null;scene.events.once('shutdown',()=>this.dispose(false));}
 get active(){return this.sequence!==null;}
 start(id,actors,{duration=820,title=ULTIMATE_TITLES[id]}={}){
  if(this.active||!this.s.textures.exists(`${id}-cutin`))return false;
  const s=this.s,w=this.w,h=this.h,color=ACCENTS[id]??0xffd17a;
  const paused=new Set();
  for(const sprite of actors){if(sprite?.active&&sprite.anims.isPlaying&&!sprite.anims.isPaused){sprite.anims.pause();paused.add(sprite);}}
  const fix=(obj,depth)=>obj.setScrollFactor(0).setDepth(depth);
  const shade=fix(s.add.rectangle(w/2,h/2,w,h,0x080a16,.72),200);
  const art=fix(s.add.image(w/2,h/2-18,`${id}-cutin`),201);
  // Retain original artwork proportions; do not stretch or crop faces.
  const scale=Math.min(w/art.width,(h-160)/art.height);art.setScale(scale).setAlpha(0);
  const top=fix(s.add.rectangle(w/2,44,w,88,0x070b15,1),202);
  const bottom=fix(s.add.rectangle(w/2,h-60,w,120,0x070b15,1),202);
  const accent=fix(s.add.rectangle(w/2,h-120,w,3,color,1),203);
  const label=fix(s.add.text(w/2,42,id.replace(/-/g,' ').toUpperCase()+'  /  ULTIMATE',{fontFamily:'Arial',fontSize:'19px',fontStyle:'bold',color:'#f1e7d4',letterSpacing:4}).setOrigin(.5),204);
  const name=fix(s.add.text(w/2,h-65,title??'ULTIMATE',{fontFamily:'Georgia',fontSize:'42px',fontStyle:'bold',color:'#fff1d5',stroke:'#161221',strokeThickness:4,wordWrap:{width:w-60},align:'center'}).setOrigin(.5),204);
  const objects=[shade,art,top,bottom,accent,label,name];
  this.sequence={objects,paused,art,shade,top,bottom,accent,label,name,scale,duration,start:s.time.now};
  if(id==='ainan')s.audio?.say('hero-ultimate');s.audio?.cue('ultimate',.55);this.render(0);return true;
 }
 render(elapsed){const q=this.sequence;if(!q)return;const {enter,exit}=cutInProgress(elapsed,q.duration);const alpha=1-exit;const w=this.w,h=this.h;
  q.shade.setAlpha(.72*enter*alpha);q.art.setAlpha(enter*alpha).setX(w/2+(1-enter)*w*.24-exit*w*.18).setScale(q.scale*(.97+.03*enter));
  q.top.setY(-44+88*enter-88*exit);q.bottom.setY(h+60-120*enter+120*exit);q.accent.setAlpha(enter*alpha);q.label.setAlpha(enter*alpha);q.name.setAlpha(enter*alpha).setY(h-65+(1-enter)*35+exit*35);
 }
 // Return true on the closing frame too, to prevent a large simulation delta.
 update(){const q=this.sequence;if(!q)return false;const elapsed=this.s.time.now-q.start;this.render(elapsed);if(elapsed>=q.duration)this.dispose(true);return true;}
 dispose(resume=true){const q=this.sequence;if(!q)return;this.sequence=null;for(const obj of q.objects)if(obj.active)obj.destroy();if(resume){for(const sprite of q.paused)if(sprite.active)sprite.anims.resume();for(const action of TAPS)this.s.inputState?.consume(action);}}
}
// Short visible wipe, with an idempotent timer fallback if tween completion is missed.
export function chapterWipe(scene,w,h,complete){let done=false;const finish=()=>{if(done)return;done=true;complete();};scene.audio?.cue('gate',.30);const cover=scene.add.rectangle(-w/2,h/2,w,h,0x121a2a,1).setScrollFactor(0).setDepth(300);const trim=scene.add.rectangle(0,h/2,4,h,0xd4a950,1).setScrollFactor(0).setDepth(301);scene.tweens.add({targets:[cover,trim],x:`+=${w}`,duration:320,ease:'Cubic.InOut',onComplete:finish});scene.time.delayedCall(420,finish);}
export function chapterReveal(scene,w,h,title){const strip=scene.add.rectangle(w/2,h/2,w,76,0x101522,.88).setScrollFactor(0).setDepth(150);const text=scene.add.text(w/2,h/2,title,{fontFamily:'Georgia',fontSize:'29px',color:'#ffe3a5',fontStyle:'bold',align:'center'}).setOrigin(.5).setScrollFactor(0).setDepth(151);scene.tweens.add({targets:[strip,text],alpha:0,delay:550,duration:360,onComplete:()=>{strip.destroy();text.destroy();}});}
