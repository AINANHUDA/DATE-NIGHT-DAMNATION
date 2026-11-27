/** MONKEY MIND III | MODULE
 * Base attack damage, reach, cooldowns and visual effect keys.
 * Customization map: docs/CUSTOMIZATION.md
 */
export const GROUND = 540;
export const ATTACKS = {
 attack1:{damage:11,reach:132,fx:'crescent',cooldown:340},
 attack2:{damage:15,reach:148,fx:'impact',cooldown:480},
 attack3:{damage:19,reach:155,fx:'roar',cooldown:570},
 skill1:{damage:25,reach:230,fx:'crescent',cooldown:950},
 skill2:{damage:20,reach:190,fx:'impact',cooldown:800},
 ultimate:{damage:42,reach:430,fx:'sunburst',cooldown:1350}
};
export const BOSS_FX = {'mini-maliha':['rhea-burst','rhea-drift','rhea-planet','rhea-well'],maliha:['naja-ripple','naja-sandwave','naja-serpent','naja-cyclone']};
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
