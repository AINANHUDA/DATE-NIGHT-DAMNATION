/** MONKEY MIND III | MODULE
 * Safe-area viewport, fullscreen support and resize cleanup.
 * Customization map: docs/CUSTOMIZATION.md
 */
// Browser display helpers. No gameplay or save state is altered.
export function fullscreenAvailable(doc=globalThis.document){const el=doc?.documentElement;return !!(el&&(el.requestFullscreen||el.webkitRequestFullscreen)&&(doc.fullscreenEnabled!==false||el.webkitRequestFullscreen));}
export function fullscreenActive(doc=globalThis.document){return !!(doc?.fullscreenElement||doc?.webkitFullscreenElement);}
export async function toggleFullscreen(doc=globalThis.document){
 try{if(fullscreenActive(doc)){const exit=doc.exitFullscreen||doc.webkitExitFullscreen;if(!exit)return 'Use your browser to exit fullscreen.';await exit.call(doc);return 'Exited fullscreen.';}
 if(!fullscreenAvailable(doc))return 'Fullscreen unavailable. On iPhone, try Add to Home Screen.';
 const el=doc.documentElement;await (el.requestFullscreen||el.webkitRequestFullscreen).call(el);return 'Fullscreen requested.';
 }catch{return 'Fullscreen was blocked by the browser.';}
}
export function installMobileDisplay(win=globalThis.window,doc=globalThis.document){
 if(!win||!doc)return ()=>{};
 let meta=doc.querySelector('meta[name="viewport"]');const created=!meta;const original=meta?.getAttribute('content');
 if(!meta){meta=doc.createElement('meta');meta.name='viewport';doc.head.appendChild(meta);}
 meta.setAttribute('content','width=device-width, initial-scale=1, viewport-fit=cover');
 let frame=0,last='';const vv=win.visualViewport;
 const refresh=()=>{frame=0;const app=doc.getElementById('app');if(!app)return;const rect=app.getBoundingClientRect();const key=`${rect.width}:${rect.height}`;if(key!==last){last=key;win.dispatchEvent(new win.Event('resize'));}};
 const schedule=()=>{if(!frame)frame=win.requestAnimationFrame(refresh);};
 vv?.addEventListener('resize',schedule);win.addEventListener('orientationchange',schedule);doc.addEventListener('fullscreenchange',schedule);doc.addEventListener('webkitfullscreenchange',schedule);
 const observer=win.ResizeObserver?new win.ResizeObserver(schedule):null;const app=doc.getElementById('app');if(app)observer?.observe(app);schedule();
 return ()=>{if(frame)win.cancelAnimationFrame(frame);observer?.disconnect();vv?.removeEventListener('resize',schedule);win.removeEventListener('orientationchange',schedule);doc.removeEventListener('fullscreenchange',schedule);doc.removeEventListener('webkitfullscreenchange',schedule);if(created)meta.remove();else if(original===null)meta.removeAttribute('content');else meta.setAttribute('content',original);};
}
