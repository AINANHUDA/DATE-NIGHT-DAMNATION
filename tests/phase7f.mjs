import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { EventEmitter } from 'node:events';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const {AudioDirector,audioSettings}=await import('../src/audio/AudioDirector.js');
const scene={sound:new EventEmitter(),events:new EventEmitter(),input:new EventEmitter(),time:{now:100},cache:{audio:{exists:k=>k!=='sfx-missing'}}};scene.input.keyboard=new EventEmitter();scene.sound.locked=true;
const instances=[];scene.sound.add=(key,config)=>{const a=Object.assign(new EventEmitter(),{key,config,playing:false,destroyed:false,play(){this.isPlaying=true;return true;},destroy(){this.destroyed=true;this.isPlaying=false;},setVolume(v){this.volume=v;}});instances.push(a);return a;};
let d=new AudioDirector(scene);d.setTrack('music-date');d.setAmbience('ambient-woods');d.say('prologue-0');assert.equal(instances.length,0);scene.sound.locked=false;scene.sound.emit('unlocked');assert.equal(d.music.key,'music-date');assert.equal(d.ambience.key,'ambient-woods');assert.equal(d.voice.key,'voice-prologue-0');assert.equal(d.music.volume,.11);
const oldVoice=d.voice;d.say('prologue-1');assert(oldVoice.destroyed);assert.equal(d.voice.key,'voice-prologue-1');d.voice.emit('complete');assert.equal(d.voice,null);assert.equal(d.music.volume,.24);
let old=d.music;d.setTrack('music-woods');assert(old.destroyed);assert.equal(d.music.key,'music-woods');let n=instances.length;d.cue('pickup');d.cue('pickup');assert.equal(instances.length,n+1);scene.time.now+=100;d.cue('pickup');assert.equal(instances.length,n+2);d.cue('missing');assert.equal(instances.length,n+2);
scene.input.keyboard.emit('keydown-V',{});assert(!audioSettings.voice);d.say('prologue-2');assert(!d.voice);scene.input.keyboard.emit('keydown-V',{repeat:true});assert(!audioSettings.voice);scene.input.keyboard.emit('keydown-V',{});assert(audioSettings.voice);d.say('prologue-2');assert(d.voice);
scene.input.keyboard.emit('keydown-M',{});assert(!audioSettings.enabled);assert(!d.music&&!d.voice&&!d.ambience);assert.equal(d.effects.size,0);scene.input.keyboard.emit('keydown-M',{});assert(audioSettings.enabled&&d.music&&d.ambience);
scene.events.emit('shutdown');assert(instances.every(s=>s.destroyed));assert.equal(scene.sound.listenerCount('unlocked'),0);assert.equal(scene.input.keyboard.listenerCount('keydown-M'),0);assert.equal(scene.input.listenerCount('pointerdown'),0);
const lines=JSON.parse(read('src/audio/voiceLines.json'));assert.equal(Object.keys(lines).length,50);const story=read('src/config/storyDialogue.js');const scripts=vm.runInNewContext(story.replaceAll('export const ','const ')+'\nSCENES');let count=0;for(const [chapter,script] of Object.entries(scripts)){for(const [i,[id,line]] of script.lines.entries()){assert.equal(lines[`${chapter}-${i}`],line);count++;}}assert.equal(count,39);
for(const key of Object.keys(lines)){const bytes=fs.readFileSync(new URL('../public/assets/audio/campaign/voices/'+key+'.ogg',import.meta.url));assert.equal(bytes.subarray(0,4).toString(),'OggS');}
console.log('PASS: audio unlock, voice replacement and ducking, region music, pickup throttling, optional sounds, mute, repeat-key handling, scene cleanup and all 39 story lines.');
