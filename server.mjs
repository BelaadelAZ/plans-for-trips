/** Serveur local sans dépendances. Démarrage : npm run dev */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from './api/generate.js';
const root=path.dirname(fileURLToPath(import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=createServer(async (req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/generate'||url.pathname==='/api/generate.js'){
    if(req.method==='POST'){
      let raw='';
      for await(const chunk of req){raw+=chunk; if(Buffer.byteLength(raw)>350000){res.writeHead(413,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'La requête est trop volumineuse.'}));return;}}
      req.body=raw;
    }
    return handler(req,res);
  }
  try{
    const p=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
    const full=path.resolve(root,'.'+p);
    if(full!==root&&!full.startsWith(root+path.sep)){res.writeHead(403);res.end('Accès refusé');return;}
    if(path.basename(full).startsWith('.')||p.startsWith('/api/')||p==='/.env'||p==='/server.mjs'){res.writeHead(404);res.end('Non trouvé');return;}
    const meta=await stat(full);
    if(!meta.isFile()){res.writeHead(404);res.end('Non trouvé');return;}
    const contents=await readFile(full);
    res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
    res.end(contents);
  }catch{res.writeHead(404);res.end('Non trouvé');}
});
const port=Number(process.env.PORT||8080);
server.listen(port,()=>console.log(`Atelier Fiches disponible sur http://localhost:${port}`));
