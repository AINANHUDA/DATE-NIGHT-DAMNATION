/** MONKEY MIND III | MODULE
 * Asset registry: stable runtime keys mapped to images, atlases and audio under public/assets.
 * Customization map: docs/CUSTOMIZATION.md
 */
import voiceLines from '../audio/voiceLines.json';
import characterData from './characterAtlasData.json';
export const ASSET_PATH = `${import.meta.env.BASE_URL}assets/`;
const ids = ['ainan','jennifer','maliha','mini-maliha'];
export const CHARACTERS = Object.fromEntries(ids.map(id => [id,characterData[id]]));
const effects = {solan:['crescent','impact','roar','sunburst'],cora:['feather','gust','raven'],naja:['cyclone','ripple','sandwave','serpent'],rhea:['burst','drift','planet','well'],fenr:['rush']};
export const assetManifest = {
 images:[...['woods','harbor','sanctuary'].flatMap(theme=>['ground','ledge','prop'].map(kind=>({key:`terrain-${theme}-${kind}`,url:`tilesets/expedition/${theme}-${kind}.png`}))),
  {key:'harbor-bg',url:'backgrounds/sunset/harbor.webp'},
  {key:'prologue-bg',url:'backgrounds/sunset/moonrise.webp'},
  {key:'forest-bg',url:'backgrounds/forest/elderwood.webp'},
  {key:'ending-bg',url:'backgrounds/ending/sunspire.webp'},
  {key:'arena-bg',url:'backgrounds/boss-arena/arena.webp'},
  ...ids.map(id=>({key:`${id}-cutin`,url:`characters/${id}/ui/cutin.webp`})),
  ...ids.map(id=>({key:`${id}-portrait`,url:`characters/${id}/portraits/portrait.webp`})),
  ...Object.entries(effects).flatMap(([owner,names])=>names.map(name=>({key:`fx-${owner}-${name}`,url:`effects/aether/${owner}/fx-${name}.webp` })))],
 spritesheets:[], atlases:Object.values(CHARACTERS).map(c=>({key:c.texture,textureURL:c.image.replace(/[^/]+$/,'atlas-compact.webp'),atlasURL:c.atlas.replace(/[^/]+$/,'atlas-compact.json')})),
 audio:[...['woods','harbor','sanctuary'].map(n=>({key:`ambient-${n}`,url:`audio/campaign/ambient/${n}.ogg`,optional:true})),
  ...['date','woods','harbor','sanctuary','victory'].map(n=>({key:`music-${n}`,url:`audio/campaign/music/${n}.ogg`,optional:true})),
  ...['slash','heavy','hit','guard','jump','dash','shot','magic','warning','ultimate','pickup','heal','checkpoint','fall','gate','click','victory','meme-faa','meme-bonk','meme-scratch'].map(n=>({key:`sfx-${n}`,url:`audio/campaign/sfx/${n}.ogg`,optional:true})),
  ...Object.keys(voiceLines).map(n=>({key:`voice-${n}`,url:`audio/campaign/voices/${n}.ogg`,optional:true})),{key:'final-battle',url:'audio/music/final-battle.mp3'},
  {key:'announcer-fight',url:'audio/voices/announcer/fight.mp3'},
  {key:'announcer-ko',url:'audio/voices/announcer/ko.mp3'}],tilemaps:[]
};
