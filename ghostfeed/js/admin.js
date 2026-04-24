// ==================== ADMIN MODULE ====================

window.deletePost = async function(postId) {
    if (!currentUser || (!currentUser.isAdmin && localPosts.find(p => p.id == postId)?.user_id !== currentUser.id)) {
        showToast("You don't have permission", true);
        return;
    }
    
    if (confirm("Delete this post permanently?")) {
        await deletePost(postId);
        if (pinnedPostId === postId) pinnedPostId = null;
        loadPosts();
    }
};

window.editPost = async function(postId) {
    if (!currentUser || (!currentUser.isAdmin && localPosts.find(p => p.id == postId)?.user_id !== currentUser.id)) {
        showToast("You don't have permission", true);
        return;
    }
    
    const postDiv = document.getElementById(`post-${postId}`);
    const postTextDiv = postDiv?.querySelector('.post-text');
    const currentText = postTextDiv?.innerText;
    
    const newText = prompt("Edit your post:", currentText);
    if (newText && newText !== currentText) {
        await updatePost(postId, newText);
    }
};

window.togglePinPost = togglePinPost;

// Activity page with Ghost Team info
document.getElementById("activityPageBtn")?.addEventListener("click", () => {
    const win = window.open();
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head><title>GhostFeed - Activity & Team</title>
        <style>
            body{background:#000;color:#e0e0e0;font-family:'Inter',sans-serif;padding:20px;max-width:600px;margin:0 auto}
            .card{background:#0a0a0a;border:1px solid #1e1e1e;border-radius:28px;padding:28px;margin-top:20px;animation:fadeIn 0.6s ease}
            @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
            .title{font-size:42px;font-weight:800;background:linear-gradient(135deg,#e0e0e0,#8866cc);background-clip:text;-webkit-background-clip:text;color:transparent;cursor:pointer}
            .back-btn{background:#111;border:1px solid #2a2a2a;border-radius:40px;padding:8px 20px;cursor:pointer;margin-bottom:20px}
        </style>
        </head>
        <body>
        <button class="back-btn" onclick="window.close()"><i class="fa-regular fa-arrow-left"></i> Back</button>
        <div class="card">
            <div class="title" id="title"><i class="fa-regular fa-ghost"></i> Ghost Team</div>
            <p style="margin-top:20px;line-height:1.7"><strong>Who We Are</strong><br>GhostFeed is built by privacy advocates who believe everyone deserves a safe space to speak freely.</p>
            <p style="margin-top:16px"><strong>Our Mission</strong><br>100% anonymous, encrypted, no tracking, no judgment.</p>
            <div style="margin:20px 0"><i class="fa-regular fa-shield"></i> Zero data collection</div>
            <div class="title" style="font-size:24px;margin-top:20px">GhostFeed v1.0</div>
        </div>
        <script>document.getElementById('title').onclick=function(){this.style.animation='textGlow 0.6s';setTimeout(()=>this.style.animation='',600)}<\/script>
        </body>
        </html>
    `);
    win.document.close();
});