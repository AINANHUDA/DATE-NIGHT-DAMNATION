/** MONKEY MIND III | MODULE
 * Exploration simulation, enemies, collectibles, player health, level HUD and boss gate.
 * Customization map: docs/CUSTOMIZATION.md
 */
import { cover, cameraTarget, damp, meter, hudPlate, portrait, screenShade, Atmosphere, syncShadow, setTextIfChanged } from '../ui/Presentation.js';
import { checkpointHealth, gateSupplies, nextBanana } from '../world/CampaignBalance.js';
import { markChapter, incomingDamage, settings } from '../systems/CampaignProfile.js';
import { installPause } from './MenuScene.js';
import { AudioDirector, audioSettings } from '../audio/AudioDirector.js';
import { CinematicDirector } from '../combat/CinematicDirector.js';
import { initCombat, combatFrame, impactPause, canStart, nextBasic, confirmBasic, attackTiming, strikeDamage, projectileCrosses, motionPlayback, impactSparks } from '../combat/CombatFlow.js';
import Phaser from 'phaser';
import { GAME_WIDTH as W, GAME_HEIGHT as H } from '../config/gameConfig.js';
import { CHARACTERS } from '../config/assetManifest.js';
import { registerCharacterAnimations, setCharacter, animationKey } from '../characters/CharacterAnimations.js';
import { makeFightInput } from '../ui/FightInput.js';
import { ATTACKS } from '../combat/FightRules.js';
import { MOTION, drive, locomotion } from '../combat/Movement.js';
import { END, GROUND, REQUIRED, TOTAL, zones, checkpointXs, gaps, hazards, enemyHomes, potionHomes, ground, ledges, secrets, groundBananas, secretBananas, groundAt, themeAt, safeGround } from '../world/ExpeditionLayout.js';
export class ChaseScene extends Phaser.Scene {
 constructor(){super('ChaseScene');}
 init(data={}){this.saved=data.checkpoint||null;}
 create(){
  markChapter('chase',{},this.saved);this.audio=new AudioDirector(this);this.cloneTaunted=false;registerCharacterAnimations(this);initCombat(this);this.count=0;this.hp=100;this.finished=false;this.dir=1;this.vx=0;this.vy=0;this.grounded=true;this.jumps=0;this.stunUntil=0;this.damageUntil=0;this.enemies=[];this.bananas=[];this.scroll=0;this.ammo=3;this.energy=0;this.shots=[];this.attack=null;this.ready=0;this.dashUntil=0;this.dashReady=0;this.guard=false;this.combo=0;this.comboUntil=0;this.chainUntil=-1;this.chainIndex=-1;this.moveTime=0;this.moveAxis=0;
  this.potions=[];this.hostile=[];this.usedBananas=new Set(this.saved?.bananas||[]);this.usedPotions=new Set(this.saved?.potions||[]);this.deadEnemies=new Set(this.saved?.enemies||[]);this.checkpoint=this.saved;this.zone=-1;this.oldBg=null;this.hp=this.saved?.hp??100;this.count=this.usedBananas.size;this.ammo=this.saved?.ammo??3;this.energy=this.saved?.energy??0;
  this.bg=cover(this.add.image(W/2,H/2,'forest-bg'),W,H,1.04).setScrollFactor(0).setDepth(-20);this.atmosphere=new Atmosphere(this,W,H,{count:18});screenShade(this,W,H,15);this.hudSignature=null;
  this.cameras.main.setBounds(0,0,END,H);
  this.platforms=[...ground,...ledges.map(([x,y,w])=>({x,y,w})),...secrets];
  this.lastSafeX=this.saved?.x??150;this.secretVisited=new Set();
  for(const p of this.platforms)this.platform(p);
  this.decorateWorld();
  this.hero=this.add.sprite(this.saved?.x??150,GROUND,CHARACTERS.ainan.texture);setCharacter(this.hero,'ainan',152);this.hero.setDepth(4);
  this.heroShadow=this.add.ellipse(this.hero.x,GROUND+2,84,16,0x111520,.29).setDepth(2);this.state='idle';
  for(const p of ledges){this.banana(p[0]+p[2]*.3,p[1]-30);this.banana(p[0]+p[2]*.73,p[1]-30);}
  for(const [x,y] of groundBananas)this.banana(x,y);
  for(const [x,y] of secretBananas)this.banana(x,y);
  for(const x of potionHomes)this.potion(x,GROUND-40);
  for(const x of enemyHomes){if(this.deadEnemies.has(x))continue;const i=enemyHomes.indexOf(x);const sp=this.add.sprite(x,GROUND,CHARACTERS['mini-maliha'].texture);setCharacter(sp,'mini-maliha',110);sp.setTint([0xd1c4ff,0xffbbb0,0xa9deff][i%3]).setDepth(3).setFlipX(true);this.enemies.push({s:sp,shadow:this.add.ellipse(x,GROUND+2,62,13,0x111520,.28).setDepth(2),x,home:x,segment:groundAt(x),dir:-1,hp:i%3===2?52:36,until:0,impact:0,type:i%3,kind:'',next:0});}
  for(const x of checkpointXs){this.add.image(x,GROUND-75,'fx-cora-feather').setDisplaySize(95,95).setAlpha(.75).setDepth(2);this.add.text(x,GROUND-155,'CHECKPOINT',{fontSize:'17px',color:'#ffe3a1',fontStyle:'bold',stroke:'#132015',strokeThickness:3}).setOrigin(.5);}
  this.add.image(END-160,GROUND-110,'fx-naja-cyclone').setDisplaySize(170,200).setAlpha(.8).setDepth(2);
  this.add.text(END-160,GROUND-246,'BOSS GATE',{fontSize:'21px',fontStyle:'bold',color:'#fff1b8',stroke:'#15151e',strokeThickness:4}).setOrigin(.5);
  this.hud=this.add.graphics().setScrollFactor(0).setDepth(30);
  portrait(this,'ainan-portrait',52,57,0xe2bc76,68,30);this.label=this.add.text(96,12,'',{fontFamily:'Rajdhani, Arial',fontSize:'29px',fontStyle:'bold',color:'#fff0b3',stroke:'#132015',strokeThickness:3}).setScrollFactor(0).setDepth(31);
  this.energyLabel=this.add.text(503,83,'',{fontFamily:'Rajdhani, Arial',fontSize:'20px',fontStyle:'bold',color:'#ffdc89'}).setOrigin(1,.5).setScrollFactor(0).setDepth(31);
  this.resourceLabel=this.add.text(96,102,'',{fontFamily:'Rajdhani, Arial',fontSize:'23px',fontStyle:'bold',color:'#ffe6a2',stroke:'#132015',strokeThickness:2}).setScrollFactor(0).setDepth(31);
  this.goal=this.add.text(W-28,18,'REACH THE GATE  ›',{fontFamily:'Rajdhani, Arial',fontSize:'25px',fontStyle:'bold',color:'#ffffff',stroke:'#132015',strokeThickness:3}).setOrigin(1,0).setScrollFactor(0).setDepth(31);
  this.notice=this.add.text(W/2,108,`Collect ${REQUIRED} bananas • Explore the three regions`,{fontSize:'20px',color:'#fff',stroke:'#14181c',strokeThickness:4}).setOrigin(.5).setScrollFactor(0).setDepth(31);
  this.zoneTitle=this.add.text(W/2,156,'',{fontFamily:'Georgia',fontSize:'30px',fontStyle:'bold',color:'#ffe7b0',stroke:'#142024',strokeThickness:4}).setOrigin(.5).setScrollFactor(0).setDepth(31);this.inputState=makeFightInput(this,W,H);const audioLabel=this.add.text(W/2,H-12,'',{fontSize:'12px',color:'#fff1c9',stroke:'#111827',strokeThickness:2}).setOrigin(.5,1).setScrollFactor(0).setDepth(102).setInteractive({useHandCursor:true});this.audio.onChange=()=>audioLabel.setText(`SOUND ${audioSettings.enabled?'ON':'OFF'} (M)  •  VOICE ${audioSettings.voice?'ON':'OFF'} (V)`);this.audio.onChange();audioLabel.on('pointerdown',()=>this.audio.toggle());this.cinematic=new CinematicDirector(this,W,H);this.updateZone();this.drawHud();this.cameras.main.scrollX=Phaser.Math.Clamp(this.hero.x-W*.4,0,END-W);this.cameras.main.fadeIn(400);installPause(this,W,H);
 }
 platform(p){
  // Split the visible terrain at region boundaries, retaining continuous collision geometry.
  const breaks=[p.x,...zones.map(z=>z.x).filter(x=>x>p.x&&x<p.x+p.w),p.x+p.w];
  const isGround=p.y===GROUND;
  for(let i=0;i<breaks.length-1;i++){
   const x=breaks[i],w=breaks[i+1]-x,theme=themeAt(x);
   for(let offset=0;offset<w;offset+=1024){this.add.tileSprite(x+offset,p.y,Math.min(1024,w-offset),isGround?H-GROUND:50,`terrain-${theme}-${isGround?'ground':'ledge'}`).setOrigin(0,0).setDepth(0);}
  }
  if(!isGround){const g=this.add.graphics().setDepth(-1);g.fillStyle(0x111b24,.25).fillRect(p.x+8,p.y+48,p.w-16,7);}
 }
 decorateWorld(){
  // Subtle scenery behind the characters. Every dangerous edge is visibly marked.
  for(let x=360;x<END-380;x+=280){
   if(!safeGround(x)||checkpointXs.some(c=>Math.abs(c-x)<130))continue;
   const size=44+(x%5)*5;
   this.add.image(x,GROUND,`terrain-${themeAt(x)}-prop`).setOrigin(.5,1).setDisplaySize(size,size).setDepth(1).setAlpha(.95);
  }
  for(const [a,b] of gaps){
   const g=this.add.graphics().setDepth(-2);
   g.fillStyle(0x101622,.9).fillRect(a,GROUND,b-a,H-GROUND);
   g.fillGradientStyle(0x292f40,0x292f40,0x090d16,0x090d16,1,1,1,1).fillRect(a,GROUND,b-a,H-GROUND);
   g.fillStyle(0xe0b875,1).fillRect(a-8,GROUND-4,8,12).fillRect(b,GROUND-4,8,12);
   this.add.text(a-22,GROUND-28,'JUMP  ›',{fontSize:'14px',fontStyle:'bold',color:'#ffe5a5',stroke:'#121822',strokeThickness:3}).setOrigin(1,.5).setDepth(2);
  }
  for(const h of hazards){const g=this.add.graphics().setDepth(2);g.fillStyle(0x382d36,1).fillRect(h.x,GROUND-6,h.w,6);for(let x=h.x;x<h.x+h.w-8;x+=13){g.fillStyle(0x342b35,1).fillTriangle(x,GROUND-5,x+6,GROUND-27,x+13,GROUND-5);g.fillStyle(0xb6b2bd,1).fillTriangle(x+2,GROUND-6,x+6,GROUND-23,x+8,GROUND-6);}}
  for(const p of secrets){this.add.text(p.x+p.w/2,p.y-69,'✦  BONUS ROUTE',{fontSize:'15px',fontStyle:'bold',color:'#ffe19b',stroke:'#181821',strokeThickness:3}).setOrigin(.5).setDepth(2);}
 }
 resetFromFall(){
  this.audio?.cue('fall');this.hp=Math.max(0,this.hp-20);this.attack=null;this.chainUntil=-1;this.guard=false;this.dashUntil=0;this.vx=0;this.vy=0;this.jumps=0;this.grounded=true;
  const x=this.lastSafeX;this.hero.setPosition(x,GROUND);this.stunUntil=this.combatNow+250;this.damageUntil=this.combatNow+1000;
  this.state='';this.pose('hurt');this.inputState.clear();this.inputState.tell('FALL DAMAGE −20 HP',1200);this.cameras.main.shake(120,.004);
 }
 banana(x,y){const id=`${x}:${y}`;if(this.usedBananas.has(id))return;const g=this.add.graphics({x,y}).setDepth(2);const pts=[[-12,-13],[-14,-7],[-13,0],[-9,6],[-3,10],[4,10],[10,8],[15,6]].map(([x,y])=>new Phaser.Math.Vector2(x,y));g.lineStyle(13,0x795027,1).strokePoints(pts);g.lineStyle(9,0xffd34e,1).strokePoints(pts);g.lineStyle(2,0xfff1a1,1).strokePoints(pts.map(p=>new Phaser.Math.Vector2(p.x+1,p.y-2)));this.bananas.push({g,x,y,id});this.tweens.add({targets:g,y:y-7,yoyo:true,repeat:-1,duration:650+((x%4)*55)});}

