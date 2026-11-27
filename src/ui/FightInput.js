/** MONKEY MIND III | MODULE
 * Keyboard bindings (CODE), mobile button positions, input buffering and touch handling.
 * Customization map: docs/CUSTOMIZATION.md
 */
// One shared input path for both keyboard and on-screen buttons.
const CODE={KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',KeyW:'jump',ArrowUp:'jump',Space:'jump',KeyS:'guard',ArrowDown:'guard',KeyI:'guard',ShiftLeft:'dash',ShiftRight:'dash',KeyJ:'attack',KeyK:'heavy',KeyL:'skill',KeyU:'shoot',KeyO:'ultimate'};
const ACTIONS=['left','right','jump','guard','dash','attack','heavy','skill','shoot','ultimate'];
const TAPS=new Set(['jump','dash','attack','heavy','skill','shoot','ultimate']);
const REPEAT=new Set(['attack','heavy','shoot']);
export function makeFightInput(scene,W,H){
 const keyboardHeld=new Map(),pointerHeld=new Map(),movementPointers=new Set(),pending=new Map(),lastAccepted=new Map(),buttons=[];
 const now=()=>scene.time.now;
 const inputClock=()=>Number.isFinite(scene.combatNow)?scene.combatNow:now();
 const held=a=>[...keyboardHeld.values(),...pointerHeld.values()].includes(a);
 const queue=a=>{if(TAPS.has(a))pending.set(a,inputClock()+(a==='jump'?200:450));};
 function down(e){const a=CODE[e.code];if(!a||scene.menuOpening||scene.finished||scene.sceneFailed)return;e.preventDefault();if(e.repeat)return;if(!keyboardHeld.has(e.code)){keyboardHeld.set(e.code,a);queue(a);}}
 function up(e){if(CODE[e.code]){e.preventDefault();keyboardHeld.delete(e.code);}}
 function clear(){keyboardHeld.clear();pointerHeld.clear();movementPointers.clear();pending.clear();lastAccepted.clear();}
 const release=p=>{pointerHeld.delete(p.id);movementPointers.delete(p.id);};
 const visibility=()=>{if(globalThis.document?.hidden)clear();};
 const canvas=scene.game.canvas;
 canvas?.addEventListener('touchcancel',clear);canvas?.addEventListener('pointercancel',clear);canvas?.addEventListener('lostpointercapture',clear);globalThis.document?.addEventListener('visibilitychange',visibility);
 window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);
 scene.input.on('pointerup',release);scene.input.on('pointerupoutside',release);
 scene.game.events.on('blur',clear);
 const text=(x,y,t,size,color='#fff4df')=>scene.add.text(x,y,t,{fontFamily:'Rajdhani, Arial, sans-serif',fontSize:`${size}px`,fontStyle:'bold',color,stroke:'#111823',strokeThickness:2}).setOrigin(.5).setScrollFactor(0).setDepth(102);
 const status=text(W/2,H-78,'',22,'#fff0a0');let noticeUntil=0;
 function button(x,y,r,name,key,action){
  const accent=['attack','heavy','skill','shoot','ultimate'].includes(action)?0xe6bb6b:0xa3c6dd;
  const halo=scene.add.circle(x,y,r+4,0x08121d,.24).setStrokeStyle(1,accent,.35).setScrollFactor(0).setDepth(100);
  const disk=scene.add.circle(x,y,r,0x101a28,.58).setStrokeStyle(2,accent,.75).setScrollFactor(0).setDepth(101).setInteractive({useHandCursor:true});
  const title=text(x,y-5,name,name.length>5?15:19),shortcut=text(x,y+15,key,12,'#c4d3df');
  disk.on('pointerdown',p=>{if(scene.menuOpening||scene.finished||scene.sceneFailed)return;pointerHeld.set(p.id,action);if(action==='left'||action==='right')movementPointers.add(p.id);queue(action);});
  disk.on('pointerover',p=>{if(!scene.menuOpening&&!scene.finished&&!scene.sceneFailed&&p.isDown&&movementPointers.has(p.id)&&(action==='left'||action==='right'))pointerHeld.set(p.id,action);});
  disk.on('pointerup',release);disk.on('pointerout',p=>{if(pointerHeld.get(p.id)===action)pointerHeld.delete(p.id);});
  buttons.push({bg:disk,halo,accent,action,title,shortcut,visual:null});
 }
 // Keep the centre of the playfield unobstructed. Two thumb clusters.
 const bottom=H-52, top=H-130;
 button(56,bottom,34,'◀','A / ←','left');button(140,bottom,34,'▶','D / →','right');
 button(56,top,30,'DASH','SHIFT','dash');button(140,top,30,'GUARD','I','guard');
 button(W-225,bottom,35,'JUMP','SPACE','jump');button(W-140,bottom,35,'SLASH','J','attack');button(W-55,bottom,35,'HEAVY','K','heavy');
 button(W-225,top,31,'SHOT','U','shoot');button(W-140,top,31,'SKILL','L','skill');button(W-55,top,31,'ULT','O','ultimate');
 function tell(message,ms=1000){status.setText(message);noticeUntil=now()+ms;}
 function consume(a){pending.delete(a);lastAccepted.set(a,inputClock());}
 function sample(){const out={};for(const a of ACTIONS){out[a]=held(a);if(pending.has(a)&&pending.get(a)<inputClock())pending.delete(a);out[a+'Pressed']=pending.has(a)||(REPEAT.has(a)&&out[a]&&inputClock()-(lastAccepted.get(a)??-Infinity)>=180);}
  for(const b of buttons){const active=!!(out[b.action]||out[b.action+'Pressed']);const ready=b.action==='ultimate'&&Number(scene.energy)>=100;const visual=`${active}:${ready}`;if(b.visual!==visual){b.visual=visual;b.bg.setFillStyle(active?0xb78b42:ready?0x655024:0x101a28,active?.93:ready?.87:.58);b.halo.setStrokeStyle(ready?3:1,b.accent,active||ready?.95:.35);b.title.setColor(active?'#ffffff':ready?'#ffdf87':'#fff4df');}}
  if(now()>noticeUntil&&status.text)status.setText('');return out;}
 scene.events.once('shutdown',()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);scene.input.off('pointerup',release);scene.input.off('pointerupoutside',release);scene.game.events.off('blur',clear);canvas?.removeEventListener('touchcancel',clear);canvas?.removeEventListener('pointercancel',clear);canvas?.removeEventListener('lostpointercapture',clear);globalThis.document?.removeEventListener('visibilitychange',visibility);clear();});
 return {sample,consume,tell,clear,buttons};
}
