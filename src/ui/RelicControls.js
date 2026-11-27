/** Original vector ability emblems and drag-stick math. No external artwork. */
export function joystickVector(dx,dy,radius){const r=Math.max(1,radius),d=Math.hypot(dx,dy),factor=d>r?r/d:1;return {x:dx*factor/r,y:dy*factor/r};}
export function joystickActions(x,y,previousUp=false){return {horizontal:x>.28?'right':x<-.28?'left':null,guard:y>.60,up:y<(previousUp?-.36:-.68)};}
const paths={
 attack:'<path d="M10 50 38 17 55 8 49 25 20 56 17 47Z" fill="url(#g)" stroke="#fff5cf"/><path d="m11 37 16 16M12 53l-6 6" stroke="#e4ad52" stroke-width="5"/><path d="M5 33Q19 7 49 5M19 59Q44 49 59 25" fill="none" stroke="#fff0ac" stroke-width="2"/>',
 heavy:'<path d="m10 49 18-20-8-9 15-14 25 23-15 16-9-8-18 22Z" fill="url(#g)" stroke="#ffd6a1" stroke-width="2"/><path d="m26 15 23 23M6 30 15 32M44 5l-2 7M56 48l5 4" stroke="#fff" stroke-width="2"/>',
 shoot:'<path d="M10 12Q6 39 26 50T57 38L52 29Q39 44 25 29T18 9Z" fill="url(#g)" stroke="#fff1ab" stroke-width="2"/><path d="M12 16Q17 47 47 44M6 52h14M42 9h14M48 3v12" fill="none" stroke="#f9ffc8" stroke-width="2"/>',
 skill:'<path d="M32 4 39 22 59 32 39 41 32 60 23 41 5 32 23 23Z" fill="url(#g)" stroke="#e6d7ff" stroke-width="2"/><path d="m32 14 5 18-5 18-5-18Z" fill="#fff5ff"/><path d="M9 9l7 7M55 9l-7 7M9 55l7-7M55 55l-7-7" stroke="#d5baff" stroke-width="3"/>',
 ultimate:'<path d="M32 2 37 12 47 5 48 18 61 17 55 28 64 32 55 37 61 48 48 47 47 60 37 53 32 64 26 53 16 60 16 47 3 48 9 37 0 32 9 27 3 17 16 18 16 5 26 12Z" fill="url(#g)" stroke="#ffeac1"/><circle cx="32" cy="32" r="19" fill="#562109" stroke="#ffe6a4" stroke-width="2"/><path d="M23 17Q14 40 34 44 48 45 48 29 36 39 29 25L28 17Z" fill="#ffe178" stroke="#fff3be" stroke-width="2"/>',
 jump:'<path d="M32 5 52 28H41v17H23V28H12Z" fill="url(#g)" stroke="#e6ffff" stroke-width="2"/><path d="M12 41 4 32M52 41l8-9M25 53l-4 7M39 53l4 7" stroke="#d8ffff" stroke-width="3"/>',
 dash:'<path d="m3 16 18 16L3 48h12l19-16-19-16ZM29 16l18 16-18 16h12l20-16-20-16Z" fill="url(#g)" stroke="#e5fdff" stroke-width="1.5"/>',
 guard:'<path d="M32 4 55 13 52 38Q45 53 32 60 19 53 12 38L9 13Z" fill="url(#g)" stroke="#e4ffff" stroke-width="2"/><path d="M32 12v39M17 20l15 7 15-7" stroke="#fff4c7" stroke-width="3"/>'};
export function emblem(action,color){return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="mm-${action}" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fff9df"/><stop offset=".45" stop-color="${color}"/><stop offset="1" stop-color="#241329"/></linearGradient></defs>${paths[action].replaceAll('url(#g)',`url(#mm-${action})`)}</svg>`;}
