import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {approvedFiles,stageAssets,verifyOutput,vercelConfig} from '../tools/release-build.mjs';
const root=await fs.mkdtemp(path.join(os.tmpdir(),'mm-release-test-'));
try{
 const m={images:[{url:'bg/forest.webp'}],atlases:[{textureURL:'hero/atlas.webp',atlasURL:'hero/atlas.json'}],audio:[{url:'audio/voice.ogg'}]};
 const files=approvedFiles(m);assert.equal(files.length,9);assert.throws(()=>approvedFiles({...m,images:[{url:'../private.png'}]}),/Unsafe/);
 for(const f of [...files,'assets/private/reference.png']){const p=path.join(root,'public',f);await fs.mkdir(path.dirname(p),{recursive:true});await fs.writeFile(p,'fixture');}
 const out=path.join(root,'out');await stageAssets(root,out,files);await assert.rejects(fs.access(path.join(out,'assets/private/reference.png')));await assert.rejects(verifyOutput(out,files));await fs.writeFile(path.join(out,'index.html'),'index');assert(await verifyOutput(out,files)>0);await fs.rm(path.join(root,'public','assets/audio/voice.ogg'));await assert.rejects(stageAssets(root,out,files),/Required release file missing/);assert.equal(vercelConfig.outputDirectory,'.');assert.equal(vercelConfig.framework,null);
 console.log('PASS: approved asset list, traversal rejection, exclusion of private assets, missing file failure, build output validation and static deployment configuration.');
}finally{await fs.rm(root,{recursive:true,force:true});}
