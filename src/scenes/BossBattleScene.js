/** MONKEY MIND III | MODULE
 * Both boss arenas: fighters, player attacks, HP, HUD, cage, KO and rescue progression.
 * Customization map: docs/CUSTOMIZATION.md
 */
import { cover, meter, hudPlate, bananaSeal, portrait, screenShade, Atmosphere, syncShadow, setTextIfChanged } from '../ui/Presentation.js';
import { incomingDamage, settings } from '../systems/CampaignProfile.js';
import { installPause } from './MenuScene.js';
import { AudioDirector, audioSettings } from '../audio/AudioDirector.js';
import { CinematicDirector, chapterWipe, chapterReveal } from '../combat/CinematicDirector.js';
import { BossDirector } from '../combat/BossDirector.js';
import { initCombat, combatFrame, impactPause, canStart, nextBasic, confirmBasic, attackTiming, strikeDamage, projectileCrosses, motionPlayback, impactSparks } from '../combat/CombatFlow.js';
import Phaser from 'phaser';
import { GAME_WIDTH as W, GAME_HEIGHT as H } from '../config/gameConfig.js';
import { CHARACTERS } from '../config/assetManifest.js';
import { animationKey, registerCharacterAnimations, setCharacter } from '../characters/CharacterAnimations.js';
import { ATTACKS, BOSS_FX, GROUND, clamp } from '../combat/FightRules.js';
import { makeFightInput } from '../ui/FightInput.js';
import { MOTION, drive, locomotion, approach } from '../combat/Movement.js';