 pose(state){if(this.state!==state){this.state=state;this.hero.anims.timeScale=1;this.hero.play(animationKey('ainan',state),true);}}
 drawHud(){const progress=Math.floor(Math.min(1,this.hero.x/END)*100);const signature=[this.hp,this.count,this.ammo,Math.floor(this.energy),progress].join(':');if(signature===this.hudSignature)return;this.hudSignature=signature;const g=this.hud;g.clear();hudPlate(g,12,5,510,130,0xe2bc76);meter(g,96,48,406,24,this.hp/100,this.hp<25?0xff667c:0x51d8a0);meter(g,96,81,275,12,this.energy/100,0xf7c55c);setTextIfChanged(this.energyLabel,this.energy>=100?'ULT READY!':`ULT ${Math.floor(this.energy)}%`);setTextIfChanged(this.label,`AINAN  ${Math.ceil(this.hp)}/100 HP`);setTextIfChanged(this.resourceLabel,`BANANAS ${this.count}/${REQUIRED}   •   AMMO ${this.ammo}`);hudPlate(g,W-328,5,316,80,0x5ed7f2);meter(g,W-300,54,272,14,progress/100,0x5ed7f2);for(const x of checkpointXs){g.fillStyle(0xf4d2a1,1).fillRect(W-300+272*x/END,49,3,24);}}


