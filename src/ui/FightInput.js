import {joystickVector,joystickActions,emblem} from './RelicControls.js';
/** MONKEY MIND III | MODULE
 * Keyboard bindings (CODE), mobile button positions, input buffering and touch handling.
 * Customization map: docs/CUSTOMIZATION.md
 */
// One shared input path for both keyboard and on-screen buttons.
const CODE={KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',KeyW:'jump',ArrowUp:'jump',Space:'jump',KeyS:'guard',ArrowDown:'guard',KeyI:'guard',ShiftLeft:'dash',ShiftRight:'dash',KeyJ:'attack',KeyK:'heavy',KeyL:'skill',KeyU:'shoot',KeyO:'ultimate'};
const ACTIONS=['left','right','jump','guard','dash','attack','heavy','skill','shoot','ultimate'];
const TAPS=new Set(['jump','dash','attack','heavy','skill','shoot','ultimate']);
const REPEAT=new Set(['attack','heavy','shoot']);
// Editable arcade control layout. Coordinates are logical game pixels.
export const CONTROL_LAYOUT=[
 ['left',64,655,48,'LEFT','A / ←',0x5ed7f2],['right',174,655,48,'RIGHT','D / →',0x5ed7f2],
 ['dash',64,545,48,'DASH','SHIFT',0x5ed7f2],['guard',174,545,48,'GUARD','I / S',0x5ed7f2],
 ['jump',985,655,48,'JUMP','SPACE',0x5ed7f2],['attack',1095,655,48,'SLASH','J',0xffd16b],['heavy',1205,655,48,'HEAVY','K',0xff946c],
 ['shoot',985,545,48,'SHOT','U',0x81e9a2],['skill',1095,545,48,'SKILL','L',0xc4a2ff],['ultimate',1205,545,48,'ULT','O',0xffd16b]
];
// Each icon is a collection of polylines in a 32×32 coordinate space.
export const CONTROL_ICONS={
 left:[[[19,5],[8,16],[19,27]],[[8,16],[27,16]]],right:[[[13,5],[24,16],[13,27]],[[5,16],[24,16]]],
 jump:[[[5,13],[16,3],[27,13]],[[16,3],[16,26]],[[8,29],[24,29]]],guard:[[[16,3],[28,7],[26,19],[16,29],[6,19],[4,7],[16,3]],[[10,15],[15,20],[23,11]]],
 dash:[[[3,5],[15,16],[3,27]],[[15,5],[27,16],[15,27]]],attack:[[[4,28],[23,9],[29,3],[27,13],[8,28]],[[4,18],[14,28]]],
 heavy:[[[5,28],[19,14]],[[13,5],[20,2],[30,12],[23,19],[13,9],[13,5]],[[4,20],[12,28]]],
 shoot:[[[5,10],[23,10],[29,16],[23,22],[5,22],[5,10]],[[1,16],[10,16]],[[24,4],[29,4]],[[24,28],[29,28]]],
 skill:[[[16,2],[19,12],[30,16],[19,20],[16,30],[12,20],[2,16],[12,12],[16,2]]],ultimate:[[[18,2],[5,18],[15,18],[12,30],[28,12],[17,12],[18,2]]]
};

export function makeFightInput(scene,W,H){
 const keyboardHeld=new Map(),pointerHeld=new Map(),movementPointers=new Set(),pending=new Map(),lastAccepted=new Map(),buttons=[];
 const now=()=>scene.time.now;
 const inputClock=()=>Number.isFinite(scene.combatNow)?scene.combatNow:now();
 const held=a=>[...keyboardHeld.values(),...pointerHeld.values()].includes(a);
 const queue=a=>{if(TAPS.has(a))pending.set(a,inputClock()+(a==='jump'?200:450));};
 function down(e){const a=CODE[e.code];if(!a||scene.menuOpening||scene.finished||scene.sceneFailed)return;e.preventDefault();if(e.repeat)return;if(!keyboardHeld.has(e.code)){keyboardHeld.set(e.code,a);queue(a);}}
 function up(e){if(CODE[e.code]){e.preventDefault();keyboardHeld.delete(e.code);}}
 let resetStick=()=>{};
 function clear(){keyboardHeld.clear();pointerHeld.clear();movementPointers.clear();pending.clear();lastAccepted.clear();resetStick();}
 const release=p=>{pointerHeld.delete(p.id);movementPointers.delete(p.id);};
 const visibility=()=>{if(globalThis.document?.hidden)clear();};
 const canvas=scene.game.canvas;
 canvas?.addEventListener('touchcancel',clear);canvas?.addEventListener('pointercancel',clear);canvas?.addEventListener('lostpointercapture',clear);globalThis.document?.addEventListener('visibilitychange',visibility);
 window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);
 scene.input.on('pointerup',release);scene.input.on('pointerupoutside',release);
 scene.game.events.on('blur',clear);
 const text=(x,y,t,size,color='#fff4df')=>scene.add.text(x,y,t,{fontFamily:'Rajdhani, Arial, sans-serif',fontSize:`${size}px`,fontStyle:'bold',color,stroke:'#111823',strokeThickness:2}).setOrigin(.5).setScrollFactor(0).setDepth(102);
 const status=text(W/2,H-100,'',22,'#fff0a0');let noticeUntil=0;
 let dock=null,portrait=false,pauseHandler=null;const domButtons=new Map();
 const allowed=()=>!scene.menuOpening&&!scene.finished&&!scene.sceneFailed&&!scene.transition&&!scene.cinematic?.active;
 function press(id,action){if(!allowed())return;pointerHeld.set(id,action);if(action==='left'||action==='right')movementPointers.add(id);queue(action);}
 function button(x,y,r,name,key,action,accent){
  const halo=scene.add.circle(x,y,r+4,0x08121d,.72).setStrokeStyle(2,accent,.55).setScrollFactor(0).setDepth(100);
  const disk=scene.add.circle(x,y,r,0x121c31,.87).setStrokeStyle(3,accent,.92).setScrollFactor(0).setDepth(101).setInteractive({useHandCursor:true});
  const title=text(x,y+13,name,21),shortcut=text(x,y+33,key,12,'#c4d3df');
  let icon=null;
  if(scene.add.graphics){icon=scene.add.graphics().setScrollFactor(0).setDepth(102);icon.lineStyle(3.4,accent,1);for(const line of CONTROL_ICONS[action])for(let i=1;i<line.length;i++)icon.lineBetween(x+line[i-1][0]-16,y-19+line[i-1][1]-16,x+line[i][0]-16,y-19+line[i][1]-16);}
  disk.on('pointerdown',p=>press(p.id,action));
  disk.on('pointerover',p=>{if(allowed()&&p.isDown&&movementPointers.has(p.id)&&(action==='left'||action==='right'))pointerHeld.set(p.id,action);});
  disk.on('pointerup',release);disk.on('pointerout',p=>{if(movementPointers.has(p.id)&&pointerHeld.get(p.id)===action)pointerHeld.delete(p.id);});
  buttons.push({bg:disk,halo,accent,action,title,shortcut,icon,visual:null,x,y,r});
 }
 for(const [action,x,y,r,name,key,accent] of CONTROL_LAYOUT)button(x*W/1280,y*H/720,r,name,key,action,accent);
 // Real browser: independent pointer-captured joystick and ability cluster.
 // Phaser circles remain a fallback when there is no DOM canvas (keyboard/test environments).
 const doc=globalThis.document;
 const media=globalThis.window?.matchMedia?.('(orientation: portrait) and (max-width: 700px) and (min-height: 480px)');
 let rectKey='',wasBlocked=false,stickId=null,stickUp=false;
 const updateDock=()=>{
  if(!dock)return;
  const next=!!media?.matches;
  if(next!==portrait){clear();portrait=next;rectKey='';dock.classList.toggle('portrait',portrait);}
  const hidden=!!(scene.menuOpening||scene.finished||scene.sceneFailed||scene.transition);
  const blocked=!allowed();if(blocked&&!wasBlocked)clear();wasBlocked=blocked;
  if(dock.hidden!==hidden){dock.hidden=hidden;clear();globalThis.window?.dispatchEvent?.(new Event('resize'));}
  if(!portrait&&!hidden){const r=canvas.getBoundingClientRect();const key=[r.left,r.top,r.width,r.height].join(':');if(key!==rectKey){rectKey=key;for(const [k,v] of Object.entries({left:r.left,top:r.top,width:r.width,height:r.height}))dock.style.setProperty('--play-'+k,v+'px');}}
 };
 if(doc?.createElement&&media&&doc.body&&canvas?.getBoundingClientRect){
  dock=doc.createElement('div');dock.className='mm-relic-controls mm-touch-dock';dock.hidden=false;
  const heading=doc.createElement('div');heading.className='mm-relic-heading';heading.textContent='RELIC CONTROLS';
  const pause=doc.createElement('button');pause.type='button';pause.textContent='Ⅱ  PAUSE';pause.addEventListener('click',()=>pauseHandler?.());heading.appendChild(pause);dock.appendChild(heading);
  const groups=doc.createElement('div');groups.className='mm-relic-groups';dock.appendChild(groups);
  const left=doc.createElement('div'),right=doc.createElement('div');left.className='mm-relic-left';right.className='mm-relic-right';groups.append(left,right);
  const stick=doc.createElement('div');stick.className='mm-joystick';stick.setAttribute('role','group');stick.setAttribute('aria-label','Drag to move, up to jump, down to guard');
  const knob=doc.createElement('div');knob.className='mm-stick-knob';stick.appendChild(knob);left.appendChild(stick);
  const aux=doc.createElement('div');aux.className='mm-relic-aux';left.appendChild(aux);
  resetStick=()=>{if(stickId!==null){pointerHeld.delete('joy-x:'+stickId);pointerHeld.delete('joy-y:'+stickId);}stickId=null;stickUp=false;knob.style.setProperty('--dx','0px');knob.style.setProperty('--dy','0px');};
  const move=e=>{if(stickId!==e.pointerId)return;if(!allowed()){resetStick();return;}const r=stick.getBoundingClientRect(),radius=Math.min(r.width,r.height)*.35;const v=joystickVector(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2,radius);knob.style.setProperty('--dx',v.x*radius+'px');knob.style.setProperty('--dy',v.y*radius+'px');const a=joystickActions(v.x,v.y,stickUp);const x='joy-x:'+stickId,y='joy-y:'+stickId;if(a.horizontal)pointerHeld.set(x,a.horizontal);else pointerHeld.delete(x);if(a.guard)pointerHeld.set(y,'guard');else pointerHeld.delete(y);if(a.up&&!stickUp)queue('jump');stickUp=a.up;};
  stick.addEventListener('pointerdown',e=>{e.preventDefault();if(stickId!==null||!allowed())return;stickId=e.pointerId;try{stick.setPointerCapture(e.pointerId);}catch{}move(e);});stick.addEventListener('pointermove',move);
  for(const evt of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(evt,e=>{if(stickId===e.pointerId)resetStick();});
  for(const action of ['dash','guard','shoot','skill','ultimate','jump','attack','heavy']){
   const row=CONTROL_LAYOUT.find(v=>v[0]===action);const el=doc.createElement('button');el.type='button';el.dataset.action=action;el.setAttribute('aria-label',row[4]+' ('+row[5]+')');const color='#'+row[6].toString(16).padStart(6,'0');el.style.setProperty('--accent',color);
   el.innerHTML=emblem(action,color);const label=doc.createElement('span');label.className='mm-ability-label';label.textContent=row[4];el.appendChild(label);const state=doc.createElement('small');state.className='mm-ability-state';el.appendChild(state);
   const id=e=>'dock:'+e.pointerId;el.addEventListener('pointerdown',e=>{e.preventDefault();if(!allowed())return;try{el.setPointerCapture(e.pointerId);}catch{}press(id(e),action);});
   for(const evt of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(evt,e=>release({id:id(e)}));
   (['dash','guard'].includes(action)?aux:right).appendChild(el);domButtons.set(action,el);
  }
  doc.body.appendChild(dock);for(const b of buttons)for(const o of [b.bg,b.halo,b.title,b.shortcut,b.icon])o?.setVisible?.(false);
  media.addEventListener?.('change',updateDock);scene.events.on('pause',updateDock);scene.events.on('resume',updateDock);updateDock();
 }
 function tell(message,ms=1000){status.setText(message);noticeUntil=now()+ms;}
 function consume(a){pending.delete(a);lastAccepted.set(a,inputClock());}
 function sample(){updateDock();const out={};for(const a of ACTIONS){out[a]=held(a);if(pending.has(a)&&pending.get(a)<inputClock())pending.delete(a);out[a+'Pressed']=pending.has(a)||(REPEAT.has(a)&&out[a]&&inputClock()-(lastAccepted.get(a)??-Infinity)>=180);}
  for(const b of buttons){const active=!!(out[b.action]||out[b.action+'Pressed']);const ready=b.action==='ultimate'&&Number(scene.energy)>=100;const visual=`${active}:${ready}`;if(b.visual!==visual){b.visual=visual;b.bg.setFillStyle(active?0x394b64:ready?0x655024:0x121c31,active?1:ready?.98:.87);b.halo.setStrokeStyle(ready?5:active?4:2,b.accent,active||ready?1:.55);const el=domButtons.get(b.action);el?.classList.toggle('active',active);el?.classList.toggle('ready',ready);b.title.setColor(active?'#ffffff':ready?'#ffdf87':'#fff4df');}}
  if(dock){for(const [a,el] of domButtons){const state=el.querySelector('.mm-ability-state');const remaining=Math.max(0,((scene.player?.dashReady??scene.dashReady??0)-inputClock())/1000);const text=a==='ultimate'?(Number(scene.energy)>=100?'READY':Math.floor(Number(scene.energy)||0)+'%'):a==='shoot'?String(scene.ammo??0):a==='dash'&&remaining>0?remaining.toFixed(1)+'s':'';if(state.textContent!==text)state.textContent=text;el.classList.toggle('depleted',a==='shoot'&&scene.ammo===0);}}
  if(now()>noticeUntil&&status.text)status.setText('');return out;}
 scene.events.once('shutdown',()=>{if(dock){dock.remove();globalThis.window?.dispatchEvent?.(new Event('resize'));}media?.removeEventListener?.('change',updateDock);scene.events.off('pause',updateDock);scene.events.off('resume',updateDock);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);scene.input.off('pointerup',release);scene.input.off('pointerupoutside',release);scene.game.events.off('blur',clear);canvas?.removeEventListener('touchcancel',clear);canvas?.removeEventListener('pointercancel',clear);canvas?.removeEventListener('lostpointercapture',clear);globalThis.document?.removeEventListener('visibilitychange',visibility);clear();});
 return {sample,consume,tell,clear,buttons,setPauseHandler:fn=>{pauseHandler=fn;}};
}
