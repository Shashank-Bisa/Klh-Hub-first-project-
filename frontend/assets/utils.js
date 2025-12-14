(function(){
  const API_URL = '/api';
  window.__API_URL = API_URL;

  window.showMessage = function(text, type='ok'){
    let el = document.getElementById('__global_msg');
    if(!el){ el = document.createElement('div'); el.id='__global_msg'; el.style.position='fixed'; el.style.right='16px'; el.style.top='16px'; el.style.zIndex=9999; document.body.prepend(el); }
    el.className = 'msg ' + (type==='ok' ? 'ok' : 'err');
    el.textContent = text;
    el.style.display = 'block';
    setTimeout(()=> el.style.display = 'none', 4500);
  };

  window.createSpinner = function(){ const s = document.createElement('div'); s.className='spinner'; return s };

  window.fetchJson = async function(url, opts={}){
    const res = await fetch(url, opts);
    const body = await res.json().catch(()=>null);
    if(!res.ok) throw body || new Error('Network error');
    return body;
  };
  
  // Modal helpers
  window.openModal = function({ title = '', body = '', actions = [] } = {}){
    window.closeModal();
    const backdrop = document.createElement('div'); backdrop.className='modal-backdrop'; backdrop.id='__modal_backdrop';
    const modal = document.createElement('div'); modal.className='modal';
    const titleEl = document.createElement('div'); titleEl.className='modal-title'; titleEl.textContent = title;
    const bodyEl = document.createElement('div'); bodyEl.className='modal-body'; if (typeof body === 'string') bodyEl.innerHTML = body; else bodyEl.appendChild(body);
    const actionsEl = document.createElement('div'); actionsEl.className='modal-actions';
    actions.forEach(a => { const btn = document.createElement('button'); btn.className='btn'; btn.textContent = a.label; btn.onclick = () => { if (a.onClick) a.onClick(); if (a.close !== false) window.closeModal(); }; actionsEl.appendChild(btn); });
    modal.appendChild(titleEl); modal.appendChild(bodyEl); modal.appendChild(actionsEl); backdrop.appendChild(modal); document.body.appendChild(backdrop);
    // close when clicking outside modal
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) window.closeModal(); });
  };

  window.closeModal = function(){ const b = document.getElementById('__modal_backdrop'); if (b) b.remove(); };
})();
