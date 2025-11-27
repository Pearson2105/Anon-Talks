const API = (location.hostname === '127.0.0.1' || location.hostname === 'localhost')
  ? 'http://localhost:8080/api'
  : 'http://127.0.0.1:8080/api';

async function fetchPosts(){
  try {
    const res = await fetch(`${API}/posts`);
    if(!res.ok) return;
    const posts = await res.json();
    renderPosts(posts);
  } catch(e){ console.error(e); }
}

function renderPosts(posts){
  const container = document.getElementById('posts');
  container.innerHTML = '';
  posts.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)).forEach(p=>{
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `
      <div class="meta">${escapeHtml(p.username)} · ${new Date(p.createdAt).toLocaleString()}</div>
      <div class="content">${nl2br(escapeHtml(p.content || ''))}</div>
      ${p.imageUrl ? `<img src="${escapeAttr(p.imageUrl)}" alt="image" />` : ''}
    `;
    container.appendChild(div);
  });
}

function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }
function escapeAttr(s){ return escapeHtml(s).replace(/"/g,'&quot;'); }
function nl2br(s){ return s.replace(/\n/g,'<br/>'); }

document.getElementById('postBtn').addEventListener('click', async ()=>{
  const username = document.getElementById('username').value.trim();
  const content = document.getElementById('content').value.trim();
  const imageUrl = document.getElementById('imageUrl').value.trim();
  if(!content && !imageUrl) return;
  const payload = { username: username || null, content: content || null, imageUrl: imageUrl || null };
  try {
    const res = await fetch(`${API}/posts`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if(res.ok){
      document.getElementById('content').value = '';
      document.getElementById('imageUrl').value = '';
      fetchPosts();
    } else {
      console.error('post failed', await res.text());
    }
  } catch(e){ console.error(e); }
});

fetchPosts();
setInterval(fetchPosts, 15000);
