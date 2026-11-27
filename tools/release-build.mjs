import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const releaseName='release-monkey-mind-iii';
const marker='release-info.json';
const notices=['credits.html','licenses/AETHER-CLASH-CODE.txt','licenses/AETHER-CLASH-ASSETS.md','licenses/RAJDHANI-OFL.txt'];
export const vercelConfig={framework:null,buildCommand:'',installCommand:'',outputDirectory:'.',headers:[{source:'/assets/:path*',headers:[{key:'Cache-Control',value:'public, max-age=0, must-revalidate'}]}]};
export async function loadManifest(root){
 const config=JSON.parse(await fs.readFile(path.join(root,'src/config/characterAtlasData.json'),'utf8'));
 const voices=JSON.parse(await fs.readFile(path.join(root,'src/audio/voiceLines.json'),'utf8'));
 let src=await fs.readFile(path.join(root,'src/config/assetManifest.js'),'utf8');
 src=src.replace(/import voiceLines from ['"][^'"]+['"];?/,`const voiceLines=${JSON.stringify(voices)};`).replace(/import characterData from ['"][^'"]+['"];?/,`const characterData=${JSON.stringify(config)};`).replaceAll('import.meta.env.BASE_URL',JSON.stringify('/'));
 return (await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'))).assetManifest;
}
export function approvedFiles(m){
 const assets=[...m.images.map(x=>x.url),...m.atlases.flatMap(x=>[x.textureURL,x.atlasURL]),...m.audio.map(x=>x.url),'fonts/Rajdhani-Bold.ttf'];
 return [...new Set([...assets.map(x=>{if(typeof x!=='string'||!x||x.split('/').some(p=>!p||p==='.'||p==='..')||/[\\:]/.test(x))throw Error('Unsafe asset path: '+x);return 'assets/'+x;}),...notices])].sort();
}
export async function stageAssets(root,dest,files){
 for(const relative of files){const from=path.join(root,'public',relative),to=path.join(dest,relative);let info;try{info=await fs.lstat(from);}catch{throw Error('Required release file missing: public/'+relative);}if(!info.isFile()||!info.size)throw Error('Invalid release file: '+relative);await fs.mkdir(path.dirname(to),{recursive:true});await fs.copyFile(from,to);}
}
export async function verifyOutput(dir,files){
 let bytes=0;for(const name of ['index.html',...files]){const s=await fs.stat(path.join(dir,name));if(!s.isFile()||!s.size)throw Error('Invalid build output: '+name);bytes+=s.size;}
 return bytes;
}
async function exists(p){try{await fs.access(p);return true;}catch{return false;}}
async function main(){
 const root=projectRoot,out=process.argv[2]?path.resolve(process.argv[2]):path.join(root,releaseName);
 const parent=path.dirname(out);
 if(out===root||root.startsWith(out+path.sep))throw Error('Release destination cannot contain the project.');
 await fs.mkdir(parent,{recursive:true});
 if(await exists(out)&&!(await exists(path.join(out,marker))))throw Error('Refusing to replace an unrelated folder: '+out);
 const qa=spawnSync(process.execPath,[path.join(root,'tools/qa-check.cjs')],{cwd:root,stdio:'inherit'});
 if(qa.status!==0)throw Error('QA failed. No new release was created.');
 const files=approvedFiles(await loadManifest(root));
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'monkey-mind-release-'));
 // Stage beside the chosen output, outside OneDrive when requested.
 const staging=await fs.mkdtemp(path.join(parent,'.mm-release-'));
 let oldMoved=false;const old=path.join(staging,'previous'),fresh=path.join(staging,'new');
 try{
  const publicDir=path.join(temp,'public');await stageAssets(root,publicDir,files);
  const {build}=await import('vite');
  await build({root,base:'/',publicDir,build:{outDir:fresh,emptyOutDir:true,sourcemap:false},plugins:[{name:'monkey-mind-release-html',transformIndexHtml:{order:'pre',handler(html){return html.replace(/<link\b[^>]*href=["']\/?vite\.svg["'][^>]*>/gi,'').replace(/<title>[\s\S]*?<\/title>/i,'<title>MONKEY MIND III — THE RESCUE</title>');}}}]});
  const bytes=await verifyOutput(fresh,files);
  await fs.writeFile(path.join(fresh,'vercel.json'),JSON.stringify(vercelConfig,null,2)+'\n');
  await fs.writeFile(path.join(fresh,marker),JSON.stringify({game:'MONKEY MIND III — THE RESCUE',version:'0.8.6-rc.1',assets:files.length,generatedAt:new Date().toISOString()},null,2)+'\n');
  if(await exists(out)){if(await exists(path.join(out,'.vercel')))await fs.cp(path.join(out,'.vercel'),path.join(fresh,'.vercel'),{recursive:true});await fs.rename(out,old);oldMoved=true;}
  try{await fs.rename(fresh,out);}catch(e){if(oldMoved){await fs.rename(old,out);oldMoved=false;}throw e;}
  console.log(`[RELEASE READY] ${out} | ${files.length} approved public files | ${(bytes/1048576).toFixed(1)} MiB checked (excludes JS/CSS bundles).`);
  console.log('Preview and playtest before deploying. No deployment has been performed.');
 }finally{await fs.rm(temp,{recursive:true,force:true});if(oldMoved&&!(await exists(out))){console.error('Previous release retained at '+old);}else{await fs.rm(staging,{recursive:true,force:true});}}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(e=>{console.error('[RELEASE FAILED]',e.message);process.exitCode=1;});
