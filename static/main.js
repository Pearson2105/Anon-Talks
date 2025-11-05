const api = '/api/posts';
const postForm = document.getElementById('postForm');
const postsDiv = document.getElementById('posts');

postForm.onsubmit = async e => {
  e.preventDefault();
  const formData = new FormData(postForm);
  await fetch(api, { method: 'POST', body: formData });
  postForm.reset();
  loadPosts();
};

async function loadPosts() {
  const res = await fetch(api);
  const posts = await res.json();
  postsDiv.innerHTML = posts.map(p => `
    <div>
      <strong>${p.username}</strong>: ${p.text}<br>
      ${p.image ? `<img src="/uploads/${p.image}" width="200">` : ''}
      <div>
        👍 ${p.likes} <button onclick="react(${p.id},'like')">Like</button>
        👎 ${p.dislikes} <button onclick="react(${p.id},'dislike')">Dislike</button>
      </div>
      <hr>
    </div>
  `).join('');
}

async function react(id, kind) {
  await fetch(`${api}/${id}/react`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind })
  });
  loadPosts();
}

loadPosts();
