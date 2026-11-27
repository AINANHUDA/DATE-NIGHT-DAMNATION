/** MONKEY MIND III | MODULE
 * Main menu, opening gate, title artwork and continue/new game.
 * Customization map: docs/CUSTOMIZATION.md
 */
import { cover } from '../ui/Presentation.js';
import { openMenu } from './MenuScene.js';
import { profile, settings, newCampaign, continueCampaign, recoveredFromBackup } from '../systems/CampaignProfile.js';
import { AudioDirector, audioSettings } from '../audio/AudioDirector.js';
import Phaser from 'phaser';
import {GAME_WIDTH as W,GAME_HEIGHT as H} from '../config/gameConfig.js';
import {CHARACTERS} from '../config/assetManifest.js';
import {registerCharacterAnimations,setCharacter} from '../characters/CharacterAnimations.js';

export class TitleScene extends Phaser.Scene {
 constructor(){super('TitleScene');}
 create(){
  this.audio=new AudioDirector(this);this.audio.setTrack('music-date');this.opening=false;this.menuOpening=false; this.cameras.main.resetFX();
  registerCharacterAnimations(this);
  const bg=cover(this.add.image(W/2,H/2,'prologue-bg'),W,H);
  this.tweens.add({targets:bg,scaleX:bg.scaleX*1.06,scaleY:bg.scaleY*1.06,duration:16000,yoyo:true,repeat:-1,ease:'Sine.InOut'});
  const veil=this.add.graphics().fillGradientStyle(0x050811,0x050811,0x050811,0x050811,.65,.05,.96,.38).fillRect(0,0,W,H);
  const hero=this.add.sprite(940,590,CHARACTERS.ainan.texture);setCharacter(hero,'ainan',380);
  const glow=this.add.ellipse(940,594,250,32,0x000000,.34).setDepth(0);hero.setDepth(1);
  for(let i=0;i<(settings.graphics==='low'?8:24);i++){const x=Phaser.Math.Between(10,W-10),y=Phaser.Math.Between(80,H-30);const p=this.add.circle(x,y,Phaser.Math.Between(1,3),0xffd78d,.5).setDepth(2);this.tweens.add({targets:p,y:y-65,alpha:.08,duration:1800+i*95,yoyo:true,repeat:-1,ease:'Sine.InOut'});}
  const t=(x,y,str,size,color='#f8ebce',family='Georgia')=>this.add.text(x,y,str,{fontFamily:family==='Arial'?'Rajdhani, Arial':family,fontSize:`${size}px`,color,fontStyle:'bold',stroke:'#10121d',strokeThickness:3}).setDepth(4);
  t(90,90,'A  MONKEY MIND ADVENTURE',18,'#dfc08a','Arial');
  t(82,155,'MONKEY',92,'#f8ebce','Arial');t(82,250,'MIND III',92,'#f8ebce','Arial');t(90,355,'T H E   R E S C U E',24,'#f9ca72','Arial');
  this.add.rectangle(92,409,430,2,0xcfa45b,.85).setOrigin(0,.5).setDepth(4);
  this.add.text(90,438,'One date. One kidnapping.\nAn unreasonable number of bananas.',{fontFamily:'Rajdhani, Arial',fontStyle:'bold',fontSize:'27px',color:'#f2e6cf',lineSpacing:7}).setDepth(4);
  const menuButton=(x,y,w,label,action,primary=false)=>{const plate=this.add.rectangle(x,y,w,50,primary?0xa96b26:0x182535,.95).setStrokeStyle(1,0xffdc90,.8).setInteractive({useHandCursor:true}).setDepth(5);t(x,y,label,20,'#fff6df','Arial').setOrigin(.5).setDepth(6);plate.on('pointerover',()=>plate.setFillStyle(primary?0xcb903d:0x35465c));plate.on('pointerout',()=>plate.setFillStyle(primary?0xa96b26:0x182535));plate.on('pointerdown',()=>{if(!this.opening&&!this.menuOpening)action();});};
  // Main action always starts the prologue. Resume is a separate, explicit choice.
  const play=()=>this.startStory();
  menuButton(307,535,434,'START STORY  ›',play,true);
  if(profile.save)menuButton(195,595,210,'CONTINUE SAVE',()=>this.resumeStory());
  else {this.add.rectangle(195,595,210,50,0x182535,.45).setStrokeStyle(1,0x424955).setDepth(5);t(195,595,'NO SAVED GAME',18,'#828895','Arial').setOrigin(.5).setDepth(6);}
  menuButton(419,595,210,'CHAPTERS',()=>openMenu(this,'chapters'));
  menuButton(195,650,210,'SETTINGS',()=>openMenu(this,'settings'));
  menuButton(419,650,210,`COMPLETED: ${profile.completed}`,()=>openMenu(this,'chapters'));
  this.add.text(W/2,H-15,'AETHER CLASH by Bang Tutorial • Adapted • CC BY-NC 4.0 • github.com/bangtutorial/aether-clash • Click for credits',{fontFamily:'Arial',fontSize:'12px',color:'#e4d7c7'}).setOrigin(.5,1).setDepth(4).setInteractive({useHandCursor:true}).on('pointerdown',()=>{if(!this.opening&&!this.menuOpening)globalThis.location.assign(`${import.meta.env.BASE_URL}credits.html`);});
  const key=e=>{if(!e.repeat&&!this.menuOpening&&!this.opening)play();};this.input.keyboard.on('keydown-ENTER',key);this.events.once('shutdown',()=>this.input.keyboard.off('keydown-ENTER',key));
  if(recoveredFromBackup)this.add.text(W-25,25,'Save recovered from backup',{fontFamily:'Arial',fontSize:'16px',color:'#ffe0a2'}).setOrigin(1,0).setDepth(8);
  this.cameras.main.fadeIn(450);
 }
 startStory(){
  if(this.opening||this.menuOpening)return;
  // Confirm replacing an existing campaign; keep settings and unlocked chapters.
  if(profile.save)openMenu(this,'confirm');else this.openGate(newCampaign());
 }
 resumeStory(){
  if(this.opening||this.menuOpening||!profile.save)return;
  this.openGate(continueCampaign());
 }
 openGate(target){
  if(this.opening||!target)return;this.audio?.cue('gate');this.opening=true;
  // Draw two decorated doors, briefly close them, then open into the first scene.
  const make=(x)=>{const g=this.add.graphics();g.fillStyle(0x151c29,1).fillRect(0,0,W/2,H);g.fillStyle(0x2a3544,1).fillRect(18,18,W/2-36,H-36);g.lineStyle(4,0xb28a4e,1).strokeRect(25,25,W/2-50,H-50);for(let a=45;a<W/2-40;a+=70){g.lineStyle(2,0x586074,.7).lineBetween(a,37,a,H-37);}g.fillStyle(0xcea55c).fillCircle(x===0?W/2-65:65,H/2,13);return this.add.container(x,0,[g]).setDepth(100);};
  const left=make(0),right=make(W/2);left.x=-W/2;right.x=W;
  this.tweens.add({targets:left,x:0,duration:350,ease:'Cubic.InOut'});
  let done=false;const finish=()=>{if(done)return;done=true;this.scene.start(target.key,target.data);};
  this.tweens.add({targets:right,x:W/2,duration:350,ease:'Cubic.InOut',onComplete:finish});
  this.time.delayedCall(450,finish);
 }
}
