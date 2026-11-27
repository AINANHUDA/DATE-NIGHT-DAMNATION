import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {SCENES} from '../src/config/storyDialogue.js';
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
const P=await import('../src/systems/CampaignProfile.js');
function load(name,context){const code=fs.readFileSync(new URL('../src/scenes/'+name+'.js',import.meta.url),'utf8').replace(/^import .*;\s*$/gm,'').replace('export class '+name,'class '+name).replaceAll('import.meta.env.BASE_URL',"'/'");return vm.runInNewContext(code+'\n'+name,{Phaser:{Scene:class{}},W:1280,H:720,...context});}
let target,confirm=0;
const Title=load('TitleScene',{...P,openMenu:(owner,page)=>{assert.equal(page,'confirm');confirm++;}});
const title=new Title();title.openGate=t=>target=t;
title.startStory();assert.equal(target.key,'StoryScene');assert.equal(target.data.chapter,'prologue');
for(const chapter of ['chase','mini','final']){
 P.markChapter(chapter);target=null;title.startStory();assert.equal(target,null);assert.equal(P.profile.save.chapter,chapter);
 title.resumeStory();assert.equal(target.key,chapter==='chase'?'ChaseScene':'StoryScene');if(chapter!=='chase')assert.equal(target.data.chapter,chapter);
 // Actual confirmation callback invokes the existing newCampaign route.
 assert.equal(P.newCampaign().data.chapter,'prologue');
}
assert.equal(confirm,3);
let transition=null;
const Story=load('StoryScene',{SCENES,chapterWipe:(s,w,h,fn)=>fn()});
const story=new Story();story.init({chapter:'prologue'});Object.assign(story,{script:SCENES.prologue,part:0,nextAllowedAt:750,time:{now:0},line:{setText(){}},typing:true,show(){this.typing=true;},scene:{start:key=>transition=key}});
story.leave();assert.equal(transition,null);story.next();assert.equal(story.part,0);story.time.now=750;story.next();assert.equal(story.typing,false);story.next();assert.equal(story.part,0);
while(!transition){story.time.now+=300;story.next();if(story.time.now>20000)throw Error('stalled');}
assert.equal(story.part,15);assert.equal(transition,'ChaseScene');
console.log('PASS: fresh story, explicit saved-chapter resume, confirmation preserves save, prologue cannot be skipped, gate input lock, duplicate input debounce, all 15 opening lines before chase.');
