// ==================== COMMENTS MODULE ====================

async function loadComments(postId) {
    if (supabase) {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });
        
        if (error) return [];
        return data;
    } else {
        const post = localPosts.find(p => p.id == postId);
        return post?.comments || [];
    }
}

async function addComment(postId, content) {
    if (!currentUser) {
        showToast("Please login to comment", true);
        return false;
    }
    
    if (!content.trim()) {
        showToast("Empty comment", true);
        return false;
    }
    
    if (supabase && currentUser.email) {
        const { error } = await supabase.from('comments').insert({
            post_id: postId,
            user_id: currentUser.id,
            username: currentUser.username,
            avatar_url: currentUser.avatar,
            content: content.trim()
        });
        
        if (error) {
            showToast("Error adding comment", true);
            return false;
        }
        return true;
    } else {
        const post = localPosts.find(p => p.id == postId);
        if (post) {
            if (!post.comments) post.comments = [];
            post.comments.push({
                id: Date.now(),
                user_id: currentUser.id,
                username: currentUser.username,
                avatar_url: currentUser.avatar,
                content: content.trim(),
                timestamp: Date.now()
            });
            saveLocalPosts();
            return true;
        }
        return false;
    }
}

window.toggleComments = async function(postId) {
    const container = document.getElementById(`comments-${postId}`);
    if (!container) return;
    
    if (container.style.display === 'block') {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    container.innerHTML = '<div style="color:#666; font-size:12px; padding:8px">Loading comments...</div>';
    
    const comments = await loadComments(postId);
    
    if (comments.length === 0) {
        container.innerHTML = '<div style="color:#555; padding:12px; text-align:center">No comments yet</div>';
    } else {
        const commentsHtml = comments.map(c => `
            <div class="comment">
                <div class="comment-header">
                    <div class="avatar" style="width:24px;height:24px;"><img src="${c.avatar_url || getAnonymousAvatar(c.user_id)}" style="width:100%;height:100%"></div>
                    <span class="comment-user">${escapeHtml(c.username || 'anonymous')}</span>
                    <span style="color:#555; font-size:10px">${formatTime(c.created_at || c.timestamp)}</span>
                </div>
                <div class="comment-text">${escapeHtml(c.content)}</div>
            </div>
        `).join('');
        container.innerHTML = commentsHtml;
    }
    
    // Add comment input
    container.innerHTML += `
        <div style="display:flex; gap:8px; margin-top:12px">
            <input type="text" id="comment-input-${postId}" placeholder="Write a comment..." style="flex:1; background:#0a0a0a; border:1px solid #252525; border-radius:30px; padding:8px 14px; font-size:11px; color:#ddd">
            <button class="action-btn" onclick="window.addComment('${postId}')" style="padding:6px 14px">Post</button>
        </div>
    `;
};

window.addComment = async function(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value.trim();
    
    const success = await addComment(postId, content);
    if (success) {
        showToast("Comment added");
        input.value = "";
        await window.toggleComments(postId);
        loadPosts(); // Refresh to update comment count
    }
};