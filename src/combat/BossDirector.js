/** MONKEY MIND III | MODULE
 * Mini Maliha and Maliha attack patterns, damage, warnings, phase thresholds and difficulty tempo.
 * Customization map: docs/CUSTOMIZATION.md
 */
// Boss attack selection and hazard simulation. All deadlines use combat time.
const MINI = [
 {id:'orbit',name:'ORBITAL VOLLEY',state:'skill1',fx:'rhea-planet',kind:'volley',warn:740,recover:420,damage:8,speed:355,heights:[85,145,48],spacing:200},
 {id:'gravity',name:'GRAVITY WELL',state:'skill2',fx:'rhea-well',kind:'well',warn:1050,recover:460,damage:13,radius:112,active:1100},
 {id:'nova',name:'COSMIC NOVA',state:'ultimate',fx:'rhea-burst',kind:'zone',warn:840,recover:480,damage:15,radius:145,active:420,center:'boss'}
];
const FINAL = {
 serpent:{id:'serpent',name:'SERPENT SUMMON',state:'skill1',fx:'naja-serpent',kind:'volley',warn:850,recover:450,damage:12,speed:430,heights:[65,65],spacing:270},
 cyclone:{id:'cyclone',name:'SAND CYCLONE',state:'skill2',fx:'naja-cyclone',kind:'zone',warn:970,recover:450,damage:16,radius:100,active:750},
 wave:{id:'wave',name:'SAND WAVE',state:'attack3',fx:'naja-sandwave',kind:'volley',warn:650,recover:380,damage:11,speed:500,heights:[32],spacing:0},
 curse:{id:'curse',name:'CURSED MIND',state:'ultimate',fx:'rhea-burst',kind:'zone',warn:1050,recover:480,damage:19,radius:130,active:450},
 cross:{id:'cross',name:'CROSS-FIRE CURSE',state:'skill1',fx:'rhea-planet',kind:'cross',warn:950,recover:530,damage:13,speed:420,heights:[75,145],spacing:300},
 storm:{id:'storm',name:'QUEEN OF CHAOS',state:'ultimate',fx:'naja-cyclone',kind:'storm',warn:1100,recover:550,damage:20,radius:85,active:650}
};
// Tune opportunity windows and cadence, not damage (CampaignProfile owns damage).
const TEMPO={easy:{warn:1.25,recover:1.25,gap:1.28,move:.85},normal:{warn:1,recover:1,gap:1,move:1},hard:{warn:.87,recover:.85,gap:.78,move:1.12}};
export function bossTempo(difficulty){return TEMPO[difficulty]||TEMPO.normal;}
export function bossTiming(pattern,phase,difficulty){const t=bossTempo(difficulty);return {warn:Math.max(500,Math.round(Math.max(580,pattern.warn-phase*85)*t.warn)),recover:Math.round(pattern.recover*t.recover)};}
export function bossPhase(stage,hp,max){if(stage!==1)return 0;return hp/max<=.35?2:hp/max<=.70?1:0;}
export function bossPattern(stage,phase,index){const list=stage!==1?MINI:phase===0?[FINAL.serpent,FINAL.cyclone,FINAL.wave]:phase===1?[FINAL.curse,FINAL.cross,FINAL.serpent,FINAL.cyclone]:[FINAL.storm,FINAL.cross,FINAL.wave,FINAL.curse];return list[index%list.length];}
export function inZone(player,x,radius,ground,kind){return Math.abs(player.x-x)<=radius+20&&(kind==='well'||kind==='storm'||player.y>=ground-125);}
export function sweptHit(previous,next,x,radius){return Math.min(previous,next)<=x+radius&&Math.max(previous,next)>=x-radius;}
const cap=(v,a,b)=>Math.max(a,Math.min(b,v));
export class BossDirector {
 constructor(scene,width,ground,getDifficulty=()=> 'normal'){this.getDifficulty=getDifficulty;this.s=scene;this.width=width;this.ground=ground;this.phase=0;this.index=0;this.nextSpecial=3300;this.nextMelee=0;this.meleeIndex=0;this.cinematicShown=false;this.cast=null;this.hazards=[];this.warning=scene.add.graphics().setDepth(4);this.label=scene.text(width/2,145,'',19,'#ffe3a1').setOrigin(.5).setDepth(27);}
 control(dt){const s=this.s,b=s.boss,p=s.player,n=s.now;if(b.hp<=0||p.hp<=0)return;
  const phase=bossPhase(s.stage,b.hp,b.maxHp);
  if(phase!==this.phase){s.audio?.cue('ultimate');this.phase=phase;this.index=0;this.nextSpecial=Math.min(this.nextSpecial,n+900);s.sub.setText(phase===1?'PHASE II — CURSED MIND':'PHASE III — TOTAL CHAOS');s.floatText(this.width/2,215,phase===1?'CURSED MIND AWAKENS':'TOTAL CHAOS','#ffb3dd');s.cameras.main.flash(180,130,65,170);}
  // Being struck cancels unreleased casts, but hazards already released persist.
  if(this.cast){if(b.attack!==this.cast.attack&&!this.cast.released){this.cast=null;this.nextSpecial=n+1100;this.label.setText('');}else if(n>=this.cast.end){this.cast=null;this.label.setText('');}else return;}
  if(b.attack||n<b.stun||n<s.graceUntil)return;
  const dx=p.x-b.x,dist=Math.abs(dx),tempo=bossTempo(this.getDifficulty());b.dir=dx>=0?1:-1;
  if(n>=this.nextSpecial&&n>=b.ready){this.start(bossPattern(s.stage,this.phase,this.index++));return;}
  if(dist<150&&Math.abs(p.y-b.y)<135&&n>=this.nextMelee&&n>=b.ready){const states=['attack1','attack2','attack3'];const state=states[this.meleeIndex%3];const fx=s.stage===1?['naja-ripple','naja-sandwave','naja-serpent']:['rhea-burst','rhea-drift','rhea-planet'];if(s.beginAttack(b,state,{damage:(s.stage===1?12:8)+this.phase*2,reach:155,cooldown:650},fx[this.meleeIndex%3])){this.meleeIndex++;this.nextMelee=n+Math.round((s.stage===1?900-this.phase*100:1150)*tempo.gap);b.vx=0;return;}}
  let target=s.stage===0?(dist<95?-b.dir*95:dist>200?b.dir*155:0):(dist>120?b.dir*(175+this.phase*22):0);
  // Never keep running into the arena wall while trying to retreat.
  if((b.x<=80&&target<0)||(b.x>=this.width-80&&target>0))target=0;
  b.vx+=(target*tempo.move-b.vx)*Math.min(1,dt*8);
 }
 start(pattern){const s=this.s,b=s.boss,p=s.player,n=s.now;const {warn,recover}=bossTiming(pattern,this.phase,this.getDifficulty());const end=n+warn+recover;const x=cap(pattern.center==='boss'?b.x:p.x,65,this.width-65);const direction=b.dir;const attack={state:pattern.state,rule:{damage:0,reach:0},fx:pattern.fx,at:n+warn,end,done:false,bossSpecial:true,dir:direction};b.attack=attack;b.ready=end+180;b.vx=0;s.pose(b,pattern.state);this.cast={pattern,attack,x,sourceX:b.x,dir:direction,at:attack.at,end,warn,released:false};this.nextSpecial=end+Math.round((s.stage===0?1900:Math.max(1050,1900-this.phase*360))*bossTempo(this.getDifficulty()).gap);s.audio?.cue('warning',.36);s.audio?.say(`${s.stage===1?'boss':'mini'}-${pattern.id}`);this.label.setText(pattern.name+'  •  '+(pattern.kind==='volley'?'JUMP / GUARD':pattern.kind==='cross'?'DODGE / GUARD':pattern.kind==='storm'?'FIND A SAFE GAP / DASH':'MOVE AWAY'));if(pattern.state==='ultimate'&&!this.cinematicShown){this.cinematicShown=!!s.cinematic?.start(b.id,[b.sprite,p.sprite],{title:pattern.name,duration:740});}}
 makeHazard(data){const s=this.s;const texture='fx-'+data.fx;let sprite;if(s.textures.exists(texture)){sprite=s.add.image(data.x,data.y,texture);const size=data.kind==='shot'?data.size??78:data.radius*2; sprite.setScale(size/Math.max(sprite.width,sprite.height));}else{sprite=s.add.circle(data.x,data.y,data.kind==='shot'?28:data.radius,0xb16de3,.45);}sprite.setDepth(6).setAlpha(0).setVisible(false);this.hazards.push({...data,sprite,hit:false});}
 release(attack){const c=this.cast;if(!c||c.attack!==attack||c.released)return;c.released=true;this.s.audio?.cue('magic');const p=c.pattern,n=this.s.now;const base={damage:p.damage,fx:p.fx};this.label.setText(p.name);
  if(p.kind==='volley'||p.kind==='cross'){p.heights.forEach((height,i)=>{const cross=p.kind==='cross';const dir=cross?(i%2===0?1:-1):c.dir;const x=cross?(dir===1?18:this.width-18):cap(c.sourceX+dir*70,15,this.width-15);const starts=n+i*p.spacing;this.makeHazard({...base,kind:'shot',x,y:this.ground-height,dir,speed:p.speed,starts,ends:starts+3400,size:p.id==='serpent'?115:78});});}
  else {const positions=p.kind==='storm'?[c.x-245,c.x,c.x+245].map(x=>cap(x,80,this.width-80)).filter((x,i,a)=>a.indexOf(x)===i):[c.x];for(const x of positions)this.makeHazard({...base,kind:p.kind,x,y:this.ground-65,radius:p.radius,starts:n,ends:n+p.active});}
  this.s.flash(p.fx,c.sourceX,c.attack.state==='attack3'?this.ground-55:this.ground-120,c.dir,170);
 }
 update(dt){const s=this.s,n=s.now,p=s.player,g=this.warning;g.clear();if(this.cast&&!this.cast.released&&s.boss.attack===this.cast.attack){const c=this.cast,k=c.pattern.kind;const progress=1-cap((c.at-n)/(c.warn||1),0,1);g.fillStyle(0xff6d82,.15+progress*.12);g.lineStyle(2,0xffa4ad,.85);if(k==='volley'||k==='cross'){for(const height of c.pattern.heights){const left=k==='cross'?0:c.dir===1?c.sourceX:0;const right=k==='cross'?this.width:c.dir===1?this.width:c.sourceX;g.fillRect(left,this.ground-height-15,right-left,30);g.lineBetween(left,this.ground-height,right,this.ground-height);}}else{const xs=k==='storm'?[c.x-245,c.x,c.x+245].map(x=>cap(x,80,this.width-80)):[c.x];for(const x of xs){g.fillEllipse(x,this.ground,c.pattern.radius*2,34);g.strokeEllipse(x,this.ground,c.pattern.radius*2,34);}}}
  for(const h of this.hazards){if(n<h.starts)continue;if(n>=h.ends||h.hit){h.sprite.destroy();continue;}h.sprite.setVisible(true).setAlpha(.93);let hit=false;let dir=h.x<=p.x?1:-1;if(h.kind==='shot'){const previous=h.x;h.x+=h.dir*h.speed*dt;h.sprite.x=h.x;h.sprite.setFlipX(h.dir<0);hit=sweptHit(previous,h.x,p.x,48)&&h.y>=p.y-165&&h.y<=p.y+15;dir=h.dir;if(h.x<-100||h.x>this.width+100){h.sprite.destroy();continue;}}else{g.fillStyle(0x9e60f2,.22).fillEllipse(h.x,this.ground,h.radius*2,36);if(h.kind==='well'&&Math.abs(p.x-h.x)<h.radius+85&&n>=p.invulnerable){p.x=cap(p.x+Math.sign(h.x-p.x)*75*dt,65,this.width-65);}hit=inZone(p,h.x,h.radius,this.ground,h.kind);}
   if(hit&&!h.spent){s.damage(p,h.damage,dir,s.boss,h.damage>=15);h.hit=true;if(h.kind==='shot')h.sprite.destroy();else{h.hit=false;h.spent=true;}}
  }
  this.hazards=this.hazards.filter(h=>h.sprite.active);
 }
 clear(){this.warning.clear();this.label.setText('');for(const h of this.hazards)h.sprite.destroy();this.hazards=[];this.cast=null;}
}
