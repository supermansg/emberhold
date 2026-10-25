// Read-only static serving of authored dist. Avoid Vite live reload during QA.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../dist');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.glb':'model/gltf-binary','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png'};
http.createServer((req,res)=>{
 try{const url=new URL(req.url,'http://localhost');const pathname=decodeURIComponent(url.pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});}catch{res.writeHead(400).end();}
}).listen(Number(process.env.QA_PORT||4174),'127.0.0.1',()=>console.log('QA static game: http://127.0.0.1:'+(process.env.QA_PORT||4174)));
