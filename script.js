// ===========================
// PM NETWORK GRAPH CANVAS
// ===========================
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let nodes = [];
const NODE_COUNT = window.innerWidth < 768 ? 20 : 55;
const MAX_DIST = 160;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function randomBetween(a, b) { return Math.random() * (b - a) + a; }

function createNode() {
    return {
        x: randomBetween(0, canvas.width),
        y: randomBetween(0, canvas.height),
        vx: randomBetween(-0.35, 0.35),
        vy: randomBetween(-0.25, 0.25),
        radius: randomBetween(2, 4.5),
        isAccent: Math.random() < 0.22,
        pulse: randomBetween(0, Math.PI * 2),
        pulseSpeed: randomBetween(0.015, 0.04),
    };
}

function initNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) nodes.push(createNode());
}

function drawNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connection lines between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MAX_DIST) {
                const alpha = (1 - dist / MAX_DIST) * 0.28;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.strokeStyle = `rgba(14, 165, 233, ${alpha})`;
                ctx.lineWidth = 0.7;
                ctx.stroke();
            }
        }
    }

    // Draw each node
    for (const n of nodes) {
        n.pulse += n.pulseSpeed;
        const glowR = n.radius + Math.sin(n.pulse) * 1.5;
        // Sky cyan for most nodes, indigo/violet for ~22%
        const [r, g, b] = n.isAccent ? [129, 140, 248] : [14, 165, 233];

        // Glow halo (Performance optimization: only on desktop)
        if (window.innerWidth >= 768) {
            const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, Math.max(1, glowR * 3.5));
            grd.addColorStop(0, `rgba(${r},${g},${b},0.22)`);
            grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.beginPath();
            ctx.arc(n.x, n.y, Math.max(1, glowR * 3.5), 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
        }

        // Node core
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
        ctx.fill();

        // Move
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = canvas.width + 20;
        if (n.x > canvas.width + 20) n.x = -20;
        if (n.y < -20) n.y = canvas.height + 20;
        if (n.y > canvas.height + 20) n.y = -20;
    }

    requestAnimationFrame(drawNetwork);
}

resizeCanvas();
initNodes();
drawNetwork();
window.addEventListener('resize', () => { resizeCanvas(); initNodes(); });

// ===========================
// TYPED TEXT EFFECT
// ===========================
const roles = [
    'Full-Stack Developer',
    'Undergraduate at RUSL',
    'Machine Learning Researcher',
    'IoT Systems Builder',
    'Problem Solver',
    'Data Science Enthusiast',
    'Robotic Society Lead',
];
let roleIdx = 0, charIdx = 0, isDeleting = false;
const typedEl = document.getElementById('typedText');

function typeEffect() {
    const current = roles[roleIdx];
    if (isDeleting) {
        typedEl.textContent = current.substring(0, charIdx--);
        if (charIdx < 0) {
            isDeleting = false;
            roleIdx = (roleIdx + 1) % roles.length;
            setTimeout(typeEffect, 500);
            return;
        }
        setTimeout(typeEffect, 60);
    } else {
        typedEl.textContent = current.substring(0, charIdx++);
        if (charIdx > current.length) {
            isDeleting = true;
            setTimeout(typeEffect, 2000);
            return;
        }
        setTimeout(typeEffect, 100);
    }
}
setTimeout(typeEffect, 1000);

// ===========================
// SCROLL REVEAL
// ===========================
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, i * 80);
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

revealElements.forEach(el => revealObserver.observe(el));

// ===========================
// ACTIVE NAV HIGHLIGHT (Scrollspy)
// ===========================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
    const navHeight = document.getElementById('navbar').offsetHeight;
    const scrollY = window.scrollY;

    // Find the section whose top is at or above the navbar bottom,
    // picking the last one that satisfies this (i.e., the one currently "in view")
    let currentId = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - navHeight - 10;
        if (scrollY >= sectionTop) {
            currentId = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
            link.classList.add('active');
        }
    });
}

// Throttle with requestAnimationFrame for smooth performance
let rafPending = false;
window.addEventListener('scroll', () => {
    if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
            updateActiveNav();
            rafPending = false;
        });
    }
}, { passive: true });

