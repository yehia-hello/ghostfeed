// ==================== UTILITY FUNCTIONS ====================

function showToast(msg, isError = false) {
    const toast = document.getElementById("toastMsg");
    toast.textContent = msg;
    toast.style.display = "block";
    setTimeout(() => toast.style.display = "none", 2000);
}

function formatTime(ts) {
    if (!ts) return "just now";
    const date = new Date(ts);
    if (isNaN(date.getTime())) return "recent";
    const sec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (sec < 10) return "just now";
    if (sec < 60) return sec + "s ago";
    const min = Math.floor(sec / 60);
    if (min < 60) return min + "m ago";
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + "h ago";
    return Math.floor(hr / 24) + "d ago";
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        return '&gt;';
    });
}

function getAnonymousAvatar(seed) {
    const colors = ['#2a1a3a', '#1a2a3a', '#3a1a2a', '#1a3a2a', '#2a2a4a', '#3a2a1a'];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    const color = colors[Math.abs(hash) % colors.length];
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='${color}'/%3E%3Ccircle cx='20' cy='14' r='6' fill='%23c0c0c0'/%3E%3Cpath d='M8 34 Q20 28 32 34' stroke='%23c0c0c0' stroke-width='3' fill='none' stroke-linecap='round'/%3E%3C/svg%3E`;
}

function updateHeaderBadge(count) {
    const badge = document.getElementById("headerBadge");
    if (badge) badge.innerText = count || 0;
}

// Local storage fallback for anonymous/demo mode
let localPosts = JSON.parse(localStorage.getItem("gf_local_posts")) || [];

function saveLocalPosts() {
    localStorage.setItem("gf_local_posts", JSON.stringify(localPosts));
}