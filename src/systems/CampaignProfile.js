/** MONKEY MIND III | MODULE
 * Local storage saves, recovery, chapter selection, default settings and damage difficulty.
 * Customization map: docs/CUSTOMIZATION.md
 */
import { checkpointXs, potionHomes, enemyHomes, ledges, groundBananas, secretBananas } from '../world/ExpeditionLayout.js';
// Browser-local, versioned profile. Storage denial is nonfatal.
const KEY='monkey-mind-iii.profile.v1';
const BACKUP=KEY+'.backup';
const bananaIds=new Set([...ledges.flatMap(([x,y,w])=>[[x+w*.3,y-30],[x+w*.73,y-30]]),...groundBananas,...secretBananas].map(([x,y])=>`${x}:${y}`));
const validIds=(values,allowed)=>Array.isArray(values)?[...new Set(values.filter(v=>allowed.has(v)))]:[];
const potionIds=new Set(potionHomes), enemyIds=new Set(enemyHomes);
export const CHAPTERS=['prologue','chase','mini','final','ending'];
export const DEFAULT_SETTINGS={enabled:true,voice:true,musicVolume:1,sfxVolume:1,voiceVolume:1,difficulty:'normal',graphics:'high'};
const defaults=()=>({settings:{...DEFAULT_SETTINGS},unlocked:0,save:null,completed:0});
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const num=(v,f,a,b)=>Number.isFinite(v)?clamp(v,a,b):f;
function payload(data={}){data=data&&typeof data==='object'?data:{};return {bananas:num(data.bananas,52,0,83),ammo:num(data.ammo,20,0,999),energy:num(data.energy,100,0,100),hp:num(data.hp,100,1,100)};}
function checkpoint(c){if(!c||!checkpointXs.includes(c.x))return null;return {x:c.x,hp:num(c.hp,100,1,100),ammo:num(c.ammo,3,0,999),energy:num(c.energy,0,0,100),bananas:validIds(c.bananas,bananaIds),potions:validIds(c.potions,potionIds),enemies:validIds(c.enemies,enemyIds)};}
export function normalize(raw){const p=defaults(),s=raw?.settings||{};for(const k of ['enabled','voice'])if(typeof s[k]==='boolean')p.settings[k]=s[k];for(const k of ['musicVolume','sfxVolume','voiceVolume'])p.settings[k]=num(s[k],DEFAULT_SETTINGS[k],0,1);if(['easy','normal','hard'].includes(s.difficulty))p.settings.difficulty=s.difficulty;if(['high','low'].includes(s.graphics))p.settings.graphics=s.graphics;p.unlocked=Math.floor(num(raw?.unlocked,0,0,4));p.completed=Math.floor(num(raw?.completed,0,0,99999));const v=raw?.save;if(v&&CHAPTERS.includes(v.chapter)){p.save={chapter:v.chapter,payload:payload(v.payload),checkpoint:checkpoint(v.checkpoint)};p.unlocked=Math.max(p.unlocked,CHAPTERS.indexOf(v.chapter));}return p;}
function readProfile(key){try{const v=JSON.parse(globalThis.localStorage?.getItem(key)||'null');return v&&typeof v==='object'&&!Array.isArray(v)&&v.settings&&typeof v.settings==='object'&&!Array.isArray(v.settings)&&Object.hasOwn(v,'save')&&(v.save===null||(typeof v.save==='object'&&CHAPTERS.includes(v.save?.chapter)))?v:null;}catch{return null;}}
const primary=readProfile(KEY), backup=primary?null:readProfile(BACKUP);
export const recoveredFromBackup=!!backup;
export const profile=normalize(primary||backup);
export const settings=profile.settings;
export const session={replay:false};
export function persist(){try{if(!globalThis.localStorage)return false;const value=JSON.stringify(profile);globalThis.localStorage.setItem(KEY,value);try{globalThis.localStorage.setItem(BACKUP,value);}catch{try{globalThis.localStorage.removeItem(BACKUP);}catch{}}return true;}catch{return false;}}
export function newCampaign(){session.replay=false;profile.save={chapter:'prologue',payload:payload(),checkpoint:null};persist();return route(profile.save);}
export function markChapter(chapter,data={},cp=null){if(session.replay||!CHAPTERS.includes(chapter))return;profile.unlocked=Math.max(profile.unlocked,CHAPTERS.indexOf(chapter));profile.save={chapter,payload:payload(data),checkpoint:checkpoint(cp)};persist();}
export function completeCampaign(){if(session.replay)return;profile.completed++;profile.unlocked=4;profile.save=null;persist();}
export function route(save){if(!save)return null;if(save.chapter==='chase')return {key:'ChaseScene',data:{checkpoint:save.checkpoint}};return {key:'StoryScene',data:{chapter:save.chapter,payload:save.payload||{},gate:save.chapter==='prologue'}};}
export function continueCampaign(){session.replay=false;return route(profile.save);}
export function replayChapter(chapter){if(!CHAPTERS.includes(chapter)||CHAPTERS.indexOf(chapter)>profile.unlocked)return null;session.replay=true;return route({chapter,payload:payload(),checkpoint:null});}
export function incomingDamage(amount){return Math.max(1,Math.round(amount*({easy:.65,normal:1,hard:1.3}[settings.difficulty]||1)));}
