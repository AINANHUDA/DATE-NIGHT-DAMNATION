import {gothicTitle,relicRule} from '../ui/GothicArt.js';
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
  const veil=this.add.graphics().fillGradientStyle(0x17090e,0x100b12,0x10070b,0x100b12,.92,.25,.98,.65).fillRect(0,0,W,H);
  const hero=this.add.sprite(940,590,CHARACTERS.ainan.texture);setCharacter(hero,'ainan',380);
  const glow=this.add.ellipse(940,594,250,32,0x000000,.34).setDepth(0);hero.setDepth(1);
  for(let i=0;i<(settings.graphics==='low'?8:24);i++){const x=Phaser.Math.Between(10,W-10),y=Phaser.Math.Between(80,H-30);const p=this.add.circle(x,y,Phaser.Math.Between(1,3),0xffd78d,.5).setDepth(2);this.tweens.add({targets:p,y:y-65,alpha:.08,duration:1800+i*95,yoyo:true,repeat:-1,ease:'Sine.InOut'});}
  const t=(x,y,str,size,color='#f8ebce')=>this.add.text(x,y,str,{fontFamily:'Georgia, Times New Roman, serif',fontSize:`${size}px`,color,fontStyle:'bold',stroke:'#160c12',strokeThickness:2}).setDepth(4);
  const ornaments=this.add.graphics().setDepth(3);ornaments.lineStyle(2,0xa7804e,.7).strokeRect(26,25,W-52,H-50);ornaments.lineStyle(1,0x8b623b,.5).strokeRect(34,33,W-68,H-66);
  t(350,64,'A   M O N K E Y   M I N D   A D V E N T U R E',14,'#ddbc81').setOrigin(.5);
  gothicTitle(this,350,206,625,4);
  t(350,330,'T H E   R E S C U E',24,'#e2be80').setOrigin(.5);relicRule(this,350,361,492);
  this.add.text(350,390,'One date. One kidnapping.\nAn unreasonable number of bananas.',{fontFamily:'Georgia, serif',fontSize:'22px',color:'#e2d3bc',align:'center',lineSpacing:8}).setOrigin(.5,0).setDepth(4);
  const menuButton=(x,y,w,label,action,primary=false,enabled=true)=>{const bg=this.add.rectangle(x,y,w,49,primary?0x4f1823:0x171218,primary?.98:.82).setStrokeStyle(1,enabled?0xb89760:0x5a4d43,.9).setDepth(5);const g=this.add.graphics().setDepth(6);g.lineStyle(1,0x917147,.7).strokeRect(x-w/2+5,y-19,w-10,38);for(const dx of [-w/2+10,w/2-10]){g.fillStyle(enabled?0xd3aa65:0x736251);g.fillPoints([{x:x+dx-4,y},{x:x+dx,y:y-5},{x:x+dx+4,y},{x:x+dx,y:y+5}],true);}const txt=t(x,y,label,primary?23:18,enabled?'#f5dfac':'#84786d').setOrigin(.5).setDepth(7);if(!enabled)return;bg.setInteractive({useHandCursor:true});bg.on('pointerover',()=>{bg.setFillStyle(primary?0x8a2734:0x3b242b);txt.setColor('#fff5da');});bg.on('pointerout',()=>{bg.setFillStyle(primary?0x4f1823:0x171218);txt.setColor('#f5dfac');});bg.on('pointerdown',()=>{if(!this.opening&&!this.menuOpening)action();});};
  // Always starts prologue; continuation is a separate action.
  const play=()=>this.startStory();
  menuButton(350,493,492,'Start Story',play,true);
  menuButton(224,553,240,profile.save?'Continue Save':'No Saved Game',()=>this.resumeStory(),false,!!profile.save);
  menuButton(476,553,240,'Chapters',()=>openMenu(this,'chapters'));
  menuButton(224,613,240,'Settings',()=>openMenu(this,'settings'));
  menuButton(476,613,240,`Completed: ${profile.completed}`,()=>openMenu(this,'chapters'));
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
