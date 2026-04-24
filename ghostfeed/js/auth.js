// ==================== AUTHENTICATION MODULE ====================

async function handleLogin(email, password) {
    if (!supabase) {
        // Demo mode - simulate login
        if (email && password) {
            currentUser = {
                id: "demo_" + Date.now(),
                email: email,
                username: email.split('@')[0],
                avatar: getAnonymousAvatar(email),
                isPremium: email === SUPABASE_CONFIG.premiumEmail,
                isAdmin: email === SUPABASE_CONFIG.premiumEmail
            };
            localStorage.setItem("gf_demo_user", JSON.stringify(currentUser));
            return true;
        }
        throw new Error("Invalid credentials");
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    currentUser = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username || data.user.email.split('@')[0],
        avatar: data.user.user_metadata?.avatar || getAnonymousAvatar(data.user.id),
        isPremium: data.user.email === SUPABASE_CONFIG.premiumEmail,
        isAdmin: data.user.email === SUPABASE_CONFIG.premiumEmail
    };
    
    localStorage.setItem("gf_user", JSON.stringify(currentUser));
    return true;
}

async function handleSignup(email, password, username) {
    if (!supabase) {
        throw new Error("Supabase not configured. Please set up your database first.");
    }
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username || email.split('@')[0] } }
    });
    
    if (error) throw error;
    return data.user;
}

async function handleGoogleLogin() {
    if (!supabase) {
        showToast("Google login requires Supabase configuration", true);
        return;
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
}

async function handleLogout() {
    if (supabase) {
        await supabase.auth.signOut();
    }
    localStorage.removeItem("gf_user");
    localStorage.removeItem("gf_demo_user");
    currentUser = null;
    location.reload();
}

async function initSession() {
    if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            currentUser = {
                id: session.user.id,
                email: session.user.email,
                username: session.user.user_metadata?.username || session.user.email.split('@')[0],
                avatar: session.user.user_metadata?.avatar || getAnonymousAvatar(session.user.id),
                isPremium: session.user.email === SUPABASE_CONFIG.premiumEmail,
                isAdmin: session.user.email === SUPABASE_CONFIG.premiumEmail
            };
            localStorage.setItem("gf_user", JSON.stringify(currentUser));
            return true;
        }
    }
    
    // Check for demo user
    const demoUser = localStorage.getItem("gf_demo_user");
    if (demoUser) {
        currentUser = JSON.parse(demoUser);
        return true;
    }
    
    return false;
}

function initAnonymous() {
    const anonymousId = "anon_" + Math.random().toString(36).substr(2, 8);
    currentUser = {
        id: anonymousId,
        email: null,
        username: "anonymous",
        avatar: getAnonymousAvatar(anonymousId),
        isPremium: false,
        isAdmin: false
    };
    localStorage.setItem("gf_anonymous", JSON.stringify(currentUser));
    return true;
}