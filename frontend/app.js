(function(){
  const apiBase = 'http://localhost:8000';

  const fileInput = document.getElementById('file');
  const uploadBtn = document.getElementById('uploadBtn');
  const demoBtn = document.getElementById('demoBtn');
  const askForm = document.getElementById('askForm');
  const askBtn = document.getElementById('askBtn');
  const outputEl = document.getElementById('output');
  const statusEl = document.getElementById('status');
  const copyBtn = document.getElementById('copyBtn');
  const clearBtn = document.getElementById('clearBtn');
  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');

  // small helpers
  function setStatus(txt){ statusEl.textContent = txt || '' }
  function setOutput(txt){ outputEl.textContent = txt }

  navToggle && navToggle.addEventListener('click', ()=>{
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.style.display = expanded ? 'none' : 'block';
  });

  uploadBtn && uploadBtn.addEventListener('click', async ()=>{
    const file = fileInput.files && fileInput.files[0];
    if(!file){ setStatus('Please choose a file to upload.'); return }
    uploadBtn.disabled = true; setStatus('Uploading...');
    try{
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch(`${apiBase}/upload`, { method:'POST', body:fd });
      if(!res.ok) throw new Error('Upload failed');
      setStatus('Upload complete');
    }catch(err){ setStatus('Upload error'); console.error(err) }
    finally{ uploadBtn.disabled = false; setTimeout(()=>setStatus(''),2500) }
  });

  demoBtn && demoBtn.addEventListener('click', ()=>{
    document.getElementById('question').value = 'What are three high-impact growth opportunities for a B2B SaaS startup with limited marketing budget?';
    document.getElementById('question').focus();
  });

  askForm && askForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const question = document.getElementById('question').value.trim();
    if(!question){ setStatus('Please enter a question.'); return }
    askBtn.disabled = true; setStatus('Finding context...'); setOutput('');

    try{
      const ctxRes = await fetch(`${apiBase}/context?query=${encodeURIComponent(question)}`);
      if(!ctxRes.ok) throw new Error('Context fetch failed');
      const ctxData = await ctxRes.json();

      const prompt = `You are an AI business co-founder.\n\nBUSINESS DATA:\n${ctxData.context || 'No indexed context available.'}\n\nQUESTION:\n${question}\n\nExplain reasoning. State assumptions. Give 3 actions.`;

      setStatus('Asking the AI...');

      if(window.puter && puter.ai && typeof puter.ai.chat === 'function'){
        const resp = await puter.ai.chat(prompt, { model:'gpt-5-nano' });
        setOutput(String(resp || 'No response'));
      }else{
        // fallback: hit local endpoint if available
        const fallback = await fetch(`${apiBase}/ask`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ prompt })
        });
        const data = await fallback.json();
        setOutput(data.answer || JSON.stringify(data));
      }

      setStatus('Done');
    }catch(err){
      console.error(err);
      setStatus('Error getting answer');
      setOutput(err.message || String(err));
    }finally{ askBtn.disabled = false }
  });

  copyBtn && copyBtn.addEventListener('click', async ()=>{
    try{ await navigator.clipboard.writeText(outputEl.textContent || ''); setStatus('Copied') }catch(e){ setStatus('Copy failed') }
    setTimeout(()=>setStatus(''),1500)
  });

  clearBtn && clearBtn.addEventListener('click', ()=>{ setOutput(''); setStatus('') });

  // small UX bits
  document.getElementById('year').textContent = new Date().getFullYear();
  // initial output text
  if(outputEl.textContent.trim() === '') setOutput('Your AI answers will appear here.');
})();
