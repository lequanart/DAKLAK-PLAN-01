// ============================
// Đắk Lắk Timeline — Script
// ============================
document.addEventListener('DOMContentLoaded', () => {

    // ============================
    // 1. Sidebar Toggle
    // ============================
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarContent = document.getElementById('sidebarContent');
    let sidebarOpen = false;

    sidebarToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebarOpen = !sidebarOpen;
        sidebar.classList.toggle('open', sidebarOpen);
    });

    // Close sidebar when clicking a link
    sidebarContent.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', () => {
            sidebarOpen = false;
            sidebar.classList.remove('open');
        });
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (sidebarOpen && !sidebar.contains(e.target)) {
            sidebarOpen = false;
            sidebar.classList.remove('open');
        }
    });

    // ============================
    // 2. Active Section Tracking (Notion-style)
    // ============================
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
    const sectionIds = Array.from(sidebarLinks).map(l => l.dataset.section);
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    function updateActiveSection() {
        const scrollY = window.scrollY + window.innerHeight / 3;
        let active = sectionIds[0];

        sections.forEach((sec, i) => {
            if (sec.offsetTop <= scrollY) {
                active = sectionIds[i];
            }
        });

        sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === active);
        });

        // Also update horizontal timeline bar
        htlStops.forEach(stop => {
            stop.classList.toggle('htl-active', stop.dataset.section === active);
        });
    }

    // Horizontal timeline bar elements (needed by updateActiveSection above)
    const htlTrack = document.getElementById('htlTrack');
    const htlHint = document.getElementById('htlHint');
    const htlStops = document.querySelectorAll('.htl-stop[data-section]');

    window.addEventListener('scroll', updateActiveSection, { passive: true });
    updateActiveSection();

    // ============================
    // 2b. Horizontal Timeline Bar — Drag to scroll
    // ============================
    const htlBar = document.getElementById('htlBar');

    if (htlBar) {
        let isDragging = false;
        let startX = 0;
        let scrollLeft = 0;
        let hasDragged = false;

        htlBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            hasDragged = false;
            startX = e.pageX;
            scrollLeft = htlBar.scrollLeft;
            htlBar.classList.add('dragging');
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const walk = (e.pageX - startX) * 1.8;
            if (Math.abs(walk) > 5) hasDragged = true;
            htlBar.scrollLeft = scrollLeft - walk;
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                htlBar.classList.remove('dragging');
            }
        });

        // Touch support
        htlBar.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX;
            scrollLeft = htlBar.scrollLeft;
        }, { passive: true });

        htlBar.addEventListener('touchmove', (e) => {
            const walk = (e.touches[0].pageX - startX) * 1.8;
            htlBar.scrollLeft = scrollLeft - walk;
        }, { passive: true });

        // Hide hint after first interaction
        htlBar.addEventListener('scroll', () => {
            if (htlHint) htlHint.classList.add('hidden');
        }, { passive: true, once: true });

        // Prevent click navigation if user was dragging
        htlStops.forEach(stop => {
            stop.addEventListener('click', (e) => {
                if (hasDragged) {
                    e.preventDefault();
                    hasDragged = false;
                }
            });
        });
    }

    // ============================
    // 3. Show/Hide sidebar on scroll (auto-show after hero)
    // ============================
    const hero = document.getElementById('hero');
    let lastScrollY = 0;
    let sidebarVisible = false;

    function checkSidebarVisibility() {
        const heroBottom = hero ? hero.offsetHeight : 400;
        const currentScroll = window.scrollY;

        if (currentScroll > heroBottom * 0.6 && !sidebarVisible) {
            sidebar.style.opacity = '1';
            sidebar.style.pointerEvents = 'auto';
            sidebarVisible = true;
        } else if (currentScroll <= heroBottom * 0.3 && sidebarVisible) {
            sidebar.style.opacity = '0';
            sidebar.style.pointerEvents = 'none';
            sidebarOpen = false;
            sidebar.classList.remove('open');
            sidebarVisible = false;
        }
        lastScrollY = currentScroll;
    }

    // Initially hidden
    sidebar.style.opacity = '0';
    sidebar.style.pointerEvents = 'none';
    sidebar.style.transition = 'opacity 0.4s ease';

    window.addEventListener('scroll', checkSidebarVisibility, { passive: true });
    checkSidebarVisibility();

    // ============================
    // 4. Back to Top Button
    // ============================
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 600);
        }, { passive: true });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================
    // 4. Scroll Reveal Animation (timeline items + reveal els)
    // ============================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 60);
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.timeline-item').forEach(el => {
        revealObserver.observe(el);
    });

    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // ============================
    // 5. Smooth scroll for anchor links
    // ============================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 20;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({
                    top: top,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================
    // 6. Parallax Hero
    // ============================
    const heroBg = document.querySelector('.hero-bg img');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            if (scrolled < window.innerHeight) {
                const rate = scrolled * 0.25;
                heroBg.style.transform = `translateY(${rate}px) scale(1.05)`;
            }
        }, { passive: true });
    }

    // ============================
    // 7. Checklist interactivity
    // ============================
    document.querySelectorAll('.check-item').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            if (item.textContent.startsWith('☐')) {
                item.textContent = item.textContent.replace('☐', '☑');
                item.style.color = '#16A34A';
                item.style.textDecoration = 'line-through';
                item.style.opacity = '0.6';
            } else if (item.textContent.startsWith('☑')) {
                item.textContent = item.textContent.replace('☑', '☐');
                item.style.color = '';
                item.style.textDecoration = '';
                item.style.opacity = '';
            }
        });
    });

    // ============================
    // 8. Stat cards count-up animation
    // ============================
    const statCards = document.querySelectorAll('.stat-number');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const finalText = el.textContent;
                const numMatch = finalText.match(/[\d.]+/);
                if (numMatch) {
                    const finalNum = parseFloat(numMatch[0]);
                    const suffix = finalText.replace(numMatch[0], '');
                    let start = 0;
                    const duration = 1200;
                    const startTime = performance.now();

                    function animate(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = Math.round(eased * finalNum * 10) / 10;

                        if (Number.isInteger(finalNum)) {
                            el.textContent = Math.round(eased * finalNum) + suffix;
                        } else {
                            el.textContent = current.toFixed(1) + suffix;
                        }

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            el.textContent = finalText;
                        }
                    }
                    requestAnimationFrame(animate);
                }
                statObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statCards.forEach(card => statObserver.observe(card));

});
