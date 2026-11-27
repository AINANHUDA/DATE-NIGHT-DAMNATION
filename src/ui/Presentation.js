/** MONKEY MIND III | MODULE
 * HUD meters, portraits, background sizing, camera smoothing, lighting and particles.
 * Customization map: docs/CUSTOMIZATION.md
 */
import { settings } from '../systems/CampaignProfile.js';
// Presentation helpers. No combat rules or campaign state are changed here.
export const clamp01 = n => Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
export function coverSize(iw,ih,w,h,overscan=1){const scale=Math.max(w/Math.max(1,iw),h/Math.max(1,ih))*overscan;return {width:iw*scale,height:ih*scale};}
export function cover(image,w,h,overscan=1){const size=coverSize(image.width,image.height,w,h,overscan);return image.setDisplaySize(size.width,size.height);}
export function cameraTarget(x,vx,w,end){return Math.max(0,Math.min(end-w,x-w*.44+Math.max(-100,Math.min(100,vx*.38))));}
export function damp(a,b,dt,rate=6){return a+(b-a)*(1-Math.exp(-Math.max(0,dt)*rate));}
export function setTextIfChanged(obj,value){if(obj.text!==value)obj.setText(value);}
// Arcade HUD panel: layered dark glass, a colored edge, and beveled segmented meters.
export function hudPlate(g,x,y,w,h,accent=0xd4a950){
 g.fillStyle(0x02050c,.82).fillRoundedRect(x+3,y+4,w,h,14);
 g.fillStyle(0x101b2c,.93).fillRoundedRect(x,y,w,h,14);
 g.lineStyle(2,accent,.85).strokeRoundedRect(x,y,w,h,14);
 g.fillStyle(accent,.85).fillRoundedRect(x+8,y+7,5,h-14,2);
}
export function meter(g,x,y,w,h,value,color,{reverse=false,trail=value}={}){
 const f=clamp01(value),t=Math.max(f,clamp01(trail));
 g.fillStyle(0x03070e,.98).fillRoundedRect(x-3,y-3,w+6,h+6,5);
 g.fillStyle(0x253247,.95).fillRoundedRect(x,y,w,h,4);
 const fill=(fraction,c)=>{const width=w*fraction;if(width>0)g.fillStyle(c,1).fillRect(reverse?x+w-width:x,y+2,width,Math.max(1,h-4));};
 fill(t,0xf7a778);fill(f,color);
 if(f>0){const fx=reverse?x+w-w*f:x;g.fillStyle(0xffffff,.35).fillRect(fx,y+2,w*f,Math.min(4,h-4));if(h>=18)g.fillStyle(0x03070e,.23).fillRect(fx,y+h-7,w*f,5);}
 if(h>=18&&g.lineBetween)for(let i=1;i<10;i++)g.lineStyle(1,0x07101e,.44).lineBetween(x+w*i/10,y+2,x+w*i/10,y+h-2);
 g.lineStyle(2,0x9caac0,.88).strokeRoundedRect(x,y,w,h,4);
}
export function screenShade(scene,w,h,depth=15){const g=scene.add.graphics().setScrollFactor(0).setDepth(depth);g.fillGradientStyle(0x080d19,0x080d19,0x080d19,0x080d19,.56,.56,0,0).fillRect(0,0,w,122);g.fillGradientStyle(0x080d19,0x080d19,0x080d19,0x080d19,0,0,.76,.76).fillRect(0,h-142,w,142);return g;}
export function portrait(scene,key,x,y,accent,size=58,depth=26){const plate=scene.add.rectangle(x,y,size+12,size+12,0x121f32,.98).setScrollFactor(0).setDepth(depth).setStrokeStyle(3,accent,.95);const image=scene.add.image(x,y,key).setScrollFactor(0).setDepth(depth+1);const scale=Math.min(size/image.width,size/image.height);image.setScale(scale);return {plate,image};}
// A fixed pool of small atmospheric motes. No creation per frame, no game physics.
export class Atmosphere{
 constructor(scene,w,h,{count=16,color=0xffdc93,depth=-8}={}){this.w=w;this.h=h;this.motes=Array.from({length:count},(_,i)=>({x:(i*197+41)%w,y:90+(i*137)%(h-180),speed:9+(i%5)*5,phase:i*1.7,node:scene.add.circle(0,0,1.3+i%3*.65,color,.35).setScrollFactor(0).setDepth(depth)}));this.t=0;this.quality=null;}
 update(dt){const low=settings.graphics==='low';const count=low?Math.ceil(this.motes.length/3):this.motes.length;if(this.quality!==low){this.quality=low;this.motes.forEach((m,i)=>m.node.setVisible?.(i<count));}this.t+=dt;for(let i=0;i<count;i++){const m=this.motes[i];m.x=(m.x+m.speed*dt)%this.w;m.node.setPosition(m.x,m.y+Math.sin(this.t*.7+m.phase)*13).setAlpha(.17+.15*(1+Math.sin(this.t*1.1+m.phase)));}}
 tint(color){for(const m of this.motes)m.node.setFillStyle(color);}
}
export function syncShadow(shadow,x,y,floor){const gap=Math.max(0,floor-y);shadow.setPosition(x,floor+2).setAlpha(.29*Math.max(.12,1-gap/300)).setScale(1-Math.min(.48,gap/550),1-Math.min(.36,gap/650));}
