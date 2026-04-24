// ==================== SUPABASE CONFIGURATION ====================
// IMPORTANT: Replace with your actual Supabase project credentials
// Get these from: https://app.supabase.com/project/[YOUR_PROJECT]/settings/api

const SUPABASE_CONFIG = {
    url: 'https://YOUR_PROJECT.supabase.co',
    anonKey: 'sb_publishable_eam4V-0H4vk65abadwxGkA_O0A636ig',
    // Premium email that gets admin/dev privileges
    premiumEmail: 'yehiatamer139@gmail.com',
    premiumAvatar: 'https://i.ibb.co/9k53SFRb/Chat-GPT-Image-Apr-20-2026-10-32-28-PM.png'
};

// Initialize Supabase client
let supabase = null;

try {
    if (SUPABASE_CONFIG.url !== 'https://YOUR_PROJECT.supabase.co') {
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Supabase initialized');
    } else {
        console.warn('⚠️ Supabase not configured. Using localStorage fallback mode.');
    }
} catch (e) {
    console.error('❌ Supabase initialization failed:', e);
}

// Global state
let currentUser = null;
let postsRealtimeSubscription = null;
let isAdmin = false;
let pinnedPostId = null;