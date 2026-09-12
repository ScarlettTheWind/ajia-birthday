import {mkdir,cp,writeFile,readFile,readdir} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=dirname(fileURLToPath(import.meta.url));
const backupRoot=join(root,'版本备份');
const sources=['dist','tests','package.json','server.mjs','build-inline.mjs','backup-version.mjs','README.md','AGENTS.md','.gitignore','.github'];
async function inventory(path,relative,files){
  const entries=await readdir(path,{withFileTypes:true});
  for(const entry of entries){
    const rel=relative+'/'+entry.name;
    if(entry.isDirectory())await inventory(join(path,entry.name),rel,files);
    else if(entry.isFile())files.push(rel);
  }
}
export async function backupVersion(label='版本更新'){
  await mkdir(backupRoot,{recursive:true});
  const entries=await readdir(backupRoot);
  let sequence=Math.max(0,...entries.map(n=>Number(n.match(/^v(\d+)_/)?.[1]||0)))+1;
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  let folder;
  while(true){folder=join(backupRoot,`v${String(sequence).padStart(3,'0')}_${stamp}`);try{await mkdir(folder);break;}catch(e){if(e.code!=='EEXIST')throw e;sequence++;}}
  // A backup is complete only when 备份信息.json has been written last.
  for(const source of sources)await cp(join(root,source),join(folder,source),{recursive:true,errorOnExist:true,force:false});
  const files=[];await inventory(folder,'',files);
  const checksums={};
  for(const file of files.sort())checksums[file.slice(1)]=createHash('sha256').update(await readFile(join(folder,file.slice(1)))).digest('hex');
  await writeFile(join(folder,'备份信息.json'),JSON.stringify({version:sequence,label,createdAt:new Date().toISOString(),complete:true,files:checksums},null,2));
  console.log(`版本已备份：${folder}`);
  return folder;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await backupVersion(process.argv[2]||'手动备份');
