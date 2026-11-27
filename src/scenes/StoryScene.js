/** MONKEY MIND III | MODULE
 * Cinematic staging, actor positioning, text reveal and chapter events.
 * Customization map: docs/CUSTOMIZATION.md
 */
import { cover } from '../ui/Presentation.js';
import { markChapter, completeCampaign } from '../systems/CampaignProfile.js';
import { openMenu } from './MenuScene.js';
import { AudioDirector, audioSettings } from '../audio/AudioDirector.js';
import Phaser from 'phaser';
import {chapterWipe} from '../combat/CinematicDirector.js';
import {GAME_WIDTH as W,GAME_HEIGHT as H} from '../config/gameConfig.js';
import {CHARACTERS} from '../config/assetManifest.js';
import {registerCharacterAnimations,setCharacter,animationKey} from '../characters/CharacterAnimations.js';
import { NAMES, SCENES } from '../config/storyDialogue.js';
export class StoryScene extends Phaser.Scene {
 constructor(){super('StoryScene');}
 init(data={}){this.chapter=SCENES[data.chapter]?data.chapter:'prologue';this.payload=data.payload||{};this.gate=!!data.gate;}
 create(){
  this.menuOpening=false;markChapter(this.chapter,this.payload);this.audio=new AudioDirector(this);this.audio.setTrack(this.chapter==='ending'?'music-victory':this.chapter==='prologue'?'music-date':'music-sanctuary');this.audio.setAmbience(this.chapter==='prologue'||this.chapter==='ending'?'ambient-woods':'ambient-sanctuary');this.part=0;this.nextAllowedAt=this.time.now+(this.gate?750:420);this.leaving=false;this.typing=false;this.actors={};this.cameras.main.resetFX();registerCharacterAnimations(this);this.script=SCENES[this.chapter];
  this.bg=cover(this.add.image(W/2,H/2,this.script.bg),W,H);this.tweens.add({targets:this.bg,scaleX:this.bg.scaleX*1.035,scaleY:this.bg.scaleY*1.035,yoyo:true,repeat:-1,duration:12000,ease:'Sine.InOut'});
  const floor=540;
  const actor=(id,x,h,flip=false,visible=true)=>{const s=this.add.sprite(x,floor,CHARACTERS[id].texture).setDepth(3);setCharacter(s,id,h);s.setFlipX(flip).setVisible(visible);this.actors[id]=s;return s;};
  if(this.chapter==='prologue'){actor('ainan',505,230);actor('jennifer',725,210,true);actor('maliha',W+100,225,true,false);}
  else if(this.chapter==='mini'){actor('ainan',350,236);actor('mini-maliha',925,222,true);}
  else if(this.chapter==='final'){actor('ainan',230,230);actor('maliha',835,240,true);actor('jennifer',1100,150,true);this.cage(1100,floor,150,225);}
  else{actor('ainan',530,225);actor('jennifer',720,210,true);actor('maliha',1060,180,true);}
  const shade=this.add.graphics().setDepth(10);shade.fillGradientStyle(0x050811,0x050811,0x050811,0x050811,.88,.88,0,0).fillRect(0,0,W,140);shade.fillGradientStyle(0x080d18,0x080d18,0x080d18,0x080d18,0,0,.98,.98).fillRect(0,470,W,250);shade.fillStyle(0x070b14,.98).fillRect(0,565,W,H-565);shade.fillStyle(0xc99f60,.85).fillRect(36,565,W-72,2);
  this.text(42,25,this.script.number,18,'#e5bc77').setDepth(11);this.text(42,52,this.script.title,35,'#fff0d1','Georgia').setDepth(11);
  // The opening date and kidnapping must play in order. Other cinematics retain optional skipping.
  if(this.chapter!=='prologue'){const skip=this.text(W-42,32,'SKIP SCENE  ››',19,'#e4d7c4').setOrigin(1,0).setDepth(12).setInteractive({useHandCursor:true});skip.on('pointerdown',()=>this.leave());}const voiceToggle=this.text(W-42,60,'',14,'#e4d7c4').setOrigin(1,0).setDepth(12).setInteractive({useHandCursor:true});this.audio.onChange=()=>voiceToggle.setText(`SOUND ${audioSettings.enabled?'ON':'OFF'} (M)  •  VOICES ${audioSettings.voice?'ON':'OFF'} (V)`);this.audio.onChange();voiceToggle.on('pointerdown',()=>this.audio.toggleVoice());
  this.speaker=this.text(48,579,'',21,'#f4c56d').setDepth(12);this.line=this.text(48,611,'',28,'#fff5e6').setDepth(12);this.line.setX(172).setWordWrapWidth(W-230);this.speaker.setX(172);this.speakerPortrait=this.add.image(93,639,'ainan-portrait').setDisplaySize(112,112).setDepth(12);this.add.rectangle(93,639,118,118,0x171820,0).setStrokeStyle(2,0xc99f60,.8).setDepth(13);
  this.nextLabel=this.text(W-44,H-14,'ENTER / TAP TO CONTINUE  ›',14,'#e9c98a').setOrigin(1,1).setDepth(13);
  this.progress=this.text(45,H-14,'',13,'#b5b6c4').setOrigin(0,1).setDepth(12);
  const area=this.add.rectangle(W/2,640,W,150,0x000000,0.001).setDepth(14).setInteractive({useHandCursor:true});area.on('pointerdown',()=>this.next());
  const key=e=>{if(e.repeat)return;if(e.code==='Enter'||e.code==='Space')this.next();else if(e.code==='Escape')openMenu(this);};this.input.keyboard.on('keydown',key);this.events.once('shutdown',()=>{this.input.keyboard.off('keydown',key);this.typeEvent?.remove(false);});
  const pause=this.text(W-42,92,'Ⅱ  PAUSE',16,'#e4d7c4').setOrigin(1,0).setDepth(12).setInteractive({useHandCursor:true});pause.on('pointerdown',()=>openMenu(this));
  this.show();
  if(this.gate){const g=(x)=>this.add.rectangle(x,H/2,W/2+2,H,0x202938).setDepth(100).setStrokeStyle(4,0xb28a4e);const l=g(W/4),r=g(W*3/4);this.tweens.add({targets:l,x:-W/4,duration:700,ease:'Cubic.InOut',onComplete:()=>l.destroy()});this.tweens.add({targets:r,x:W*1.25,duration:700,ease:'Cubic.InOut',onComplete:()=>r.destroy()});}else this.cameras.main.fadeIn(420);
 }
 text(x,y,value,size,color='#fff',font='Arial'){return this.add.text(x,y,value,{fontFamily:font==='Arial'?'Rajdhani, Arial':font,fontSize:`${size}px`,color,fontStyle:'bold',stroke:'#10121c',strokeThickness:2});}
 cage(x,y,w,h){const g=this.add.graphics().setDepth(5);g.lineStyle(7,0x584862,1).strokeRoundedRect(x-w/2,y-h,w,h,12);g.lineStyle(3,0xb499ce,.9).strokeRoundedRect(x-w/2+4,y-h+4,w-8,h-8,10);for(let i=-2;i<=2;i++){g.lineStyle(5,0x62536e,1).lineBetween(x+i*w/6,y-h+5,x+i*w/6,y-4);}g.fillStyle(0x916fba,1).fillRoundedRect(x-12,y-h*.5,24,28,4);this.prison=g;}
 effect(key,x,y,size){if(!this.textures.exists(key))return;const s=this.add.image(x,y,key).setDepth(6);const scale=size/Math.max(s.width,s.height);s.setScale(scale*.55).setAlpha(.9);this.tweens.add({targets:s,scaleX:scale,scaleY:scale,angle:50,alpha:0,duration:750,ease:'Cubic.Out',onComplete:()=>s.destroy()});}
 act(id,state){const s=this.actors[id];if(s&&CHARACTERS[id].animations[state])s.play(animationKey(id,state),true);}
 event(name){this.audio?.cue(name==='release'?'heal':name==='entry'||name==='escape'?'dash':name==='endingDown'?'heavy':'magic');const a=this.actors;switch(name){
  case 'entry':this.audio?.cue('meme-scratch',.46,1200);a.maliha.setVisible(true);this.act('maliha','walk');this.tweens.add({targets:a.maliha,x:1010,duration:650,ease:'Cubic.Out',onComplete:()=>this.act('maliha','idle')});break;
  case 'kidnap':this.act('maliha','skill1');this.effect('fx-naja-cyclone',725,410,370);this.cameras.main.shake(180,.008);break;
  case 'escape':this.act('maliha','run');this.tweens.add({targets:[a.jennifer,a.maliha],x:W+260,alpha:0,duration:650});break;
  case 'resolve':this.act('ainan','run');this.tweens.add({targets:a.ainan,x:680,duration:450});break;
  case 'miniPower':this.act('mini-maliha','skill1');this.effect('fx-rhea-well',925,385,330);this.cameras.main.shake(160,.004);break;
  case 'cageReveal':this.effect('fx-naja-serpent',1070,390,260);break;
  case 'finalPower':this.act('maliha','ultimate');this.effect('fx-naja-cyclone',835,380,370);this.cameras.main.shake(180,.007);break;
  case 'endingDown':this.act('maliha','down');break;
  case 'release':this.tweens.add({targets:a.jennifer,x:665,duration:450});this.effect('fx-cora-feather',650,385,220);break;
 }}
 show(){const [id,full,event]=this.script.lines[this.part];this.typeEvent?.remove(false);this.speaker.setText(NAMES[id]);this.speakerPortrait.setTexture(`${id}-portrait`).setDisplaySize(112,112);this.speaker.setColor(id==='maliha'?'#ff9ea5':id==='mini-maliha'?'#b9aaff':id==='jennifer'?'#a6e3ec':'#f4c56d');this.progress.setText(`${this.part+1} / ${this.script.lines.length}`);this.audio?.say(`${this.chapter}-${this.part}`);this.full=full;this.line.setText('');this.typing=true;let i=0;this.typeEvent=this.time.addEvent({delay:18,repeat:full.length-1,callback:()=>{this.line.setText(full.slice(0,++i));if(i>=full.length)this.typing=false;}});if(event)this.event(event);}
 next(){if(this.leaving||this.menuOpening||this.time.now<this.nextAllowedAt)return;this.nextAllowedAt=this.time.now+250;if(this.typing){this.typeEvent?.remove(false);this.line.setText(this.full);this.typing=false;return;}if(++this.part>=this.script.lines.length){this.leave();return;}this.show();}
 leave(){if(this.leaving||this.menuOpening)return;if(this.chapter==='prologue'&&this.part<this.script.lines.length)return;this.audio?.stopVoice();this.audio?.cue('gate');this.leaving=true;this.typeEvent?.remove(false);const data={...this.payload};if(this.chapter==='mini')data.stage=0;if(this.chapter==='final')data.stage=1;if(this.chapter==='ending')completeCampaign();chapterWipe(this,W,H,()=>this.scene.start(this.script.next,data));}
}
