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
// Gilded relic frame: dark leather, aged brass, fine diamond caps, red enamel health.
function diamond(g,x,y,r,color=0xd8b36d){if(g.fillPoints){g.fillStyle(color,1).fillPoints([{x:x-r,y},{x,y:y-r},{x:x+r,y},{x,y:y+r}],true);g.fillStyle(0x422823,1).fillPoints([{x:x-r/2,y},{x,y:y-r/2},{x:x+r/2,y},{x,y:y+r/2}],true);}}
export function hudPlate(g,x,y,w,h,accent=0xd4a950){
 g.fillStyle(0x080508,.75).fillRoundedRect(x+3,y+4,w,h,7);
 g.fillStyle(0x1c1319,.91).fillRoundedRect(x,y,w,h,7);
 g.lineStyle(2,0xb68d52,.95).strokeRoundedRect(x,y,w,h,7);
 g.lineStyle(1,0x6f4a37,.9).strokeRoundedRect(x+4,y+4,w-8,h-8,5);
 for(const [dx,dy] of [[7,7],[w-7,7],[7,h-7],[w-7,h-7]])diamond(g,x+dx,y+dy,6,accent);
}
export function meter(g,x,y,w,h,value,color,{reverse=false,trail=value}={}){
 const f=clamp01(value),t=Math.max(f,clamp01(trail));
 g.fillStyle(0x110b11,.98).fillRoundedRect(x-4,y-4,w+8,h+8,3);
 g.fillStyle(0x35202a,.98).fillRoundedRect(x,y,w,h,2);
 const fill=(fraction,c)=>{const width=w*fraction;if(width>0)g.fillStyle(c,1).fillRect(reverse?x+w-width:x,y+2,width,Math.max(1,h-4));};
 fill(t,0xf0b078);fill(f,color);
 if(f>0){const fx=reverse?x+w-w*f:x;g.fillStyle(0xffe7b3,.43).fillRect(fx,y+2,w*f,Math.min(3,h-4));if(h>=18)g.fillStyle(0x33091c,.35).fillRect(fx,y+h-7,w*f,5);}
 g.lineStyle(2,0xd1ad66,.98).strokeRoundedRect(x,y,w,h,2);
 diamond(g,x-2,y+h/2,h>=18?6:4);diamond(g,x+w+2,y+h/2,h>=18?6:4);
}
export function bananaSeal(g,x,y,r=13){g.fillStyle(0x2a1b15,.98).fillCircle(x,y,r);g.lineStyle(2,0xd3ad66,1).strokeCircle(x,y,r);const pts=[[-.49,-.54],[-.50,-.12],[-.32,.25],[.02,.42],[.38,.36],[.59,.09]];for(const [width,color] of [[6,0x774418],[4,0xffce55],[1.4,0xfff2bd]]){g.lineStyle(width,color,1);for(let i=1;i<pts.length;i++)g.lineBetween(x+pts[i-1][0]*r,y+pts[i-1][1]*r,x+pts[i][0]*r,y+pts[i][1]*r);}g.fillStyle(0xf4e5ac,1).fillCircle(x-r*.48,y-r*.58,1.8);}
export function screenShade(scene,w,h,depth=15){const g=scene.add.graphics().setScrollFactor(0).setDepth(depth);g.fillGradientStyle(0x080d19,0x080d19,0x080d19,0x080d19,.56,.56,0,0).fillRect(0,0,w,122);g.fillGradientStyle(0x080d19,0x080d19,0x080d19,0x080d19,0,0,.76,.76).fillRect(0,h-142,w,142);return g;}
export function portrait(scene,key,x,y,accent,size=58,depth=26){const plate=scene.add.rectangle(x,y,size+12,size+12,0x26191e,.98).setScrollFactor(0).setDepth(depth).setStrokeStyle(3,0xd3ae65,.95);const image=scene.add.image(x,y,key).setScrollFactor(0).setDepth(depth+1);const scale=Math.min(size/image.width,size/image.height);image.setScale(scale);return {plate,image};}
// A fixed pool of small atmospheric motes. No creation per frame, no game physics.
export class Atmosphere{
 constructor(scene,w,h,{count=16,color=0xffdc93,depth=-8}={}){this.w=w;this.h=h;this.motes=Array.from({length:count},(_,i)=>({x:(i*197+41)%w,y:90+(i*137)%(h-180),speed:9+(i%5)*5,phase:i*1.7,node:scene.add.circle(0,0,1.3+i%3*.65,color,.35).setScrollFactor(0).setDepth(depth)}));this.t=0;this.quality=null;}
 update(dt){const low=settings.graphics==='low';const count=low?Math.ceil(this.motes.length/3):this.motes.length;if(this.quality!==low){this.quality=low;this.motes.forEach((m,i)=>m.node.setVisible?.(i<count));}this.t+=dt;for(let i=0;i<count;i++){const m=this.motes[i];m.x=(m.x+m.speed*dt)%this.w;m.node.setPosition(m.x,m.y+Math.sin(this.t*.7+m.phase)*13).setAlpha(.17+.15*(1+Math.sin(this.t*1.1+m.phase)));}}
 tint(color){for(const m of this.motes)m.node.setFillStyle(color);}
}
export function syncShadow(shadow,x,y,floor){const gap=Math.max(0,floor-y);shadow.setPosition(x,floor+2).setAlpha(.29*Math.max(.12,1-gap/300)).setScale(1-Math.min(.48,gap/550),1-Math.min(.36,gap/650));}
