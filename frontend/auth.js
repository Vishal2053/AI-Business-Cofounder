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
      const pass = document.getElementById('signupPass').value.trim();
      const avatarUrl = document.getElementById('signupAvatar').value.trim();
      const msg = document.getElementById('signupError');
      const users = readUsers();
      if(users.some(u=>u.email===email)){ msg.textContent='Email already registered'; msg.style.display='block'; return }
      const user = {id: 'u_'+Date.now(), name, email, pass, pic: avatarUrl || ''};
      users.push(user); writeUsers(users); localStorage.setItem('gbc_current', JSON.stringify(user));
      msg.textContent='Account created — redirecting to Demo...'; msg.style.display='none';
      setTimeout(()=> location.href='demo.html',700)
    })
  }

  // login form
  const loginForm = document.getElementById('loginForm')
  if(loginForm){
    loginForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const pass = document.getElementById('loginPass').value.trim();
      const msg = document.getElementById('loginError');
      const users = readUsers();
      const user = users.find(u=>u.email===email && u.pass===pass);
      if(!user){ 
        msg.textContent = users.length === 0 ? 'No accounts found. Please sign up first.' : 'Invalid credentials'; 
        msg.style.display='block'; 
        return 
      }
      localStorage.setItem('gbc_current', JSON.stringify(user));
      msg.textContent='Login successful — redirecting...';
      msg.style.display='block';
      setTimeout(()=> location.href='demo.html',500)
    })
  }

  // global nav/profile UI
  function renderUserArea(){
    const container = document.getElementById('userArea');
    if(!container) return;
    const cur = JSON.parse(localStorage.getItem('gbc_current')||'null');
    container.innerHTML = '';
    
    // Show/hide demo nav item based on login status
    const demoNavItem = document.getElementById('demoNavItem');
    if(demoNavItem){
      demoNavItem.style.display = cur ? 'block' : 'none';
    }
    
    // Show/hide demo button in hero based on login status
    const demoBtn = document.getElementById('demoBtn');
    if(demoBtn){
      demoBtn.style.display = cur ? 'block' : 'none';
    }
    
    if(cur){
      let profileEl;
      if(cur.pic && (cur.pic.startsWith('http') || cur.pic.includes('/'))){ 
        // Show image if it's a valid URL
        profileEl = document.createElement('img'); 
        profileEl.src = cur.pic;
        profileEl.alt = cur.name || 'User'; 
        profileEl.style.width='36px'; 
        profileEl.style.height='36px'; 
        profileEl.style.borderRadius='50%'; 
        profileEl.style.cursor='pointer';
      } else { 
        // Show initials if no valid pic
        const nameParts = (cur.name || 'U').trim().split(' ');
        const initials = (nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '')).toUpperCase();
        profileEl = document.createElement('div'); 
        profileEl.textContent = initials;
        profileEl.style.width='36px'; 
        profileEl.style.height='36px'; 
        profileEl.style.borderRadius='50%'; 
        profileEl.style.cursor='pointer';
        profileEl.style.display='flex';
        profileEl.style.alignItems='center';
        profileEl.style.justifyContent='center';
        profileEl.style.background='var(--accent)';
        profileEl.style.color='var(--background)';
        profileEl.style.fontWeight='600';
        profileEl.style.fontSize='14px';
      }
      profileEl.id='profilePic'
      const span = document.createElement('span'); span.textContent = ' ' + (cur.name || ''); span.style.marginLeft='8px'; span.style.color='var(--muted)';
      container.appendChild(profileEl); container.appendChild(span);

      profileEl.addEventListener('click', ()=>{
        const menu = document.getElementById('profileMenu') || document.createElement('div');
        menu.id='profileMenu'; menu.style.position='absolute'; menu.style.right='20px'; menu.style.top='60px'; menu.style.background='var(--surface)'; menu.style.padding='10px'; menu.style.borderRadius='8px'; menu.style.boxShadow='0 6px 24px rgba(0,0,0,0.5)';
        menu.innerHTML = `<div style="min-width:140px"><div style='padding:6px 8px;cursor:pointer;font-weight:600;'>Signed in as<br><strong>${cur.name}</strong></div><div style='border-top:1px solid rgba(255,255,255,0.03);padding:6px 8px'><button id='logoutBtn' class='btn small ghost' style='width:100%;'>Logout</button></div></div>`;
        document.body.appendChild(menu);
        const lb = document.getElementById('logoutBtn'); lb && lb.addEventListener('click', ()=>{ localStorage.removeItem('gbc_current'); menu.remove(); renderUserArea(); location.href='index.html'; })
      })
      span.style.cursor='pointer';
      span.addEventListener('click', ()=>{
        const menu = document.getElementById('profileMenu') || document.createElement('div');
        menu.id='profileMenu'; menu.style.position='absolute'; menu.style.right='20px'; menu.style.top='60px'; menu.style.background='var(--surface)'; menu.style.padding='10px'; menu.style.borderRadius='8px'; menu.style.boxShadow='0 6px 24px rgba(0,0,0,0.5)';
        menu.innerHTML = `<div style="min-width:140px"><div style='padding:6px 8px;cursor:pointer;font-weight:600;'>Signed in as<br><strong>${cur.name}</strong></div><div style='border-top:1px solid rgba(255,255,255,0.03);padding:6px 8px'><button id='logoutBtn' class='btn small ghost' style='width:100%;'>Logout</button></div></div>`;
        document.body.appendChild(menu);
        const lb = document.getElementById('logoutBtn'); lb && lb.addEventListener('click', ()=>{ localStorage.removeItem('gbc_current'); menu.remove(); renderUserArea(); location.href='index.html'; })
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

  // smart demo redirect - checks login status
  function gotoDemo(){
    const cur = JSON.parse(localStorage.getItem('gbc_current')||'null');
    if(cur){
      // user is logged in, go directly to demo
      location.href = 'demo.html';
    }else{
      // user not logged in, go to login first (will redirect to demo after login)
      location.href = 'login.html';
    }
  }

  // expose for pages
  window.gbcAuth = { readUsers, writeUsers, renderUserArea, gotoDemo }
  document.addEventListener('DOMContentLoaded', ()=>{ renderUserArea(); document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear()) })

})();
