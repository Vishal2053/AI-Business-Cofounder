// auth.js — simple client-side auth for demo purposes (localStorage)
(function(){
  function readUsers(){
    return JSON.parse(localStorage.getItem('gbc_users')||'[]')
  }
  function writeUsers(u){ localStorage.setItem('gbc_users', JSON.stringify(u)) }

  async function fileToDataURL(file){
    return new Promise((res,rej)=>{
      if(!file) return res(null)
      const r = new FileReader(); r.onload = ()=>res(r.result); r.onerror=rej; r.readAsDataURL(file)
    })
  }

  // signup form
  const signupForm = document.getElementById('signupForm')
  if(signupForm){
    signupForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim().toLowerCase();
      const pass = document.getElementById('signupPass').value;
      const picFile = document.getElementById('signupPic').files[0];
      const msg = document.getElementById('signupMsg');
      const users = readUsers();
      if(users.some(u=>u.email===email)){ msg.textContent='Email already registered'; return }
      const pic = await fileToDataURL(picFile);
      const user = {id: 'u_'+Date.now(), name, email, pass, pic};
      users.push(user); writeUsers(users); localStorage.setItem('gbc_current', JSON.stringify(user));
      msg.textContent='Account created — redirecting to Demo...';
      setTimeout(()=> location.href='demo.html',700)
    })
  }

  // login form
  const loginForm = document.getElementById('loginForm')
  if(loginForm){
    loginForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const pass = document.getElementById('loginPass').value;
      const msg = document.getElementById('loginMsg');
      const users = readUsers();
      const user = users.find(u=>u.email===email && u.pass===pass);
      if(!user){ msg.textContent='Invalid credentials'; return }
      localStorage.setItem('gbc_current', JSON.stringify(user));
      msg.textContent='Login successful — redirecting...';
      setTimeout(()=> location.href='demo.html',500)
    })
  }

  // global nav/profile UI
  function renderUserArea(){
    const container = document.getElementById('userArea');
    if(!container) return;
    const cur = JSON.parse(localStorage.getItem('gbc_current')||'null');
    container.innerHTML = '';
    if(cur){
      const img = document.createElement('img'); img.src = cur.pic||'https://via.placeholder.com/36?text='+encodeURIComponent((cur.name||'U')[0]);
      img.alt = cur.name || 'User'; img.style.width='36px'; img.style.height='36px'; img.style.borderRadius='50%'; img.style.cursor='pointer';
      img.id='profilePic'
      const span = document.createElement('span'); span.textContent = ' ' + (cur.name || ''); span.style.marginLeft='8px'; span.style.color='var(--muted)';
      container.appendChild(img); container.appendChild(span);

      img.addEventListener('click', ()=>{
        const menu = document.getElementById('profileMenu') || document.createElement('div');
        menu.id='profileMenu'; menu.style.position='absolute'; menu.style.right='20px'; menu.style.top='60px'; menu.style.background='var(--surface)'; menu.style.padding='10px'; menu.style.borderRadius='8px'; menu.style.boxShadow='0 6px 24px rgba(0,0,0,0.5)';
        menu.innerHTML = `<div style="min-width:140px"><div style='padding:6px 8px'>Signed in as<br><strong>${cur.name}</strong></div><div style='border-top:1px solid rgba(255,255,255,0.03);padding:6px 8px'><button id='logoutBtn' class='btn small ghost'>Logout</button></div></div>`;
        document.body.appendChild(menu);
        const lb = document.getElementById('logoutBtn'); lb && lb.addEventListener('click', ()=>{ localStorage.removeItem('gbc_current'); menu.remove(); renderUserArea(); })
      })
    }else{
      container.innerHTML = `<a class="btn small" href="login.html">Login</a> <a class="btn small ghost" href="signup.html">Sign up</a>`
    }
  }

  // close profile menu on outside click
  document.addEventListener('click',(e)=>{
    const m = document.getElementById('profileMenu');
    if(m && !m.contains(e.target) && e.target.id!=='profilePic') m.remove();
  })

  // expose for pages
  window.gbcAuth = { readUsers, writeUsers, renderUserArea }
  document.addEventListener('DOMContentLoaded', ()=>{ renderUserArea(); document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear()) })

})();
