/** MONKEY MIND III | MODULE
 * Music, ambience, voice playback, ducking, effect volume and scene cleanup.
 * Customization map: docs/CUSTOMIZATION.md
 */
// Scene-owned audio. Audio failures never block a transition or combat update.
import { settings, persist } from '../systems/CampaignProfile.js';
export const audioSettings=settings;
export class AudioDirector {
 constructor(scene){this.s=scene;this.track=null;this.music=null;this.ambience=null;this.ambientKey=null;this.voice=null;this.effects=new Set();this.effectVolumes=new WeakMap();this.last=new Map();this.closed=false;this.pendingVoice=null;this.menuPaused=false;
  this.retry=()=>this.ensure();this.toggleKey=e=>{if(!e?.repeat&&!this.menuPaused)this.toggle();};this.voiceKey=e=>{if(!e?.repeat&&!this.menuPaused)this.toggleVoice();};
  scene.input?.on('pointerdown',this.retry);scene.input?.keyboard?.on('keydown',this.retry);scene.input?.keyboard?.on('keydown-M',this.toggleKey);scene.input?.keyboard?.on('keydown-V',this.voiceKey);
  scene.sound?.on('unlocked',this.retry);scene.events.once('shutdown',()=>this.dispose());
 }
 ready(){return !this.closed&&!this.menuPaused&&settings.enabled&&!this.s.sound?.locked;}
 make(key,config){if(!this.ready()||!this.s.cache?.audio?.exists(key))return null;let sound;try{sound=this.s.sound.add(key,config);if(!sound.play()){sound.destroy();return null;}return sound;}catch(e){try{sound?.destroy();}catch{}return null;}}
 stop(sound){try{sound?.destroy();}catch{}}
 setTrack(key){if(this.track===key){this.ensure();return;}this.track=key;this.stop(this.music);this.music=null;this.ensure();}
 setAmbience(key){if(this.ambientKey===key)return;this.ambientKey=key;this.stop(this.ambience);this.ambience=null;this.ensure();}
 ensure(){if(!this.ready())return;if(this.ambientKey&&!this.ambience)this.ambience=this.make(this.ambientKey,{loop:true,volume:.26*settings.musicVolume});if(this.track&&!this.music)this.music=this.make(this.track,{loop:true,volume:(this.voice?.isPlaying? .11:.24)*settings.musicVolume});if(this.pendingVoice&&settings.voice){const key=this.pendingVoice;this.pendingVoice=null;this.say(key);}}
 cue(name,volume=.42,spacing=65){if(!this.ready())return;const now=this.s.time?.now??0;if(now-(this.last.get(name)??-Infinity)<spacing)return;this.last.set(name,now);const sound=this.make(name.startsWith('announcer-')?name:`sfx-${name}`,{volume:volume*settings.sfxVolume});if(!sound)return;this.effects.add(sound);this.effectVolumes.set(sound,volume);sound.once('complete',()=>{this.effects.delete(sound);this.stop(sound);});if(this.effects.size>16){const old=this.effects.values().next().value;this.effects.delete(old);this.stop(old);}}
 stopVoice(){this.pendingVoice=null;const old=this.voice;this.voice=null;this.stop(old);try{this.music?.setVolume(.24*settings.musicVolume);}catch{}}
 say(key){this.stopVoice();if(!settings.voice||!settings.enabled||this.closed)return;if(!this.ready()){this.pendingVoice=key;return;}const sound=this.make(`voice-${key}`,{volume:.8*settings.voiceVolume});if(!sound)return;this.voice=sound;try{this.music?.setVolume(.11*settings.musicVolume);}catch{}sound.once('complete',()=>{if(this.voice===sound){this.voice=null;try{this.music?.setVolume(.24*settings.musicVolume);}catch{}}this.stop(sound);});}
 toggle(){settings.enabled=!settings.enabled;persist();if(!settings.enabled){this.stopVoice();this.stop(this.music);this.music=null;this.stop(this.ambience);this.ambience=null;for(const s of this.effects)this.stop(s);this.effects.clear();}else this.ensure();this.onChange?.();return settings.enabled;}
 toggleVoice(){settings.voice=!settings.voice;persist();if(!settings.voice)this.stopVoice();this.onChange?.();return settings.voice;}
 pauseForMenu(){if(this.menuPaused)return;this.menuPaused=true;this.menuSounds=new Set();for(const a of [this.music,this.ambience,this.voice,...this.effects])if(a?.isPlaying){try{a.pause();this.menuSounds.add(a);}catch{}}}
 refreshSettings(){if(!settings.enabled){this.stopVoice();this.stop(this.music);this.music=null;this.stop(this.ambience);this.ambience=null;for(const a of this.effects)this.stop(a);this.effects.clear();this.menuSounds?.clear();}else{if(!settings.voice)this.stopVoice();try{this.music?.setVolume(this.voice? .11*settings.musicVolume:.24*settings.musicVolume);this.ambience?.setVolume(.26*settings.musicVolume);this.voice?.setVolume(.8*settings.voiceVolume);for(const a of this.effects)a.setVolume((this.effectVolumes.get(a)??.42)*settings.sfxVolume);}catch{}if(!this.menuPaused)this.ensure();}this.onChange?.();}
 resumeFromMenu(){this.menuPaused=false;const live=new Set([this.music,this.ambience,this.voice,...this.effects]);if(settings.enabled)for(const a of this.menuSounds||[])if(live.has(a)){try{a.resume();}catch{}}this.menuSounds?.clear();this.refreshSettings();}
 dispose(){if(this.closed)return;this.closed=true;this.s.sound?.off('unlocked',this.retry);this.s.input?.off('pointerdown',this.retry);this.s.input?.keyboard?.off('keydown',this.retry);this.s.input?.keyboard?.off('keydown-M',this.toggleKey);this.s.input?.keyboard?.off('keydown-V',this.voiceKey);this.stopVoice();this.stop(this.music);this.music=null;this.stop(this.ambience);this.ambience=null;for(const s of this.effects)this.stop(s);this.effects.clear();}
}
