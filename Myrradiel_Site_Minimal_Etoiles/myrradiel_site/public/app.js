const pseudo=document.getElementById('pseudo');
const btn=document.getElementById('discordBtn');
const status=document.getElementById('status');
const avatar=document.getElementById('avatar');
const notice=document.getElementById('notice');
document.getElementById('menuToggle').addEventListener('click',()=>document.getElementById('nav').classList.toggle('open'));
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>document.getElementById('nav').classList.remove('open')));
const params=new URLSearchParams(location.search);
if(params.has('error')){notice.textContent=params.get('error')==='configuration'?'Configure les identifiants Discord dans le fichier .env.':'Connexion Discord impossible. Réessaie.';history.replaceState({},'',location.pathname);}
fetch('/api/me').then(r=>r.json()).then(({user,configured})=>{
 if(user){pseudo.textContent=user.username;status.textContent='● Discord connecté';status.classList.add('connected');btn.textContent='Se déconnecter';btn.href='/auth/logout';if(user.avatar){avatar.src=user.avatar;avatar.hidden=false;}}
 else if(!configured){notice.textContent='Mode aperçu : ajoute les identifiants Discord pour activer la connexion réelle.';}
}).catch(()=>{notice.textContent='Impossible de vérifier la session.'});
