// ==================== LIKES MODULE ====================

async function likePost(postId) {
    if (!currentUser) {
        showToast("Login to like posts", true);
        return;
    }
    
    if (supabase && currentUser.email) {
        // Check if already liked
        const { data: existing } = await supabase
            .from('likes')
            .select('*')
            .eq('post_id', postId)
            .eq('user_id', currentUser.id)
            .single();
        
        if (existing) {
            await supabase.from('likes').delete().eq('id', existing.id);
        } else {
            await supabase.from('likes').insert({ post_id: postId, user_id: currentUser.id });
        }
        loadPosts();
    } else {
        const post = localPosts.find(p => p.id == postId);
        if (post) {
            post.likes = (post.likes || 0) + 1;
            saveLocalPosts();
            renderPosts(localPosts);
        }
    }
}

window.likePost = likePost;