 hit(amount=12,dir=0){amount=incomingDamage(amount);if(this.combatNow<this.damageUntil||this.combatNow<this.dashUntil)return;const guarded=this.guard&&(dir===0||this.dir===-dir);this.audio?.cue(guarded?'guard':'hit');this.damageUntil=this.combatNow+850;this.hp=Math.max(0,this.hp-(guarded?Math.max(1,Math.round(amount*.2)):amount));this.hero.setTint(0xffa49e);this.time.delayedCall(240,()=>this.hero.clearTint());this.cameras.main.shake(90,.003);impactSparks(this,this.hero.x,this.hero.y-75,dir||-this.dir,false,guarded);impactPause(this,[this.hero,...this.enemies.filter(e=>e.hp).map(e=>e.s)],guarded?25:45);if(!guarded){this.vx=(dir||-this.dir)*155;this.vy=-180;this.grounded=false;this.attack=null;this.chainUntil=-1;this.dashUntil=0;this.stunUntil=this.combatNow+250;this.pose('hurt');}}
 end(win){
  if(this.finished)return;
  if(win){
   const supply=gateSupplies(this.hp,this.ammo,settings.difficulty);
   const data={bananas:this.count,ammo:supply.ammo,energy:this.energy,hp:supply.hp};
   try{
    if(!this.scene.get('StoryScene'))throw new Error('Boss scene is not registered');
    this.audio?.cue('gate');this.finished=true;
    this.notice.setText('Entering boss arena…');
    console.info('[Gate] Starting boss scene',data);
    this.scene.start('StoryScene',{chapter:'mini',payload:data});
   }catch(error){
    this.finished=false;
    console.error('[Gate] Transition failed',error);
    this.notice.setText('Gate error: '+error.message);
   }
   return;
  }
  this.audio?.cue('announcer-ko');this.audio?.cue('meme-faa',.55,1200);this.finished=true;
  this.notice.setText('K.O.  •  Tap here or press ENTER to retry').setInteractive({useHandCursor:true});
  let restarting=false;const retry=()=>{if(restarting)return;restarting=true;this.scene.restart({checkpoint:this.checkpoint});};this.notice.on('pointerdown',retry);this.input.keyboard.once('keydown-ENTER',retry);this.events.once('shutdown',()=>this.input.keyboard.off('keydown-ENTER',retry));
 }
 flash(key,x,y,size=140,dir=this.dir){
  const fx=this.add.image(x,y,'fx-'+key).setDepth(6).setFlipX(dir<0);const scale=size/Math.max(fx.width,fx.height);fx.setScale(scale*.7);
  this.tweens.add({targets:fx,scaleX:scale,scaleY:scale,x:x+dir*30,alpha:0,duration:280,ease:'Cubic.Out',onComplete:()=>fx.destroy()});
 }
 damageEnemy(e,damage,dir,strong=false){
  if(!e.hp)return false;this.audio?.cue(strong?'heavy':'hit');if(strong)this.audio?.cue('meme-bonk',.33,1200);e.hp=Math.max(0,e.hp-damage);e.impact=0;e.until=this.combatNow+360;
  e.s.play(animationKey('mini-maliha',e.hp?'hurt':'down'));e.s.x=Phaser.Math.Clamp(e.s.x+dir*(strong?48:28),e.segment.x+18,e.segment.x+e.segment.w-18);
  if(!e.hp){this.deadEnemies.add(e.home);this.tweens.add({targets:e.s,alpha:0,duration:550,delay:270});}
  this.energy=Math.min(100,this.energy+damage*1.7);this.combo=this.combatNow<this.comboUntil?this.combo+1:1;this.comboUntil=this.combatNow+1000;if(this.combo>=2)this.inputState.tell(`${this.combo} HIT COMBO${this.combo>=3?' • COOKED!':''}`,700);
  this.cameras.main.shake(strong?130:70,strong?.004:.002);impactSparks(this,e.s.x-dir*20,e.s.y-65,dir,strong);impactPause(this,[this.hero,...this.enemies.filter(o=>o.hp||o===e).map(o=>o.s)],strong?78:40);const t=this.add.text(e.s.x,e.s.y-105,strong?'BONK! '+damage:String(damage),{fontSize:'20px',fontStyle:'bold',color:'#ffe4a1',stroke:'#16151c',strokeThickness:3}).setOrigin(.5).setDepth(10);this.tweens.add({targets:t,y:t.y-35,alpha:0,duration:420,onComplete:()=>t.destroy()});return true;
 }
 beginAttack(state){
  const now=this.combatNow;if(!canStart(this,now,state))return false;
  const data=CHARACTERS.ainan.animations[state],rule=ATTACKS[state],emitter=CHARACTERS.ainan.metrics.emitters?.[state];
  const {impact,duration,cancel}=attackTiming(data,emitter);
  const finisher=state==='attack3'&&this.chainIndex===1&&now<=this.chainUntil;
  if(this.attack?.confirmed)this.vx=this.dir*160;
  if(!['attack1','attack2','attack3'].includes(state))this.chainUntil=-1;
  this.attack={state,rule,emitter,dir:this.dir,at:now+impact,end:now+duration,cancelAt:now+cancel,done:false,confirmed:false,finisher};this.ready=now+Math.max(duration,rule.cooldown);this.state='';this.pose(state);return true;
 }
 fire(){
  const now=this.combatNow;if(this.attack||now<this.ready)return false;
  if(!this.ammo){this.inputState.tell('NO AMMO — collect bananas');return true;}
  this.audio?.cue('shot');this.ammo--;this.chainUntil=-1;this.ready=now+400;this.attack={end:now+320,done:true,dir:this.dir};this.state='';this.pose('attack1');
  const x=this.hero.x+this.dir*65,y=this.hero.y-75,s=this.add.image(x,y,'fx-solan-crescent').setDisplaySize(48,36).setFlipX(this.dir<0).setTint(0xffe36a).setDepth(7);
  this.shots.push({s,x,y,dir:this.dir,until:now+1150});return true;
 }
 updateAttack(now){
  const a=this.attack;if(!a)return;
  if(!a.done&&now>=a.at){a.done=true;this.audio?.cue(a.state==='ultimate'?'ultimate':a.state==='attack3'||a.state==='attack2'?'heavy':'slash');const e=a.emitter;this.flash('solan-'+a.rule.fx,this.hero.x+a.dir*(e?.x??85)*this.hero.scaleX,this.hero.y+(e?.y??-85)*this.hero.scaleY,a.state==='ultimate'?300:160,a.dir);
   for(const enemy of this.enemies){const dx=(enemy.s.x-this.hero.x)*a.dir;if(enemy.hp&&dx>=-20&&dx<=a.rule.reach&&Math.abs(enemy.s.y-this.hero.y)<115){if(this.damageEnemy(enemy,strikeDamage(a),a.dir,a.finisher||a.state==='ultimate'))confirmBasic(this,a,now);}}
   if(!a.confirmed)this.chainUntil=-1;
  }
  if(now>=a.end)this.attack=null;
 }
 potion(x,y){if(this.usedPotions.has(x))return;const g=this.add.graphics({x,y}).setDepth(2);g.fillStyle(0x1a2430,1).fillRoundedRect(-15,-15,30,32,7);g.fillStyle(0x9bdebb,1).fillRoundedRect(-12,-11,24,24,5);g.fillStyle(0x269d69,1).fillRoundedRect(-10,-1,20,12,3);g.fillStyle(0xf5e0a1,1).fillRect(-8,-20,16,7);g.fillStyle(0xffffff,1).fillRect(-3,-7,6,18).fillRect(-9,-1,18,6);this.potions.push({g,x,y});this.tweens.add({targets:g,y:y-6,yoyo:true,repeat:-1,duration:850});}
 updateZone(){const i=this.hero.x>=9200?2:this.hero.x>=4600?1:0;if(i===this.zone)return;if(this.zone>=0){this.oldBg?.destroy();const old=cover(this.add.image(this.bg.x,H/2,zones[this.zone].bg),W,H,1.04).setScrollFactor(0).setDepth(-19);this.oldBg=old;this.tweens.add({targets:old,alpha:0,duration:550,onComplete:()=>{if(old.active)old.destroy();if(this.oldBg===old)this.oldBg=null;}});}this.zone=i;this.audio?.setTrack(['music-woods','music-harbor','music-sanctuary'][i]);this.audio?.setAmbience(['ambient-woods','ambient-harbor','ambient-sanctuary'][i]);cover(this.bg.setTexture(zones[i].bg),W,H,1.04);this.atmosphere.tint([0xffe2a2,0xa9e9ff,0xc4a6ff][i]);this.zoneTitle.setText(zones[i].name).setAlpha(1);this.tweens.killTweensOf(this.zoneTitle);this.tweens.add({targets:this.zoneTitle,alpha:0,delay:1400,duration:650});}
 saveCheckpoint(){if(this.hp<=0)return;for(const x of checkpointXs){if(this.hero.x>=x&&x>(this.checkpoint?.x??0)){const before=this.hp;this.hp=checkpointHealth(this.hp,settings.difficulty);this.checkpoint={x,hp:this.hp,ammo:this.ammo,energy:this.energy,bananas:[...this.usedBananas],potions:[...this.usedPotions],enemies:[...this.deadEnemies]};markChapter('chase',{},this.checkpoint);this.audio?.cue('checkpoint');if(this.hp>before){this.audio?.cue('heal');this.flash('cora-feather',this.hero.x,this.hero.y-75,120);}this.inputState.tell('CHECKPOINT SAVED'+(this.hp>before?'  •  +'+(this.hp-before)+' HP':''),1600);}}}
 stepEnemies(now,dt){
  for(const e of this.enemies){if(!e.hp||Math.abs(e.s.x-this.hero.x)>W*1.3)continue;
   const dx=this.hero.x-e.s.x,dist=Math.abs(dx),vertical=Math.abs(this.hero.y-GROUND);
   if(e.impact&&now>=e.impact){e.impact=0;this.audio?.cue(e.kind==='ranged'?'magic':e.kind==='heavy'?'heavy':'slash',.25,150);const dir=e.dir;
    if(e.kind==='ranged'){const sp=this.add.image(e.s.x+dir*45,e.s.y-65,'fx-rhea-planet').setDisplaySize(42,42).setDepth(7);this.hostile.push({sp,dir,until:now+2100});}
    else {const range=e.kind==='heavy'?150:104;this.flash(e.kind==='heavy'?'rhea-well':'rhea-burst',e.s.x+dir*60,e.s.y-55,range,dir);if(dist<range&&vertical<105&&dx*dir>=-25&&groundAt(this.hero.x)===e.segment)this.hit(e.kind==='heavy'?18:10,dir);}
   }
   if(now<e.until)continue;
   if(dist<520){if(!this.cloneTaunted){this.cloneTaunted=true;this.audio?.say('clone');}e.dir=dx>=0?1:-1;const ranged=e.type===1,heavy=e.type===2;const reach=ranged?330:heavy?115:80;
    if(dist<=reach&&vertical<(ranged?230:105)&&now>=e.next){e.kind=ranged?'ranged':heavy?'heavy':'melee';e.until=now+(heavy?1000:750);e.impact=now+(heavy?420:260);e.next=now+(ranged?2000:heavy?1750:1250);e.s.setFlipX(e.dir<0);e.s.play(animationKey('mini-maliha',ranged?'skill1':heavy?'attack2':'attack1'));continue;}
    if(dist>reach-20)e.s.x+=e.dir*(heavy?78:ranged?85:132)*dt;else if(ranged&&dist<130)e.s.x-=e.dir*70*dt;else {e.s.play(animationKey('mini-maliha','idle'),true);continue;}
   }else{if(e.s.x>e.home+85)e.dir=-1;else if(e.s.x<e.home-85)e.dir=1;e.s.x+=e.dir*40*dt;}
   e.s.x=Phaser.Math.Clamp(e.s.x,e.segment.x+18,e.segment.x+e.segment.w-18);e.s.setFlipX(e.dir<0);e.s.play(animationKey('mini-maliha','walk'),true);
  }
  for(const shot of this.hostile){const previous=shot.sp.x;shot.sp.x+=shot.dir*310*dt;if(projectileCrosses(previous,shot.sp.x,this.hero.x,42)&&Math.abs(shot.sp.y-(this.hero.y-65))<55){this.hit(9,shot.dir);shot.until=0;}if(now>=shot.until||shot.sp.x<0||shot.sp.x>END)shot.sp.destroy();}this.hostile=this.hostile.filter(s=>s.sp.active);
 }
 update(_,delta){
  const input=this.inputState,c=input.sample();if(this.cinematic?.update())return;const dt=combatFrame(this,delta);if(!dt||this.finished)return;const now=this.combatNow;
  const stunned=now<this.stunUntil;const axis=stunned?0:Number(c.right)-Number(c.left);this.guard=!stunned&&c.guard&&this.grounded&&!this.attack&&now>=this.dashUntil;
  if(axis&&!this.attack&&now>=this.dashUntil)this.dir=axis;
  if(!stunned&&c.jumpPressed&&this.jumps<2&&!this.guard){this.vy=this.jumps===0?-MOTION.jump:-MOTION.doubleJump;this.jumps++;this.grounded=false;this.audio?.cue('jump');input.consume('jump');}
  if(!stunned&&c.dashPressed){if(now>=this.dashReady&&!this.guard&&!this.attack){this.dashDir=axis||this.dir;this.dir=this.dashDir;this.dashUntil=now+MOTION.dashMs;this.dashReady=now+MOTION.dashCooldown;this.vx=this.dashDir*MOTION.dash;this.flash('fenr-rush',this.hero.x-this.dir*40,this.hero.y-65,125);this.audio?.cue('dash');input.consume('dash');}else if(now<this.dashReady){input.tell('DASH RECHARGING',500);input.consume('dash');}}
  if(stunned){this.vx*=Math.pow(.12,dt);this.moveTime=0;this.moveAxis=0;}
  else drive(this,axis,dt,now,{guard:this.guard,attacking:!!this.attack});
  if(!stunned&&!this.guard){
   if(c.ultimatePressed){if(this.energy<100){input.tell('ULTIMATE CHARGING — '+Math.floor(this.energy)+'%');input.consume('ultimate');}else if(this.beginAttack('ultimate')){this.energy=0;input.consume('ultimate');this.cinematic?.start('ainan',[this.hero,...this.enemies.map(e=>e.s)],{duration:620});if(this.cinematic?.active)return;}}
   else if(c.shootPressed){if(this.fire())input.consume('shoot');}
   else if(c.skillPressed){if(this.beginAttack('skill1'))input.consume('skill');}
   else if(c.heavyPressed){if(this.beginAttack('attack2'))input.consume('heavy');}
   else if(c.attackPressed){const state=nextBasic(this,now);if(this.beginAttack(state))input.consume('attack');}
  }
  const oldY=this.hero.y;this.hero.x=Phaser.Math.Clamp(this.hero.x+this.vx*dt,50,END-50);this.vy+=MOTION.gravity*dt;this.hero.y+=this.vy*dt;this.grounded=false;
  if(this.vy>=0){const surfaces=this.platforms.filter(p=>this.hero.x>=p.x-8&&this.hero.x<=p.x+p.w+8&&oldY<=p.y+.1&&this.hero.y>=p.y).sort((a,b)=>a.y-b.y);if(surfaces.length){this.hero.y=surfaces[0].y;this.vy=0;this.grounded=true;this.jumps=0;const surface=surfaces[0];if(secrets.includes(surface)&&!this.secretVisited.has(surface.x)){this.secretVisited.add(surface.x);input.tell('BONUS ROUTE FOUND',1300);}}}
  if(!this.grounded&&this.jumps===0)this.jumps=1;
  if(this.hero.y>H+80){this.resetFromFall();if(this.hp<=0){this.drawHud();this.end(false);return;}}
  if(this.grounded&&this.hero.y===GROUND&&safeGround(this.hero.x))this.lastSafeX=this.hero.x;
  if(this.hero.y>=GROUND-19&&this.hero.y<=GROUND+15&&hazards.some(h=>this.hero.x>h.x-10&&this.hero.x<h.x+h.w+10))this.hit(12);
  this.updateAttack(now);this.hero.setFlipX((this.attack?.dir??this.dir)<0);
  if(!this.attack&&now>=this.stunUntil)this.pose(locomotion(this,this.grounded,this.guard));motionPlayback(this.hero,this.state,this.vx);
  for(const b of this.bananas){if(b.g.active&&Math.abs(this.hero.x-b.x)<38&&Math.abs(this.hero.y-62-b.y)<80){this.tweens.killTweensOf(b.g);b.g.destroy();this.audio?.cue('pickup',.3,75);this.usedBananas.add(b.id);this.count++;this.ammo++;this.energy=Math.min(100,this.energy+4);}}
  for(const shot of this.shots){const previous=shot.x;shot.x+=shot.dir*680*dt;shot.s.x=shot.x;for(const e of this.enemies){if(e.hp&&projectileCrosses(previous,shot.x,e.s.x,48)&&Math.abs(e.s.y-55-shot.y)<65){this.damageEnemy(e,13,shot.dir);shot.until=0;break;}}if(now>=shot.until||shot.x<0||shot.x>END)shot.s.destroy();}this.shots=this.shots.filter(s=>s.s.active);
  this.stepEnemies(now,dt);
  for(const p of this.potions){if(p.g.active&&this.hp<100&&Math.abs(this.hero.x-p.x)<42&&Math.abs(this.hero.y-60-p.y)<72){this.usedPotions.add(p.x);this.tweens.killTweensOf(p.g);p.g.destroy();const healing=Math.min(30,100-this.hp);this.hp+=healing;this.audio?.cue('heal');input.tell(`HEALTH RESTORED +${healing}`,1200);this.flash('cora-feather',this.hero.x,this.hero.y-75,120);}}
  this.updateZone();this.saveCheckpoint();
  const cam=this.cameras.main;cam.scrollX=damp(cam.scrollX,cameraTarget(this.hero.x,this.vx,W,END),dt,6);this.bg.x=W/2+Math.sin(cam.scrollX/1100)*16;this.atmosphere.update(dt);const floor=this.platforms.filter(p=>this.hero.x>=p.x&&this.hero.x<=p.x+p.w&&p.y>=this.hero.y-2).reduce((y,p)=>Math.min(y,p.y),Infinity);this.heroShadow.setVisible(Number.isFinite(floor));if(Number.isFinite(floor))syncShadow(this.heroShadow,this.hero.x,this.hero.y,floor);for(const e of this.enemies){e.shadow.setVisible(e.hp>0&&e.s.active);if(e.hp>0&&e.s.active)e.shadow.setX(e.s.x);}this.drawHud();
  if(this.hp<=0){this.end(false);return;}
  if(this.hero.x>END-230&&this.count>=REQUIRED){this.end(true);return;}
  if(this.count>=REQUIRED){setTextIfChanged(this.notice,'Gate unlocked! Keep moving right.');}
  else if(this.hero.x>END-1150){const hint=nextBanana(this.bananas,this.hero.x,this.hero.y);setTextIfChanged(this.notice,`Need ${REQUIRED-this.count} more bananas${hint?'  •  Nearest: '+hint.direction+' '+hint.distance+' px':''}`);}
  else setTextIfChanged(this.notice,`Collect ${REQUIRED} of ${TOTAL} bananas • ${Math.min(100,Math.floor(this.hero.x/(END-230)*100))}% explored`);
 }
}
