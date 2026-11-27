const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const assetRoot = path.join(root, 'public/assets');
let failures = 0, warnings = 0;
function check(ok, msg, optional=false) { if(!ok){console.log(`${optional?'[WARN]':'[FAIL]'} ${msg}`); if(optional)warnings++;else failures++;} return ok; }
function exists(p) {return fs.existsSync(p)&&fs.statSync(p).isFile()&&fs.statSync(p).size>0;}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
async function main(){
 const sharp = require('sharp');
 const config = JSON.parse(fs.readFileSync(path.join(root,'src/config/characterAtlasData.json'),'utf8'));
 const voices = JSON.parse(fs.readFileSync(path.join(root,'src/audio/voiceLines.json'),'utf8'));
 let code = fs.readFileSync(path.join(root,'src/config/assetManifest.js'),'utf8');
 code=code.replace(/import voiceLines from ['"][^'"]+['"];?/,`const voiceLines=${JSON.stringify(voices)};`).replace(/import characterData from ['"][^'"]+['"];?/,`const characterData=${JSON.stringify(config)};`).replaceAll('import.meta.env.BASE_URL',JSON.stringify('/'));
 const {assetManifest:m,CHARACTERS:cast}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const keys=new Set();
 for(const item of [...m.images,...m.atlases,...m.audio]){check(!keys.has(item.key),'Duplicate asset key: '+item.key);keys.add(item.key);}
 for(const item of m.images){const p=path.join(assetRoot,item.url);if(check(exists(p),'Missing image: '+item.url)){try{const d=await sharp(p).metadata();check(d.width>0&&d.height>0,'Invalid image: '+item.url);if(Math.max(d.width,d.height)>4096)check(false,'Image exceeds 4096px: '+item.url,true);}catch(e){check(false,'Unreadable image: '+item.url+' '+e.message);}}}
 for(const item of m.audio){check(exists(path.join(assetRoot,item.url)),'Missing audio: '+item.url,!!item.optional);}
 for(const item of m.atlases){const image=path.join(assetRoot,item.textureURL), json=path.join(assetRoot,item.atlasURL);if(!check(exists(image)&&exists(json),'Missing atlas: '+item.key))continue;try{const d=await sharp(image).metadata(), a=JSON.parse(fs.readFileSync(json,'utf8')), c=Object.values(cast).find(v=>v.texture===item.key);let valid=true;valid=check(d.hasAlpha&&Math.max(d.width,d.height)<=4096,'Invalid atlas size or alpha: '+item.key)&&valid;valid=check(a.meta.size.w===d.width&&a.meta.size.h===d.height,'Atlas metadata size mismatch: '+item.key)&&valid;let count=0;for(const state of Object.values(c.animations))for(const name of state.frames){count++;const r=a.frames[name]?.frame;valid=check(r&&r.x>=0&&r.y>=0&&r.w===c.cellWidth&&r.h===c.cellHeight&&r.x+r.w<=d.width&&r.y+r.h<=d.height,'Invalid frame: '+item.key+'/'+name)&&valid;}if(valid)console.log(`[OK] ${item.key}: ${d.width} x ${d.height}, ${count} frames`);}catch(e){check(false,'Atlas error: '+item.key+' '+e.message);}}
 const font='fonts/Rajdhani-Bold.ttf';check(exists(path.join(assetRoot,font)),'Missing font: '+font,true);
 const sources=walk(path.join(root,'src')).filter(p=>p.endsWith('.js'));for(const p of sources){const r=spawnSync(process.execPath,['--check',p],{cwd:root,encoding:'utf8'});if(!check(r.status===0,'Syntax error: '+path.relative(root,p)))console.log(r.stderr);}
 console.log(`[INFO] Checked syntax of ${sources.length} files and ${keys.size} manifest entries.`);
 for(const id of ['7c','7d','7e','7f','7g','7h','8a','8b','8c','8d','8e','8f']){const p=path.join(root,'tests',`phase${id}.mjs`);if(!check(exists(p),'Missing regression test: phase'+id))continue;const r=spawnSync(process.execPath,[p],{cwd:root,encoding:'utf8'});console.log(r.stdout.trim());if(!check(r.status===0,'Test failed: phase'+id))console.log(r.stderr);}
 console.log(`\nQA CHECK: ${failures} failures, ${warnings} warnings`);console.log('Browser playtesting and actual GPU/FPS measurements are still required.');if(failures)process.exitCode=1;
}
main().catch(e=>{console.error('QA could not complete:',e);process.exitCode=1;});