export class BossBattleScene extends Phaser.Scene {
 constructor(){super('BossBattleScene');}
 init(data){this.startStage=data?.stage===1?1:0;this.startHp=Number.isFinite(data?.hp)?clamp(data.hp,1,100):100;this.collectedBananas=Number.isFinite(data?.bananas)?data.bananas:12;this.startAmmo=Number.isFinite(data?.ammo)?data.ammo:Math.max(3,Math.floor(this.collectedBananas/3));this.startEnergy=Number.isFinite(data?.energy)?data.energy:0;}
 create(){
  this.sceneFailed=false;
  try{
   const camera=this.cameras.main;
   camera.resetFX();
   camera.setVisible(true).setAlpha(1).setScroll(0,0);
   console.info('[Boss] Initializing arena');
   this.createArena();
   console.info('[Boss] Arena ready');
  }catch(error){this.showSceneError(error);}
 }
 showSceneError(error){
  if(this.sceneFailed)return;
  this.sceneFailed=true;
  this.inputState?.clear();this.director?.clear();this.audio?.dispose();
  console.error('[Boss] Scene failed',error);
  const camera=this.cameras.main;
  camera.resetFX();camera.setVisible(true).setAlpha(1).setScroll(0,0);
  this.add.rectangle(W/2,H/2,W,H,0x101820,1).setScrollFactor(0).setDepth(10000);
  this.add.text(W/2,H/2-60,'BOSS ARENA COULD NOT START',{fontFamily:'Arial',fontSize:'28px',color:'#ffe1a1',fontStyle:'bold'}).setOrigin(.5).setScrollFactor(0).setDepth(10001);
  this.add.text(W/2,H/2+10,String(error?.message??error)+'\nSend a screenshot or check F12 > Console.',{fontFamily:'Arial',fontSize:'19px',color:'#ffffff',align:'center',wordWrap:{width:W-100}}).setOrigin(.5).setScrollFactor(0).setDepth(10001);
  const back=this.add.text(W/2,H/2+105,'RETURN TO MAIN MENU',{fontFamily:'Arial',fontSize:'23px',backgroundColor:'#304359',padding:{x:22,y:12},color:'#fff0cc'}).setOrigin(.5).setScrollFactor(0).setDepth(10002).setInteractive({useHandCursor:true});
  back.once('pointerdown',()=>this.scene.start('TitleScene'));
 }
 createArena(){
  registerCharacterAnimations(this);
  this.arenaBg=cover(this.add.image(W/2,H/2,this.startStage===1?'prologue-bg':'arena-bg'),W,H,1.02);this.atmosphere=new Atmosphere(this,W,H,{count:14,color:this.startStage===1?0xd4b6ff:0xffdf98,depth:0});this.hudSignature=null;this.hpTrail=null;this.arenaBgScale={x:this.arenaBg.scaleX,y:this.arenaBg.scaleY};
  this.add.rectangle(W/2,GROUND+2,W,2,0xd4ad73,.35).setDepth(1);
  // A light top gradient, not a full opaque menu.
  screenShade(this,W,H,20);
  initCombat(this);this.stage=this.startStage;this.finished=false;this.transition=false;this.started=false;this.combo=0;this.comboUntil=0;this.energy=this.startEnergy;this.ammo=this.startAmmo;this.shots=[];this.pickups=[];this.now=0;
  this.player=this.makeFighter('ainan',300,192,100);this.player.hp=this.startHp;
  this.boss=this.makeFighter(this.stage===1?'maliha':'mini-maliha',960,this.stage===1?205:180,this.stage===1?155:110);this.boss.dir=-1;
  this.jennifer=this.makeFighter('jennifer',1190,132,1);this.jennifer.sprite.setDepth(1).setVisible(false).setFlipX(true);this.jennifer.shadow.setVisible(false);
  if(this.stage===1){this.jennifer.sprite.setVisible(true).setPosition(W-125,278).setScale(this.jennifer.sprite.scaleX*.65);const cage=this.add.graphics().setDepth(2);cage.fillStyle(0x211c32,.75).fillRoundedRect(W-197,135,144,146,10);cage.setDepth(0);const bars=this.add.graphics().setDepth(2);bars.lineStyle(5,0xb3a1c8,.95).strokeRoundedRect(W-197,135,144,146,10);for(let i=1;i<5;i++)bars.lineStyle(4,0x6c5b87,1).lineBetween(W-197+i*144/5,140,W-197+i*144/5,276);bars.fillStyle(0xc8ab60,1).fillRoundedRect(W-137,203,24,24,4);}

  this.inputState=makeFightInput(this,W,H);
  this.hud=this.add.graphics().setDepth(25);
  portrait(this,'ainan-portrait',56,57,0xe8c078,72);portrait(this,`${this.boss.id}-portrait`,W-56,57,0xe18ba9,72);this.playerName=this.text(104,12,'AINAN',25,'#fff1cd').setDepth(26);
  this.enemyName=this.text(W-104,12,this.stage===1?'MALIHA':'MINI MALIHA',25,'#ffe0ec').setOrigin(1,0).setDepth(26);
  this.objective=this.text(W/2,12,'THE RESCUE',24,'#ffe4a6').setOrigin(.5,0).setDepth(26);
  this.sub=this.text(W/2,43,this.stage===1?'PHASE I — SERPENT QUEEN':'Defeat Mini Maliha',17,'#ffffff').setOrigin(.5,0).setDepth(26);
  this.ammoText=this.text(134,80,'',20,'#ffe9a1').setDepth(26);
  this.comboText=this.text(W/2,117,'',30,'#fff0a1').setOrigin(.5).setDepth(26);
  this.tip=this.text(W/2,H-12,'AETHER CLASH by Bang Tutorial • Adapted • CC BY-NC 4.0',10,'#ffffff').setOrigin(.5,1).setDepth(101);
  this.audio=new AudioDirector(this);this.audioStarted=false;this.audio.setTrack('final-battle');
  const soundButton=this.text(W/2,70,'♪ MUSIC: ON',12,'#ffffff').setOrigin(.5).setDepth(90).setInteractive({useHandCursor:true});
  this.audio.onChange=()=>soundButton.setText(`♪ SOUND: ${audioSettings.enabled?'ON':'OFF'} (M) • VOICE: ${audioSettings.voice?'ON':'OFF'} (V)`);this.audio.onChange();soundButton.on('pointerdown',()=>this.audio.toggle());
  this.cinematic=new CinematicDirector(this,W,H);this.director=new BossDirector(this,W,GROUND,()=>settings.difficulty);chapterReveal(this,W,H,this.stage===1?'FINAL BATTLE — QUEEN OF CHAOS':'BOSS BATTLE — COSMIC MENACE');this.drawHud();this.now=this.combatNow;this.start();installPause(this,W,H);
 }
 text(x,y,value,size=18,color='#ffffff'){return this.add.text(x,y,value,{fontFamily:'Georgia, Times New Roman, serif',fontSize:`${size}px`,fontStyle:'bold',color,stroke:'#171019',strokeThickness:3});}
 makeFighter(id,x,height,hp){
  const sprite=this.add.sprite(x,GROUND,CHARACTERS[id].texture,CHARACTERS[id].animations.idle.frames[0]).setDepth(3);
  setCharacter(sprite,id,height);
  const shadow=this.add.ellipse(x,GROUND+2,100,20,0x21171d,.32).setDepth(2);
  return {id,sprite,shadow,x,y:GROUND,vx:0,vy:0,dir:1,hp,maxHp:hp,state:'idle',until:0,ready:0,jumps:0,attack:null,guard:false,stun:0,invulnerable:0,aiNext:0};
 }
 play(f,state){if(f.state===state)return;const data=CHARACTERS[f.id].animations[state];if(!data)return;f.state=state;f.sprite.anims.timeScale=1;f.sprite.play(animationKey(f.id,state),true);}
 pose(f,state){if(f.state!==state){f.state='';this.play(f,state);}}
 sync(f){f.sprite.setPosition(f.x,f.y).setFlipX(f.dir<0);syncShadow(f.shadow,f.x,f.y,GROUND);}
 sfx(key,volume=.55){this.audio?.cue(key,volume);}
 start(){this.started=true;this.graceUntil=this.now+1800;this.boss.aiNext=this.graceUntil;}
 activateAudio(){this.audio?.ensure();if(this.audioStarted||!this.audio?.ready())return;this.audioStarted=true;this.sfx('announcer-fight');}
 beginAttack(f,state,rule,fx){
  if(!canStart(f,this.now,state)||this.now<f.stun)return false;
  const data=CHARACTERS[f.id].animations[state];if(!data)return false;
  const emitter=CHARACTERS[f.id].metrics.emitters?.[state];
  const {impact,duration,cancel}=attackTiming(data,emitter);
  const finisher=f===this.player&&state==='attack3'&&f.chainIndex===1&&this.now<=f.chainUntil;
  if(f===this.player&&f.attack?.confirmed)f.vx=f.dir*160;
  if(!['attack1','attack2','attack3'].includes(state))f.chainUntil=-1;
  f.attack={state,rule,fx,at:this.now+impact,end:this.now+duration,cancelAt:this.now+cancel,done:false,confirmed:false,finisher,emitter,dir:f.dir};
  f.ready=this.now+Math.max(duration,rule.cooldown);this.pose(f,state);return true;
 }
 flash(key,x,y,dir,size=160){
  if(!this.textures.exists('fx-'+key))return;
  const img=this.add.image(x,y,'fx-'+key).setDepth(7).setFlipX(dir<0);const s=size/Math.max(img.width,img.height);img.setScale(s*.68).setAlpha(.98);
  this.tweens.add({targets:img,x:x+dir*45,scaleX:s,scaleY:s,alpha:0,duration:330,ease:'Cubic.Out',onComplete:()=>img.destroy()});
 }
 impact(f,target){
  const a=f.attack;if(!a||f.hp<=0)return;
  if(a.bossSpecial){if(!a.done&&this.now>=a.at){a.done=true;this.director.release(a);}if(this.now>=a.end)f.attack=null;return;}
  if(!a.done&&this.now>=a.at){a.done=true;this.audio?.cue(a.state==='ultimate'?'ultimate':a.state==='attack2'||a.state==='attack3'?'heavy':'slash');if(a.state==='ultimate'&&this.arenaBg){const bg=this.arenaBg,scale=this.arenaBgScale;this.tweens.killTweensOf(bg);bg.setScale(scale.x,scale.y);this.tweens.add({targets:bg,scaleX:scale.x*1.065,scaleY:scale.y*1.065,duration:125,yoyo:true,ease:'Sine.InOut'});this.cameras.main.shake(180,.004);}const e=a.emitter;this.flash(a.fx,f.x+f.dir*(e?.x??85)*f.sprite.scaleX,f.y+(e?.y??-85)*f.sprite.scaleY,f.dir,a.state==='ultimate'?330:180);
   const dx=(target.x-f.x)*a.dir;
   if(dx>=-25&&dx<=a.rule.reach&&Math.abs(target.y-f.y)<125){const landed=this.damage(target,strikeDamage(a),a.dir,f,a.finisher||a.state==='ultimate');if(landed&&f===this.player)confirmBasic(f,a,this.now);}
   if(f===this.player&&!a.confirmed)f.chainUntil=-1;
  }
  if(this.now>=a.end)f.attack=null;
 }
 damage(target,amount,dir,source,strong=false){
  if(target===this.player)amount=incomingDamage(amount);
  if(target.hp<=0||this.now<target.invulnerable)return false;
  const guarded=target.guard&&target.dir===-dir;const hit=guarded?Math.max(1,Math.round(amount*.2)):amount;
  this.audio?.cue(guarded?'guard':strong?'heavy':'hit');target.hp=Math.max(0,target.hp-hit);target.attack=null;if(!guarded)target.guard=false;target.chainUntil=-1;target.dashUntil=0;target.stun=this.now+(guarded?100:strong?340:230);target.invulnerable=this.now+(guarded?95:125);target.vx=dir*(guarded?65:strong?380:230);if(strong&&!guarded&&target.hp>0)target.vy=-165;this.pose(target,target.hp?(guarded?'crouch':'hurt'):'down');
  target.sprite.setTint(guarded?0xb1d9ff:0xffb6a6);this.time.delayedCall(115,()=>{if(target.sprite.active)target.sprite.clearTint();});
  this.cameras.main.shake(strong?140:80,guarded?.001:strong?.005:.0025);impactSparks(this,target.x-dir*30,target.y-100,dir,strong,guarded);impactPause(this,[this.player.sprite,this.boss.sprite],guarded?28:strong?88:45);
  this.floatText(target.x,target.y-160,guarded?'GUARD '+hit:strong?'BONK! '+hit:String(hit),guarded?'#bde4ff':'#fff1ad');
  if(source===this.player&&!guarded){if(strong)this.audio?.cue('meme-bonk',.38,1200);this.energy=Math.min(100,this.energy+hit*1.6);this.combo=this.now<this.comboUntil?this.combo+1:1;this.comboUntil=this.now+1100;}
  return !guarded;
 }
 floatText(x,y,value,color){const t=this.text(x,y,value,24,color).setOrigin(.5).setDepth(12);this.tweens.add({targets:t,y:y-60,alpha:0,duration:600,onComplete:()=>t.destroy()});}
 fire(){const p=this.player;if(p.attack||this.now<p.stun||this.now<p.ready)return false;if(!this.ammo){this.inputState.tell('NO AMMO — collect bananas');return true;}this.audio?.cue('shot');this.ammo--;p.ready=this.now+400;p.chainUntil=-1;this.pose(p,'attack1');p.attack={state:'attack1',rule:{reach:0,damage:0},fx:'solan-impact',at:Infinity,end:this.now+320,done:true};
  const x=p.x+p.dir*75,y=p.y-90;const sprite=this.add.image(x,y,'fx-solan-crescent').setDisplaySize(48,36).setFlipX(p.dir<0).setTint(0xffe36a).setDepth(8);this.shots.push({sprite,x,y,dir:p.dir,life:this.now+1600});return true;
 }
 stepProjectiles(dt){for(const shot of this.shots){const previous=shot.x;shot.x+=shot.dir*780*dt;shot.sprite.x=shot.x;if(this.boss.hp>0&&projectileCrosses(previous,shot.x,this.boss.x,58)&&Math.abs(shot.y-(this.boss.y-95))<85){this.damage(this.boss,13,shot.dir,this.player);shot.life=0;}if(shot.life<=this.now||shot.x<-80||shot.x>W+80)shot.sprite.destroy();}this.shots=this.shots.filter(s=>s.sprite.active);}
 stepFighterPhysics(f,dt){
  f.x=clamp(f.x+f.vx*dt,65,W-65);f.vy+=MOTION.gravity*dt;f.y+=f.vy*dt;
  if(f.y>=GROUND){f.y=GROUND;f.vy=0;f.jumps=0;}
  if(f.hp<=0){f.vx*=Math.pow(.03,dt);this.play(f,'down');}
  else if(this.now<f.stun){f.vx*=Math.pow(.025,dt);}
  else if(!f.attack){this.play(f,locomotion(f,f.y>=GROUND,f.guard));}
  motionPlayback(f.sprite,f.state,f.vx);this.sync(f);
 }
 playerControl(c,dt){
  const p=this.player, input=this.inputState;
  if(p.hp<=0||this.now<p.stun){p.guard=false;return;}
  const axis=Number(c.right)-Number(c.left);
  p.guard=c.guard&&!p.attack&&p.y===GROUND&&this.now>=(p.dashUntil||0);
  if(axis&&!p.attack&&this.now>=(p.dashUntil||0))p.dir=axis;
  else if(!p.guard&&!p.attack&&!axis&&this.boss.hp>0&&this.now>=(p.dashUntil||0))p.dir=this.boss.x>=p.x?1:-1;
  if(c.jumpPressed&&p.jumps<2&&!p.guard){p.vy=p.jumps===0?-MOTION.jump:-MOTION.doubleJump;p.jumps++;this.audio?.cue('jump');input.consume('jump');}
  if(c.dashPressed){
   if(this.now>=(p.dashReady||0)&&!p.guard&&!p.attack){p.dashDir=axis||p.dir;p.dir=p.dashDir;p.dashUntil=this.now+MOTION.dashMs;p.dashReady=this.now+MOTION.dashCooldown;p.invulnerable=this.now+MOTION.dashMs;p.vx=p.dashDir*MOTION.dash;this.flash('fenr-rush',p.x-p.dir*45,p.y-75,p.dir,145);this.audio?.cue('dash');input.consume('dash');}
   else if(this.now<(p.dashReady||0)){input.tell('DASH RECHARGING',500);input.consume('dash');}
  }
  drive(p,axis,dt,this.now,{guard:p.guard,attacking:!!p.attack});
  if(p.guard)return;
  if(c.ultimatePressed){if(this.energy<100){input.tell('ULTIMATE CHARGING — '+Math.floor(this.energy)+'%',1100);input.consume('ultimate');}else if(this.beginAttack(p,'ultimate',ATTACKS.ultimate,'solan-sunburst')){this.energy=0;this.flash('solan-sunburst',p.x,p.y-120,p.dir,260);input.consume('ultimate');this.cinematic?.start('ainan',[p.sprite,this.boss.sprite]);}}
  else if(c.shootPressed){if(this.fire())input.consume('shoot');}
  else if(c.skillPressed){if(this.beginAttack(p,'skill1',ATTACKS.skill1,'solan-crescent'))input.consume('skill');}
  else if(c.heavyPressed){if(this.beginAttack(p,'attack2',ATTACKS.attack2,'solan-impact'))input.consume('heavy');}
  else if(c.attackPressed){const state=nextBasic(p,this.now);if(this.beginAttack(p,state,ATTACKS[state],'solan-'+ATTACKS[state].fx))input.consume('attack');}
 }
 enemyControl(dt){this.director.control(dt);}
 drawHud(dt=0){const p=this.player,b=this.boss;const hp=[p.hp/p.maxHp,b.hp/b.maxHp];if(!this.hpTrail)this.hpTrail=[...hp];this.hpTrail=this.hpTrail.map((v,i)=>Math.max(hp[i],v-dt*.96));const signature=[...hp,...this.hpTrail,this.ammo,Math.floor(this.energy)].join(':');if(signature!==this.hudSignature){this.hudSignature=signature;const g=this.hud;g.clear();const w=390;hudPlate(g,10,5,508,120,0xe0b963);hudPlate(g,W-518,5,508,84,0xd85b87);meter(g,104,47,w,26,hp[0],hp[0]<.25?0xf15c54:0xbd283e,{trail:this.hpTrail[0]});meter(g,W-104-w,47,w,26,hp[1],0x923044,{reverse:true,trail:this.hpTrail[1]});meter(g,104,110,390,9,this.energy/100,0x459ec3);setTextIfChanged(this.playerName,`AINAN  ${Math.ceil(p.hp)}/${p.maxHp}`);setTextIfChanged(this.enemyName,`${this.stage===1?'MALIHA':'MINI MALIHA'}  ${Math.ceil(b.hp)}/${b.maxHp}`);bananaSeal(g,117,93,12);setTextIfChanged(this.ammoText,`${this.collectedBananas??0} Bananas · ${this.ammo} Ammo · ${this.energy>=100?"ULT READY!":"ULT "+Math.floor(this.energy)+"%"}`);}setTextIfChanged(this.comboText,this.combo>1&&this.now<this.comboUntil?`${this.combo} HIT COMBO${this.combo>=3?'  •  COOKED!':''}`:'');}

