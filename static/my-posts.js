import { API_BASE } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("anon_username");
    if(!username){ window.location.href="index.html"; return; }
    document.getElementById("headerUsername").textContent = username;
    setupDropdown();
    loadMyPosts(username);
});

function setupDropdown() {
    const wrap = document.getElementById("headerWrap");
    const menu = document.getElementById("usernameDropdown");
    wrap.addEventListener("click", ()=>menu.classList.toggle("show"));

    document.getElementById("homeBtn").addEventListener("click", ()=>window.location.href="select.html");
    document.getElementById("logoutBtn").addEventListener("click", ()=>{
        localStorage.clear();
        window.location.href="index.html";
    });
}

async function loadMyPosts(username){
    const container = document.getElementById("postsContainer");
    try{
        const res = await fetch(`${API_BASE}/api/posts`);
        const posts = (await res.json()).filter(p=>p.username===username)
                                        .sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
        container.innerHTML="";

        if(posts.length===0){
            container.innerHTML=`
                <div class="no-posts-box">
                    <p>No posts yet.</p>
                    <p>Do you want to go and create a post?</p>
                    <button class="big-btn purple" id="goCreate">Create Post</button>
                </div>
            `;
            document.getElementById("goCreate").addEventListener("click", ()=>window.location.href="select.html");
            return;
        }

        posts.forEach(p=>{
            const card=document.createElement("div");
            card.className="post-card";
            const img=p.imageUrl || "https://via.placeholder.com/180x140";
            card.innerHTML=`
                <img src="${img}">
                <div class="post-text">
                    <div class="post-meta">@${p.username} • ${new Date(p.createdAt).toLocaleString()}</div>
                    <div>${p.content}</div>
                </div>
                <div class="post-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
            container.appendChild(card);

            const editBtn = card.querySelector(".edit-btn");
            const deleteBtn = card.querySelector(".delete-btn");

            // Edit popup
            editBtn.addEventListener("click", ()=>{
                const editBg = document.getElementById("editModalBg");
                const editText = document.getElementById("editText");
                const editImage = document.getElementById("editImageUrl");
                editBg.classList.remove("hidden");
                editText.value = p.content;
                editImage.value = p.imageUrl || "";

                document.getElementById("saveEdit").onclick = async ()=>{
                    const newContent = editText.value;
                    const newImage = editImage.value;
                    try{
                        await fetch(`${API_BASE}/api/posts`,{
                            method:"PATCH",
                            headers:{"Content-Type":"application/json"},
                            body: JSON.stringify({...p, content:newContent, imageUrl:newImage})
                        });
                        editBg.classList.add("hidden");
                        loadMyPosts(username);
                    }catch(e){ console.error(e); }
                };

                document.getElementById("cancelEdit").onclick = ()=>{
                    editBg.classList.add("hidden");
                };
            });

            // Delete popup
            deleteBtn.addEventListener("click", ()=>{
                const delBg = document.getElementById("deleteModalBg");
                delBg.classList.remove("hidden");
                document.getElementById("confirmDelete").onclick = async ()=>{
                    try{
                        await fetch(`${API_BASE}/api/posts`,{
                            method:"DELETE",
                            headers:{"Content-Type":"application/json"},
                            body: JSON.stringify({id:p.id})
                        });
                        delBg.classList.add("hidden");
                        loadMyPosts(username);
                    }catch(e){ console.error(e); }
                };
                document.getElementById("cancelDelete").onclick = ()=>{
                    delBg.classList.add("hidden");
                };
            });
        });
    }catch(e){ container.innerHTML="<p>Error loading posts.</p>"; console.error(e); }
}