// Run once on load to set initial active state
updateActiveNav();

// ===========================
// HAMBURGER MENU
// ===========================
const hamburger = document.getElementById('hamburger');
const navLinksContainer = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    navLinksContainer.classList.toggle('open');
    hamburger.classList.toggle('open');
});

navLinksContainer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinksContainer.classList.remove('open');
        hamburger.classList.remove('open');
    });
});

// ===========================
// CONTACT FORM
// ===========================

// Helper: Fetch location data and fill hidden form fields
function fetchAndFillLocation() {
    return fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
            if (data && !data.error) {
                const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || 'Unknown'; };
                setVal('senderCity', data.city);
                setVal('senderCountry', data.country_name);
                setVal('senderRegion', data.region);
                setVal('senderIP', data.ip);
                setVal('senderTimezone', data.timezone);
                if (data.latitude && data.longitude) {
                    setVal('senderCoords', `${data.latitude}, ${data.longitude}`);
                    setVal('senderMapLink', `https://www.google.com/maps?q=${data.latitude},${data.longitude}`);
                }
            }
        })
        .catch(() => {
            // If API fails, set fields to indicate failure
            const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
            setVal('senderCity', 'Could not detect');
            setVal('senderCountry', 'Could not detect');
            setVal('senderRegion', 'Could not detect');
            setVal('senderIP', 'Could not detect');
            setVal('senderTimezone', 'Could not detect');
        });
}

document.getElementById('contactForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    // Show loading state
    btn.innerHTML = 'Detecting location... <i class="fas fa-map-marker-alt fa-beat"></i>';
    btn.disabled = true;

    // Step 1: Fetch fresh location data and wait for it
    await fetchAndFillLocation();

    // Step 2: Now submit the form with location data included
    btn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';

    const formData = new FormData(form);

    fetch('https://formsubmit.co/ajax/hirushan.premarathne@gmail.com', {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: formData
    })
        .then(async (response) => {
            let json = await response.json();
            // Formsubmit returns success as string "true" or "false", not boolean
            if (json.success === true || json.success === "true") {
                btn.innerHTML = 'Message Sent! <i class="fas fa-check"></i>';
                btn.style.background = '#22c55e';
                form.reset();
            } else if (json.message && json.message.includes('Activation')) {
                // Form needs activation - show helpful message
                btn.innerHTML = 'Activation Required <i class="fas fa-exclamation-triangle"></i>';
                btn.style.background = '#f59e0b';
                alert('Almost there! Please check your email (hirushan.premarathne@gmail.com) for an activation link from Formsubmit.co. Click that link once, then try sending again.');
            } else {
                btn.innerHTML = 'Error Sending <i class="fas fa-times"></i>';
                btn.style.background = '#ef4444';
            }
        })
        .catch(error => {
            console.log(error);
            btn.innerHTML = 'Error Sending <i class="fas fa-times"></i>';
            btn.style.background = '#ef4444';
        })
        .finally(() => {
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.disabled = false;
            }, 5000);
        });
});

// ===========================
// NAVBAR SCROLL EFFECT
// ===========================
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(6, 9, 26, 0.98)';
        navbar.style.borderBottomColor = 'rgba(14, 165, 233, 0.35)';
    } else {
        navbar.style.background = 'rgba(6, 9, 26, 0.92)';
        navbar.style.borderBottomColor = 'rgba(14, 165, 233, 0.15)';
    }
});

// ===========================
// PROFILE IMAGE TILT ON HOVER
// ===========================
const profileWrapper = document.querySelector('.about-image-wrapper');
if (profileWrapper) {
    profileWrapper.addEventListener('mousemove', (e) => {
        const rect = profileWrapper.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotX = -(y / rect.height) * 8;
        const rotY = (x / rect.width) * 8;
        profileWrapper.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });
    profileWrapper.addEventListener('mouseleave', () => {
        profileWrapper.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
        setTimeout(() => { profileWrapper.style.transform = ''; }, 400);
    });
}

// ===========================
// PRE-FETCH LOCATION ON PAGE LOAD
// ===========================
// Pre-fill location data when page loads (as a head start).
// The form submit handler will fetch again to guarantee fresh data.
fetchAndFillLocation();
