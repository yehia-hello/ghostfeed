// ==================== APP INITIALIZATION ====================

async function initApp() {
    const introOverlay = document.getElementById("introOverlay");
    const mainApp = document.getElementById("mainApp");
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const skipBtn = document.getElementById("skipBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const publishBtn = document.getElementById("publishBtn");
    const attachImgBtn = document.getElementById("attachImgBtn");
    const imageUploader = document.getElementById("imageUploader");
    
    // Check for existing session
    const hasSession = await initSession();
    if (hasSession && currentUser) {
        introOverlay.classList.add("hide");
        mainApp.classList.add("visible");
        updateUserUI();
        loadPosts();
    }
    
    // Login handler
    loginBtn.onclick = async () => {
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        const errorDiv = document.getElementById("loginError");
        
        if (!email || !password) {
            errorDiv.innerText = "Enter email and password";
            return;
        }
        
        try {
            await handleLogin(email, password);
            introOverlay.classList.add("hide");
            mainApp.classList.add("visible");
            updateUserUI();
            loadPosts();
            errorDiv.innerText = "";
        } catch (e) {
            errorDiv.innerText = e.message || "Invalid credentials";
        }
    };
    
    // Signup handler
    signupBtn.onclick = async () => {
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        const errorDiv = document.getElementById("loginError");
        
        if (!email || !password) {
            errorDiv.innerText = "Enter email and password";
            return;
        }
        
        try {
            await handleSignup(email, password, email.split('@')[0]);
            errorDiv.innerText = "Check your email to confirm!";
        } catch (e) {
            errorDiv.innerText = e.message;
        }
    };
    
    // Anonymous skip
    skipBtn.onclick = () => {
        initAnonymous();
        introOverlay.classList.add("hide");
        mainApp.classList.add("visible");
        updateUserUI();
        loadPosts();
    };
    
    // Logout
    logoutBtn.onclick = async () => {
        await handleLogout();
    };
    
    // Publish post
    publishBtn.onclick = async () => {
        const content = document.getElementById("postInput").value;
        const success = await createPost(content, pendingImage);
        if (success) {
            document.getElementById("postInput").value = "";
            pendingImage = null;
            document.getElementById("previewRow").innerHTML = "";
        }
    };
    
    // Image upload
    let pendingImage = null;
    attachImgBtn.onclick = () => imageUploader.click();
    imageUploader.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                pendingImage = ev.target.result;
                document.getElementById("previewRow").innerHTML = `
                    <img src="${pendingImage}" class="preview-thumb">
                    <button class="small-btn" onclick="clearImage()"><i class="fa-regular fa-trash-can"></i> Remove</button>
                `;
            };
            reader.readAsDataURL(file);
        }
    };
    
    window.clearImage = () => {
        pendingImage = null;
        document.getElementById("previewRow").innerHTML = "";
        imageUploader.value = "";
    };
    
    window.sharePost = (postId) => {
        navigator.clipboard.writeText(window.location.origin + window.location.pathname + "#post-" + postId);
        showToast("Link copied");
    };
    
    // Particles animation
    initParticles();
}

function updateUserUI() {
    if (!currentUser) return;
    document.getElementById("userInfo").style.display = "flex";
    document.getElementById("userNameDisplay").innerText = currentUser.username;
    document.getElementById("userAvatar").src = currentUser.avatar;
    if (currentUser.isPremium) document.getElementById("verifiedBadge").style.display = "inline-block";
    if (currentUser.isAdmin) document.getElementById("adminBadge").style.display = "inline-block";
}

function initParticles() {
    const canvas = document.getElementById("particle-canvas");
    const ctx = canvas.getContext("2d");
    let w, h, mouseX = null, mouseY = null;
    let particles = [];
    
    function resizeCanvas() {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;
        particles = [];
        for (let i = 0; i < 35; i++) {
            particles.push({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, size: 2 + Math.random() * 4, alpha: 0.1 + Math.random() * 0.2 });
        }
    }
    
    function animate() {
        if (!ctx) return;
        ctx.clearRect(0, 0, w, h);
        let tx = mouseX !== null ? mouseX : w/2, ty = mouseY !== null ? mouseY : h/2;
        for (let p of particles) {
            let dx = tx - p.x, dy = ty - p.y;
            p.vx += dx * 0.025;
            p.vy += dy * 0.025;
            p.vx *= 0.94;
            p.vy *= 0.94;
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < -30) p.x = w + 30;
            if (p.x > w + 30) p.x = -30;
            if (p.y < -30) p.y = h + 30;
            if (p.y > h + 30) p.y = -30;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(100, 100, 110, ${p.alpha * 0.4})`;
            ctx.fill();
        }
        requestAnimationFrame(animate);
    }
    
    document.addEventListener("mousemove", (e) => { mouseX = e.clientX; mouseY = e.clientY; });
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    animate();
}

// Start the app
initApp();