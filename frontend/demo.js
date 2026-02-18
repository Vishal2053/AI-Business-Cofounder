// demo.js — handles multi-file upload, chat UI, and delete operations
(function(){
  const apiBase = 'http://localhost:8000';
  const fileInput = document.getElementById('fileInput');
  const fileList = document.getElementById('fileList');
  const uploadAll = document.getElementById('uploadAll');
  const deleteEmbeddings = document.getElementById('deleteEmbeddings');
  const deleteData = document.getElementById('deleteData');
  const chatForm = document.getElementById('chatForm');
  const chatLog = document.getElementById('chatLog');
  const chatStatus = document.getElementById('chatStatus');
  const clearChat = document.getElementById('clearChat');

  let selectedFiles = [];

  function renderFiles(){
    fileList.innerHTML = '';
    if(selectedFiles.length===0){ fileList.textContent = 'No files selected' ; return }
    selectedFiles.forEach((f,idx)=>{
      const el = document.createElement('div'); el.style.display='flex'; el.style.alignItems='center'; el.style.justifyContent='space-between'; el.style.gap='12px';
      el.innerHTML = `<div style='flex:1'><strong>${f.name}</strong> <span class='muted'>(${Math.round(f.size/1024)}KB)</span></div>`;
      const rm = document.createElement('button'); rm.className='btn small ghost'; rm.textContent='Remove'; rm.addEventListener('click', ()=>{ selectedFiles.splice(idx,1); renderFiles(); });
      el.appendChild(rm); fileList.appendChild(el);
    })
  }

  fileInput && fileInput.addEventListener('change',(e)=>{
    selectedFiles = Array.from(e.target.files || []);
    renderFiles();
  })

  uploadAll && uploadAll.addEventListener('click', async ()=>{
    if(selectedFiles.length===0){ alert('No files selected'); return }
    uploadAll.disabled = true; uploadAll.textContent='Uploading...';
    try{
      // try bulk endpoint first
      const fd = new FormData(); selectedFiles.forEach(f=>fd.append('files', f));
      let res = await fetch(`${apiBase}/upload-multiple`, { method:'POST', body:fd });
      if(!res.ok){
        // fallback: upload one-by-one to /upload
        for(const f of selectedFiles){ const ffd = new FormData(); ffd.append('file', f); await fetch(`${apiBase}/upload`, { method:'POST', body:ffd }) }
      }
      alert('Upload complete'); selectedFiles = []; fileInput.value = ''; renderFiles();
    }catch(err){ console.error(err); alert('Upload error') }
    finally{ uploadAll.disabled = false; uploadAll.textContent='Upload Selected' }
  })

  deleteEmbeddings && deleteEmbeddings.addEventListener('click', async ()=>{
    if(!confirm('Delete all embeddings? This cannot be undone.')) return;
    deleteEmbeddings.disabled = true; deleteEmbeddings.textContent='Deleting...';
    try{ const res = await fetch(`${apiBase}/delete-embeddings`, { method:'POST' }); if(!res.ok) throw new Error('Delete failed'); alert('Embeddings deleted') }catch(e){console.error(e); alert('Delete failed')}finally{ deleteEmbeddings.disabled=false; deleteEmbeddings.textContent='Delete All Embeddings' }
  })

  deleteData && deleteData.addEventListener('click', async ()=>{
    if(!confirm('Delete all indexed data? This cannot be undone.')) return;
    deleteData.disabled = true; deleteData.textContent='Deleting...';
    try{ const res = await fetch(`${apiBase}/delete-data`, { method:'POST' }); if(!res.ok) throw new Error('Delete failed'); alert('Data deleted') }catch(e){console.error(e); alert('Delete failed')}finally{ deleteData.disabled=false; deleteData.textContent='Delete All Data' }
  })

  chatForm && chatForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const q = document.getElementById('chatQuestion').value.trim(); if(!q) return;
    appendChat('user', q); chatStatus.textContent='Finding context...';
    try{
      const ctxRes = await fetch(`${apiBase}/context?query=${encodeURIComponent(q)}`);
      const ctx = ctxRes.ok ? await ctxRes.json() : { context: '' };
      const prompt = `You are an AI business co-founder.\n\nBUSINESS DATA:\n${ctx.context||''}\n\nQUESTION:\n${q}\n\nExplain reasoning. State assumptions. Give 3 actions.`;
      chatStatus.textContent='Asking AI...';
      if(window.puter && puter.ai && typeof puter.ai.chat === 'function'){
        const resp = await puter.ai.chat(prompt, { model:'gpt-5-nano' }); appendChat('assistant', String(resp || ''))
      }else{
        const res = await fetch(`${apiBase}/ask`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt }) });
        const data = await res.json(); appendChat('assistant', data.answer || JSON.stringify(data));
      }
      chatStatus.textContent='';
    }catch(err){ console.error(err); chatStatus.textContent='Error getting answer'; appendChat('assistant', 'Error: '+(err.message||err)) }
  })

  function appendChat(who, text){
    const el = document.createElement('div'); el.className = who==='user'? 'card' : 'card';
    el.style.marginBottom = '8px'; el.innerHTML = `<strong>${who==='user'?'You':'AI'}:</strong><div style='margin-top:6px;white-space:pre-wrap'>${text}</div>`;
    chatLog.insertBefore(el, chatLog.firstChild);
  }

  clearChat && clearChat.addEventListener('click', ()=>{ chatLog.innerHTML=''; })

  // initialize
  document.addEventListener('DOMContentLoaded', ()=>{ if(window.gbcAuth && typeof gbcAuth.renderUserArea==='function') gbcAuth.renderUserArea(); if(document.getElementById('year')) document.getElementById('year').textContent = new Date().getFullYear() })

})();
