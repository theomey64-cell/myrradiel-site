const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const PORT = Number(process.env.PORT || 3000);
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const BASE_URL = (process.env.BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const production = process.env.NODE_ENV === 'production';
const cookieFlags = `Path=/; HttpOnly; SameSite=Lax${production ? '; Secure' : ''}`;
const sessions = new Map();
const states = new Map();
const ttl = 7 * 24 * 60 * 60 * 1000;
function cookies(req) { return Object.fromEntries((req.headers.cookie || '').split(';').map(s=>s.trim().split('=').map(decodeURIComponent)).filter(x=>x.length===2)); }
function sign(s) {return crypto.createHmac('sha256', SECRET).update(s).digest('hex');}
function session(req) { const c=cookies(req).myrradiel; if(!c) return null; const [id,sig]=c.split('.'); if(!id || !sig || sign(id)!==sig) return null; const entry=sessions.get(id); return entry && entry.expires>Date.now()?entry.user:null; }
function respond(res, status, data, type='application/json; charset=utf-8', headers={}) {res.writeHead(status, {'Content-Type':type, 'Cache-Control':'no-store',...headers}); res.end(Buffer.isBuffer(data) || typeof data === 'string' ? data : JSON.stringify(data));}
function redirect(res,url,extra={}){res.writeHead(302,{Location:url,...extra});res.end();}
function clearExpired(){const now=Date.now();for(const [k,v] of sessions)if(v.expires<now)sessions.delete(k);for(const [k,v] of states)if(v.expires<now)states.delete(k);}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};
http.createServer(async(req,res)=>{
  clearExpired();
  const u=new URL(req.url,BASE_URL);
  if(u.pathname==='/api/me') return respond(res,200,{user:session(req),configured:!!(CLIENT_ID&&CLIENT_SECRET)});
  if(u.pathname==='/auth/discord') {
    if(!CLIENT_ID||!CLIENT_SECRET) return redirect(res,'/?error=configuration');
    const state=crypto.randomBytes(24).toString('hex');states.set(state,{expires:Date.now()+600000});
    const q=new URLSearchParams({client_id:CLIENT_ID,redirect_uri:`${BASE_URL}/auth/callback`,response_type:'code',scope:'identify',state});
    return redirect(res,`https://discord.com/oauth2/authorize?${q}`);
  }
  if(u.pathname==='/auth/callback') {
    const state=u.searchParams.get('state');const entry=states.get(state);states.delete(state);
    if(!entry||entry.expires<Date.now()||!u.searchParams.get('code')) return redirect(res,'/?error=auth');
    try {
      const body=new URLSearchParams({client_id:CLIENT_ID,client_secret:CLIENT_SECRET,grant_type:'authorization_code',code:u.searchParams.get('code'),redirect_uri:`${BASE_URL}/auth/callback`});
      const tokenResponse=await fetch('https://discord.com/api/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
      if(!tokenResponse.ok)throw new Error('Token exchange failed');
      const token=await tokenResponse.json();
      const userResponse=await fetch('https://discord.com/api/users/@me',{headers:{Authorization:`Bearer ${token.access_token}`}});
      if(!userResponse.ok)throw new Error('Profile fetch failed');
      const d=await userResponse.json();
      const user={id:d.id,username:d.global_name||d.username,handle:d.username,avatar:d.avatar?`https://cdn.discordapp.com/avatars/${d.id}/${d.avatar}.png`:null};
      const id=crypto.randomBytes(32).toString('hex');sessions.set(id,{user,expires:Date.now()+ttl});
      return redirect(res,'/',{'Set-Cookie':`myrradiel=${id}.${sign(id)}; Max-Age=${ttl/1000}; ${cookieFlags}`});
    }catch(e){console.error(e.message);return redirect(res,'/?error=discord');}
  }
  if(u.pathname==='/auth/logout') {const c=cookies(req).myrradiel; if(c)sessions.delete(c.split('.')[0]);return redirect(res,'/',{'Set-Cookie':`myrradiel=; Max-Age=0; ${cookieFlags}`});}
  let file=u.pathname==='/'?'index.html':decodeURIComponent(u.pathname.slice(1));
  const root=path.resolve(__dirname,'public');const resolved=path.resolve(root,file);
  if(!resolved.startsWith(root+path.sep)&&resolved!==root)return respond(res,403,'Forbidden','text/plain');
  fs.readFile(resolved,(err,data)=>err?respond(res,404,'Introuvable','text/plain'):respond(res,200,data,mime[path.extname(resolved)]||'application/octet-stream'));
}).listen(PORT,()=>console.log(`Myrradiel : ${BASE_URL}`));
