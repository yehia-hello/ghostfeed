// ==================== POSTS MODULE ====================

async function loadPosts() {
    const container = document.getElementById("feedContainer");
    if (!container) return;
    
    if (supabase) {
        const { data: posts, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error("Error loading posts:", error);
            loadLocalPosts();
            return;
        }
        
        renderPosts(posts);
    } else {
        loadLocalPosts();
    }
}

function loadLocalPosts() {
    const sorted = [...localPosts].sort((a, b) => b.timestamp - a.timestamp);
    renderPosts(sorted);
}

async function createPost(content, imageData = null) {
    if (!currentUser) {
        showToast("Please login to post", true);
        return false;
    }
    
    if (!content.trim() && !imageData) {
        showToast("Write something or add an image", true);
        return false;
    }
    
    if (supabase && currentUser.email) {
        const { error } = await supabase.from('posts').insert({
            user_id: currentUser.id,
            username: currentUser.username,
            avatar_url: currentUser.avatar,
            content: content.trim(),
            image_url: imageData,
            is_premium: currentUser.isPremium
        });
        
        if (error) {
            showToast("Error publishing post", true);
            return false;
        }
        
        showToast("Posted!");
        return true;
    } else {
        // Local mode
        localPosts.unshift({
            id: Date.now(),
            user_id: currentUser.id,
            username: currentUser.username,
            avatar_url: currentUser.avatar,
            content: content.trim(),
            image_url: imageData,
            timestamp: Date.now(),
            likes: 0,
            comments: [],
            is_premium: currentUser.isPremium
        });
        saveLocalPosts();
        renderPosts(localPosts);
        showToast("Posted (local mode)");
        return true;
    }
}

async function deletePost(postId) {
    if (!currentUser) return false;
    
    if (supabase && currentUser.email) {
        const { error } = await supabase.from('posts').delete().eq('id', postId);
        if (error) {
            showToast("Cannot delete this post", true);
            return false;
        }
        showToast("Post deleted");
        return true;
    } else {
        localPosts = localPosts.filter(p => p.id !== postId);
        saveLocalPosts();
        renderPosts(localPosts);
        showToast("Post deleted");
        return true;
    }
}

async function updatePost(postId, newContent) {
    if (!currentUser) return false;
    
    if (supabase && currentUser.email) {
        const { error } = await supabase.from('posts').update({ content: newContent }).eq('id', postId);
        if (error) return false;
        showToast("Post updated");
        return true;
    } else {
        const post = localPosts.find(p => p.id === postId);
        if (post) {
            post.content = newContent;
            saveLocalPosts();
            renderPosts(localPosts);
            showToast("Post updated");
            return true;
        }
        return false;
    }
}

async function togglePinPost(postId) {
    if (!currentUser || !currentUser.isAdmin) {
        showToast("Only developers can pin posts", true);
        return;
    }
    
    if (pinnedPostId === postId) {
        pinnedPostId = null;
        showToast("Post unpinned");
    } else {
        pinnedPostId = postId;
        showToast("Post pinned to top");
    }
    loadPosts();
}

function renderPosts(postsList) {
    const container = document.getElementById("feedContainer");
    if (!postsList || postsList.length === 0) {
        container.innerHTML = '<div class="loading-spinner"><i class="fa-regular fa-ghost"></i> No whispers yet... be the first</div>';
        return;
    }
    
    // Sort: pinned first, then by date
    let sorted = [...postsList];
    if (pinnedPostId) {
        const pinnedIndex = sorted.findIndex(p => p.id === pinnedPostId);
        if (pinnedIndex !== -1) {
            const pinned = sorted.splice(pinnedIndex, 1)[0];
            sorted.unshift(pinned);
        }
    }
    sorted.sort((a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp));
    
    const html = sorted.map(post => {
        const isPinned = pinnedPostId === post.id;
        const isPremiumPost = post.is_premium === true;
        const canEditDelete = currentUser && (currentUser.id === post.user_id || currentUser.isAdmin === true);
        const displayName = post.username || 'anonymous';
        
        return `
            <div class="post ${isPremiumPost ? 'premium' : ''} ${isPinned ? 'pinned' : ''}" id="post-${post.id}">
                ${isPinned ? '<div class="pin-badge"><i class="fa-solid fa-thumbtack"></i> PINNED</div>' : ''}
                <div class="post-header">
                    <div class="avatar"><img src="${post.avatar_url || getAnonymousAvatar(post.user_id)}" style="width:100%;height:100%;object-fit:cover"></div>
                    <div>
                        <div class="post-user">${escapeHtml(displayName)}${post.is_premium ? ' <i class="fa-solid fa-circle-check verified-icon"></i>' : ''}</div>
                        <div class="post-time">${formatTime(post.created_at || post.timestamp)}</div>
                    </div>
                    ${canEditDelete ? `
                        <div class="admin-actions">
                            ${currentUser?.isAdmin ? `<button class="admin-btn" onclick="window.togglePinPost(${post.id})"><i class="fa-solid fa-thumbtack"></i> ${isPinned ? 'Unpin' : 'Pin'}</button>` : ''}
                            <button class="admin-btn" onclick="window.editPost(${post.id})"><i class="fa-regular fa-pen"></i></button>
                            <button class="admin-btn" onclick="window.deletePost(${post.id})"><i class="fa-regular fa-trash"></i></button>
                        </div>
                    ` : ''}
                </div>
                <div class="post-text">${escapeHtml(post.content)}</div>
                ${post.image_url ? `<img src="${post.image_url}" class="post-img" onclick="window.open(this.src)">` : ''}
                <div class="action-row">
                    <button class="action-btn" onclick="window.likePost('${post.id}')"><i class="fa-regular fa-heart"></i> ${post.likes_count || post.likes || 0}</button>
                    <button class="action-btn" onclick="window.toggleComments('${post.id}')"><i class="fa-regular fa-comment"></i> ${post.comments_count || (post.comments?.length || 0)}</button>
                    <button class="action-btn" onclick="window.sharePost('${post.id}')"><i class="fa-regular fa-share"></i> Share</button>
                </div>
                <div id="comments-${post.id}" style="display:none; margin-top:12px;"></div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}