 advance(){this.director?.clear();this.transition=true;this.sfx('announcer-ko');this.boss.vx=0;this.floatText(W/2,250,'MINI MALIHA DEFEATED','#ffe39b');this.time.delayedCall(1100,()=>chapterWipe(this,W,H,()=>this.scene.start('StoryScene',{chapter:'final',payload:{stage:1,bananas:this.collectedBananas,ammo:this.ammo+3,energy:this.energy,hp:Math.min(100,Math.max(65,this.player.hp+35))}})));}
 finish(win){if(this.finished)return;this.director?.clear();this.finished=true;this.sfx('announcer-ko');this.audio?.setTrack(win?'music-victory':null);this.audio?.cue(win?'victory':'meme-faa',.55,1200);this.inputState.clear();if(win){this.time.delayedCall(1000,()=>chapterWipe(this,W,H,()=>this.scene.start('StoryScene',{chapter:'ending',payload:{bananas:this.collectedBananas}})));return;}const veil=this.add.rectangle(W/2,H/2,650,180,0x10131c,.86).setDepth(110);this.text(W/2,H/2-45,'K.O. — TRY AGAIN',40,'#ffe7ae').setOrigin(.5).setDepth(111);const retry=this.text(W/2,H/2+40,'RETRY BATTLE',21).setOrigin(.5).setDepth(111).setInteractive({useHandCursor:true});let restarting=false;const again=()=>{if(restarting)return;restarting=true;this.scene.restart({stage:this.startStage,bananas:this.collectedBananas,ammo:this.startAmmo,energy:this.startEnergy,hp:this.startHp});};retry.on('pointerdown',again);this.input.keyboard.once('keydown-ENTER',again);this.events.once('shutdown',()=>this.input.keyboard.off('keydown-ENTER',again));}
 update(time,delta){if(this.sceneFailed)return;try{this.updateArena(time,delta);}catch(error){this.showSceneError(error);}}
 updateArena(_,delta){const c=this.inputState.sample();if(this.cinematic?.update())return;const dt=combatFrame(this,delta);if(!dt||this.finished)return;this.now=this.combatNow;if(!this.started)this.start();this.activateAudio();
  if(!this.transition){this.playerControl(c,dt);if(this.cinematic?.active)return;this.enemyControl(dt);if(this.cinematic?.active)return;this.impact(this.player,this.boss);if(this.boss.hp>0)this.impact(this.boss,this.player);this.stepProjectiles(dt);if(this.boss.hp>0&&this.player.hp>0)this.director.update(dt);}else{this.player.vx=0;}
  // Gentle body separation avoids overlapping fighters.
  if(this.boss.hp>0&&Math.abs(this.player.y-this.boss.y)<95){const dx=this.boss.x-this.player.x;if(Math.abs(dx)<65){const push=(65-Math.abs(dx))*.5,dir=dx>=0?1:-1;this.player.x-=dir*push;this.boss.x+=dir*push;}}
  this.stepFighterPhysics(this.player,dt);this.stepFighterPhysics(this.boss,dt);this.atmosphere.update(dt);this.drawHud(dt);
  if(this.player.hp<=0){this.finish(false);return;}if(this.boss.hp<=0&&!this.transition){if(this.stage===0)this.advance();else this.finish(true);}
 }
}
