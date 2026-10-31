/* ═══════════════════════════════════════════════════════════
   NOTA RINGKAS DIGITAL — SCRIPT.JS
   Interactive Features, Mini Game & Sound Effects
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    /* ─────────────────────────────────────────────────────
       1. WEB AUDIO API SYNTHESIZER (Sound FX)
       ───────────────────────────────────────────────────── */
    let audioCtx = null;
    let soundEnabled = localStorage.getItem('soundFX') !== 'false';

    const soundToggle = document.getElementById('soundToggle');
    const soundIcon = document.getElementById('soundIcon');

    function updateSoundToggleUI() {
        if (soundIcon && soundToggle) {
            soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
            soundToggle.classList.toggle('muted', !soundEnabled);
            soundToggle.title = soundEnabled ? 'Bunyi: Hidup (Klik untuk Matikan)' : 'Bunyi: Senyap (Klik untuk Hidupkan)';
        }
    }
    updateSoundToggleUI();

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            localStorage.setItem('soundFX', soundEnabled ? 'true' : 'false');
            updateSoundToggleUI();
            if (soundEnabled) {
                soundFX.playTone(650, 'sine', 0.1, 0, 0.1);
                showToast('🔊 Kesan bunyi dihidupkan');
            } else {
                showToast('🔇 Kesan bunyi dimatikan');
            }
        });
    }

    function initAudio() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    const soundFX = {
        playTone(freq, type = 'sine', duration = 0.1, delay = 0, vol = 0.08) {
            if (!soundEnabled) return;
            try {
                initAudio();
                if (!audioCtx) return;
                const now = audioCtx.currentTime + delay;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(vol, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + duration);
            } catch (e) {
                // AudioContext fallback
            }
        },
        click() {
            this.playTone(580, 'sine', 0.05, 0, 0.06);
        },
        check() {
            this.playTone(520, 'triangle', 0.06, 0, 0.09);
            this.playTone(784, 'sine', 0.1, 0.05, 0.1);
        },
        correct() {
            this.playTone(523.25, 'sine', 0.12, 0, 0.1);       // C5
            this.playTone(659.25, 'sine', 0.14, 0.07, 0.1);    // E5
            this.playTone(783.99, 'sine', 0.22, 0.14, 0.12);   // G5
        },
        wrong() {
            this.playTone(330, 'sawtooth', 0.15, 0, 0.07);
            this.playTone(260, 'sawtooth', 0.22, 0.08, 0.07);
        },
        victory() {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                this.playTone(freq, 'triangle', 0.22, idx * 0.09, 0.12);
            });
        },
        zenBell() {
            this.playTone(432, 'sine', 1.8, 0, 0.15);
        }
    };

    // Initialize audio context on first user click anywhere
    document.addEventListener('click', () => {
        initAudio();
    }, { once: true });

    /* ─────────────────────────────────────────────────────
       2. CANVAS CONFETTI SYSTEM
       ───────────────────────────────────────────────────── */
    const canvas = document.getElementById('confettiCanvas');
    let confettiCtx = null;
    let confettiParticles = [];
    let confettiAnimationId = null;

    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function launchConfetti(count = 75) {
        if (!canvas) return;
        confettiCtx = canvas.getContext('2d');
        const colors = ['#42A5F5', '#66BB6A', '#FFB300', '#EF5350', '#AB47BC', '#26A69A', '#FF8A65'];

        for (let i = 0; i < count; i++) {
            confettiParticles.push({
                x: Math.random() * canvas.width,
                y: -15,
                size: Math.random() * 8 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 3 + 2.5,
                speedX: (Math.random() - 0.5) * 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 8,
                opacity: 1
            });
        }

        if (!confettiAnimationId) {
            animateConfetti();
        }
    }

    function animateConfetti() {
        if (!confettiCtx) return;
        confettiCtx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = confettiParticles.length - 1; i >= 0; i--) {
            const p = confettiParticles[i];
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;
            p.opacity -= 0.007;

            if (p.opacity <= 0 || p.y > canvas.height) {
                confettiParticles.splice(i, 1);
                continue;
            }

            confettiCtx.save();
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate((p.rotation * Math.PI) / 180);
            confettiCtx.globalAlpha = p.opacity;
            confettiCtx.fillStyle = p.color;
            confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.75);
            confettiCtx.restore();
        }

        if (confettiParticles.length > 0) {
            confettiAnimationId = requestAnimationFrame(animateConfetti);
        } else {
            confettiAnimationId = null;
            confettiCtx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    /* ─────────────────────────────────────────────────────
       3. SCROLL PROGRESS INDICATOR
       ───────────────────────────────────────────────────── */
    const scrollProgressBar = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
        const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (totalScroll > 0 && scrollProgressBar) {
            const progress = (window.scrollY / totalScroll) * 100;
            scrollProgressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
        }
    });

    /* ─────────────────────────────────────────────────────
       4. HERO FLOATING PARTICLES
       ───────────────────────────────────────────────────── */
    const particlesContainer = document.getElementById('heroParticles');
    const emojis = ['🌈', '💚', '⭐', '🧠', '💪', '🌱', '✨', '🎓', '📚', '❤️'];
    const particleCount = 18;

    if (particlesContainer) {
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('span');
            particle.classList.add('hero-particle');
            particle.textContent = emojis[i % emojis.length];
            particle.style.left = Math.random() * 100 + '%';
            particle.style.fontSize = (16 + Math.random() * 20) + 'px';
            particle.style.animationDuration = (8 + Math.random() * 12) + 's';
            particle.style.animationDelay = (Math.random() * 10) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    /* ─────────────────────────────────────────────────────
       5. STICKY NAVBAR SCROLL EFFECT & BACK TO TOP
       ───────────────────────────────────────────────────── */
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Navbar shadow on scroll
        if (navbar) {
            navbar.classList.toggle('scrolled', scrollY > 50);
        }

        // Back to top visibility
        if (backToTop) {
            backToTop.classList.toggle('visible', scrollY > 500);
        }

        // Active nav link highlighting
        highlightNavLink();
    });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            soundFX.click();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ─────────────────────────────────────────────────────
       6. MOBILE NAV TOGGLE
       ───────────────────────────────────────────────────── */
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            soundFX.click();
            navToggle.classList.toggle('open');
            navLinks.classList.toggle('open');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('open');
                navLinks.classList.remove('open');
            });
        });
    }

    /* ─────────────────────────────────────────────────────
       7. ACTIVE NAV LINK HIGHLIGHTING
       ───────────────────────────────────────────────────── */
    const sections = document.querySelectorAll('.section, .hero');
    const navAnchors = document.querySelectorAll('.nav-links a');

    function highlightNavLink() {
        let currentSection = '';
        sections.forEach(section => {
            const top = section.offsetTop - 130;
            if (window.scrollY >= top) {
                currentSection = section.getAttribute('id');
            }
        });

        navAnchors.forEach(anchor => {
            anchor.classList.remove('active');
            if (anchor.getAttribute('href') === '#' + currentSection) {
                anchor.classList.add('active');
            }
        });
    }

    /* ─────────────────────────────────────────────────────
       8. SCROLL FADE-IN ANIMATION (Intersection Observer)
       ───────────────────────────────────────────────────── */
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.08
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach((el, index) => {
        el.style.transitionDelay = (index % 4) * 0.08 + 's';
        fadeObserver.observe(el);
    });

    /* ─────────────────────────────────────────────────────
       9. 3D TILT EFFECT FOR CARDS (Micro-Interaction)
       ───────────────────────────────────────────────────── */
    const tiltCards = document.querySelectorAll('.def-card, .strategy-card, .theory-card, .quote-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (window.innerWidth <= 768) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    /* ─────────────────────────────────────────────────────
       10. TABS (Teori Section — Desktop)
       ───────────────────────────────────────────────────── */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            soundFX.click();
            const target = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPanel = document.getElementById('panel-' + target);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    /* ─────────────────────────────────────────────────────
       11. ACCORDION (Teori Section — Mobile)
       ───────────────────────────────────────────────────── */
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            soundFX.click();
            const isActive = header.classList.contains('active');

            accordionHeaders.forEach(h => {
                h.classList.remove('active');
                if (h.nextElementSibling) {
                    h.nextElementSibling.classList.remove('open');
                }
            });

            if (!isActive) {
                header.classList.add('active');
                if (header.nextElementSibling) {
                    header.nextElementSibling.classList.add('open');
                }
            }
        });
    });

    /* ─────────────────────────────────────────────────────
       12. HABIT TRACKER (Checkboxes + Progress Bar)
       ───────────────────────────────────────────────────── */
    const checkboxes = document.querySelectorAll('.habit-check');
    const progressFill = document.getElementById('progressFill');
    const progressCount = document.getElementById('progressCount');
    const totalHabits = checkboxes.length;

    function loadHabitState() {
        const saved = JSON.parse(localStorage.getItem('habitTracker') || '{}');
        checkboxes.forEach(cb => {
            const key = `s${cb.dataset.strategy}_i${cb.dataset.item}`;
            if (saved[key]) {
                cb.checked = true;
            }
        });
        updateProgress(false);
    }

    function saveHabitState() {
        const state = {};
        checkboxes.forEach(cb => {
            const key = `s${cb.dataset.strategy}_i${cb.dataset.item}`;
            state[key] = cb.checked;
        });
        localStorage.setItem('habitTracker', JSON.stringify(state));
    }

    function updateProgress(triggerSound = true) {
        const checked = document.querySelectorAll('.habit-check:checked').length;
        const percentage = totalHabits > 0 ? (checked / totalHabits) * 100 : 0;

        if (progressFill) progressFill.style.width = percentage + '%';
        if (progressCount) progressCount.textContent = `${checked} / ${totalHabits}`;

        if (triggerSound) {
            soundFX.check();
        }

        // Completion reward
        if (checked === totalHabits && totalHabits > 0 && triggerSound) {
            soundFX.victory();
            launchConfetti(90);
            showToast('🎉 Tahniah Siswa Guru! Anda telah melengkapkan semua 18 amalan hari ini!');
        }
    }

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            saveHabitState();
            updateProgress(true);
        });
    });

    loadHabitState();

    /* ─────────────────────────────────────────────────────
       13. GAME TABS SWITCHER
       ───────────────────────────────────────────────────── */
    const gameTabBtns = document.querySelectorAll('.game-tab-btn');
    const gamePanels = document.querySelectorAll('.game-panel');

    gameTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            soundFX.click();
            const gameKey = btn.dataset.game;

            gameTabBtns.forEach(b => b.classList.remove('active'));
            gamePanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPanel = document.getElementById('game-' + gameKey);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    /* ─────────────────────────────────────────────────────
       14. GAME 1: CABARAN KUIZ SIHAT (Interactive Quiz)
       ───────────────────────────────────────────────────── */
    const quizQuestions = [
        {
            category: "🧠 Kesihatan Mental & Fizikal",
            question: "Apakah takrifan kesihatan mental yang tepat mengikut nota ringkas?",
            options: [
                "Keadaan tidak berasa letih selepas menjalani aktiviti sukan berat",
                "Kesejahteraan emosi, psikologi dan sosial yang mempengaruhi cara berfikir, mengawal emosi & berinteraksi",
                "Keupayaan menyiapkan semua tugasan kursus tanpa bantuan rakan",
                "Bebas daripada sebarang penyakit fizikal semata-mata"
            ],
            answer: 1,
            explanation: "Kesihatan mental merangkumi kesejahteraan emosi, psikologi dan sosial seseorang bagi mengawal emosi, mengurus tekanan serta membina interaksi sihat."
        },
        {
            category: "🌐 Asas Kesihatan: WHO",
            question: "Menurut World Health Organization (WHO), kesihatan diertikan sebagai:",
            options: [
                "Sekadar tidak diserang virus atau penyakit bermusim",
                "Kesejahteraan fizikal, mental dan sosial — bukan sekadar ketiadaan penyakit",
                "Mempunyai berat badan ideal mengikut carta BMI sahaja",
                "Bebas daripada tekanan kerja sepanjang semester"
            ],
            answer: 1,
            explanation: "WHO menegaskan kesihatan ialah kesejahteraan menyeluruh fizikal, mental dan sosial secara seimbang, bukan sekadar bebas penyakit!"
        },
        {
            category: "🧼 Asas Kesihatan: WASH",
            question: "Apakah fokus utama dalam inisiatif antarabangsa WASH di persekitaran kampus?",
            options: [
                "Waktu belajar malam dan persediaan peperiksaan akhir",
                "Penekanan kepada air bersih, sanitasi dan kebersihan diri serta persekitaran",
                "Senaman kardio 45 minit setiap petang di padang",
                "Pengambilan makanan segera berkalori tinggi"
            ],
            answer: 1,
            explanation: "WASH (Water, Sanitation and Hygiene) mengutamakan air bersih, sanitasi dan amalan membasuh tangan serta tandas kampus yang bersih."
        },
        {
            category: "🛡️ Asas Kesihatan: Sphere Standards",
            question: "Apakah tujuan penetapan Sphere Standards dalam konteks kesejahteraan siswa guru?",
            options: [
                "Menetapkan piawaian minimum dalam bantuan kemanusiaan serta persekitaran kampus yang bersih & selamat",
                "Menilai gred purata semester guru pelatih",
                "Menghadkan penglibatan pelajar dalam aktiviti luar",
                "Mewajibkan semua latihan dibuat secara individu"
            ],
            answer: 0,
            explanation: "Sphere Standards menetapkan piawaian minimum kemanusiaan (air, sanitasi, kebersihan, kesihatan) untuk persekitaran hidup yang selamat dan menyokong kesejahteraan."
        },
        {
            category: "⭐ 6 Strategi Utama",
            question: "Berapakah saranan jam tidur yang optimum bagi kebanyakan orang dewasa (Strategi 4)?",
            options: [
                "3 hingga 4 jam sehari",
                "5 hingga 6 jam sehari",
                "Sekitar 7–8 jam sehari dengan jadual tidur yang konsisten",
                "Lebih daripada 12 jam sehari"
            ],
            answer: 2,
            explanation: "Mendapatkan tidur 7–8 jam dan mengurangkan penggunaan telefon sebelum tidur membantu pemulihan sel otak dan kecerdasan emosi siswa guru."
        }
    ];

    let currentQIndex = 0;
    let quizScore = 0;
    let quizStreak = 0;
    let quizAnswered = false;

    const quizCurrentQ = document.getElementById('quizCurrentQ');
    const quizScoreEl = document.getElementById('quizScore');
    const quizStreakEl = document.getElementById('quizStreak');
    const quizProgressFill = document.getElementById('quizProgressFill');
    const quizCategoryBadge = document.getElementById('quizCategoryBadge');
    const quizQuestionText = document.getElementById('quizQuestionText');
    const quizOptions = document.getElementById('quizOptions');
    const quizFeedback = document.getElementById('quizFeedback');
    const quizFeedbackIcon = document.getElementById('quizFeedbackIcon');
    const quizFeedbackTitle = document.getElementById('quizFeedbackTitle');
    const quizFeedbackText = document.getElementById('quizFeedbackText');
    const quizNextBtn = document.getElementById('quizNextBtn');
    const quizBody = document.getElementById('quizBody');
    const quizResult = document.getElementById('quizResult');
    const quizRestartBtn = document.getElementById('quizRestartBtn');

    function loadQuizQuestion() {
        quizAnswered = false;
        const q = quizQuestions[currentQIndex];

        if (quizCurrentQ) quizCurrentQ.textContent = `${currentQIndex + 1}/${quizQuestions.length}`;
        if (quizProgressFill) {
            quizProgressFill.style.width = `${((currentQIndex + 1) / quizQuestions.length) * 100}%`;
        }
        if (quizCategoryBadge) quizCategoryBadge.textContent = q.category;
        if (quizQuestionText) quizQuestionText.textContent = q.question;

        if (quizFeedback) quizFeedback.style.display = 'none';

        if (quizOptions) {
            quizOptions.innerHTML = '';
            const keyLetters = ['A', 'B', 'C', 'D'];
            q.options.forEach((optText, optIdx) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-opt-btn';
                btn.innerHTML = `<span class="quiz-opt-key">${keyLetters[optIdx]}</span><span>${optText}</span>`;
                btn.addEventListener('click', () => handleQuizOptionClick(optIdx, btn));
                quizOptions.appendChild(btn);
            });
        }
    }

    function handleQuizOptionClick(selectedIndex, selectedBtn) {
        if (quizAnswered) return;
        quizAnswered = true;

        const q = quizQuestions[currentQIndex];
        const allOptionBtns = quizOptions.querySelectorAll('.quiz-opt-btn');
        allOptionBtns.forEach(btn => btn.disabled = true);

        const isCorrect = selectedIndex === q.answer;

        if (isCorrect) {
            selectedBtn.classList.add('is-correct');
            quizScore += 100 + (quizStreak * 25);
            quizStreak += 1;
            soundFX.correct();
            launchConfetti(25);

            if (quizFeedbackIcon) quizFeedbackIcon.textContent = '🌟';
            if (quizFeedbackTitle) quizFeedbackTitle.textContent = 'Tahniah, Jawapan Tepat!';
            if (quizFeedback) {
                quizFeedback.className = 'quiz-feedback is-correct';
            }
        } else {
            selectedBtn.classList.add('is-wrong');
            // Highlight the correct one
            if (allOptionBtns[q.answer]) {
                allOptionBtns[q.answer].classList.add('is-correct');
            }
            quizStreak = 0;
            soundFX.wrong();

            if (quizFeedbackIcon) quizFeedbackIcon.textContent = '💡';
            if (quizFeedbackTitle) quizFeedbackTitle.textContent = 'Kurang Tepat, Mari Ulang Kaji:';
            if (quizFeedback) {
                quizFeedback.className = 'quiz-feedback is-wrong';
            }
        }

        if (quizScoreEl) quizScoreEl.textContent = quizScore;
        if (quizStreakEl) quizStreakEl.textContent = `🔥 ${quizStreak}`;

        if (quizFeedbackText) quizFeedbackText.textContent = q.explanation;
        if (quizFeedback) quizFeedback.style.display = 'flex';

        if (quizNextBtn) {
            quizNextBtn.textContent = (currentQIndex < quizQuestions.length - 1) ? 'Soalan Seterusnya ➔' : 'Lihat Keputusan 🏆';
        }
    }

    if (quizNextBtn) {
        quizNextBtn.addEventListener('click', () => {
            soundFX.click();
            currentQIndex++;
            if (currentQIndex < quizQuestions.length) {
                loadQuizQuestion();
            } else {
                showQuizResult();
            }
        });
    }

    function showQuizResult() {
        if (quizBody) quizBody.style.display = 'none';
        if (quizResult) quizResult.style.display = 'block';

        const finalScoreEl = document.getElementById('quizFinalScore');
        const accuracyEl = document.getElementById('quizAccuracy');
        const rankEl = document.getElementById('quizRank');
        const trophyEl = document.getElementById('quizResultTrophy');
        const titleEl = document.getElementById('quizResultTitle');

        if (finalScoreEl) finalScoreEl.textContent = quizScore;

        let correctCount = Math.round(quizScore / 100);
        if (correctCount > 5) correctCount = 5;

        if (accuracyEl) accuracyEl.textContent = `${correctCount} / 5 Soalan`;

        if (quizScore >= 400) {
            if (trophyEl) trophyEl.textContent = '🏆';
            if (titleEl) titleEl.textContent = 'Cemerlang, Guru Kesihatan Sejati!';
            if (rankEl) rankEl.textContent = 'Juara Kesihatan Holistik';
            soundFX.victory();
            launchConfetti(100);
        } else if (quizScore >= 200) {
            if (trophyEl) trophyEl.textContent = '🎖️';
            if (titleEl) titleEl.textContent = 'Bagus! Hampir Sempurna!';
            if (rankEl) rankEl.textContent = 'Duta Kesejahteraan Siswa Guru';
            soundFX.victory();
            launchConfetti(50);
        } else {
            if (trophyEl) trophyEl.textContent = '🌱';
            if (titleEl) titleEl.textContent = 'Usaha Baik! Teruskan Pembelajaran!';
            if (rankEl) rankEl.textContent = 'Peneroka Amalan Sihat';
        }
    }

    if (quizRestartBtn) {
        quizRestartBtn.addEventListener('click', () => {
            soundFX.click();
            currentQIndex = 0;
            quizScore = 0;
            quizStreak = 0;
            if (quizScoreEl) quizScoreEl.textContent = '0';
            if (quizStreakEl) quizStreakEl.textContent = '🔥 0';
            if (quizResult) quizResult.style.display = 'none';
            if (quizBody) quizBody.style.display = 'block';
            loadQuizQuestion();
        });
    }

    loadQuizQuestion();

    /* ─────────────────────────────────────────────────────
       15. GAME 2: ZEN BREATH SIMULATOR (4-7-8)
       ───────────────────────────────────────────────────── */
    const zenOrb = document.getElementById('zenOrb');
    const zenPhaseIcon = document.getElementById('zenPhaseIcon');
    const zenPhaseTitle = document.getElementById('zenPhaseTitle');
    const zenPhaseTimer = document.getElementById('zenPhaseTimer');
    const zenStartBtn = document.getElementById('zenStartBtn');
    const zenBtnText = document.getElementById('zenBtnText');
    const zenCycleCount = document.getElementById('zenCycleCount');

    let isZenRunning = false;
    let zenTimerInterval = null;
    let completedCycles = 0;

    const zenPhases = [
        { name: 'Tarik Nafas...', duration: 4, icon: '🌬️', cssClass: 'is-inhale' },
        { name: 'Tahan Nafas...', duration: 7, icon: '⏸️', cssClass: 'is-hold' },
        { name: 'Hembus Perlahan...', duration: 8, icon: '🍃', cssClass: 'is-exhale' }
    ];

    let currentPhaseIndex = 0;
    let secondsLeft = 0;

    function runZenStep() {
        if (!isZenRunning) return;

        const phase = zenPhases[currentPhaseIndex];
        secondsLeft = phase.duration;

        if (zenPhaseTitle) zenPhaseTitle.textContent = phase.name;
        if (zenPhaseIcon) zenPhaseIcon.textContent = phase.icon;
        if (zenPhaseTimer) zenPhaseTimer.textContent = `${secondsLeft}s`;

        if (zenOrb) {
            zenOrb.className = 'zen-orb ' + phase.cssClass;
        }

        soundFX.zenBell();

        zenTimerInterval = setInterval(() => {
            secondsLeft--;
            if (zenPhaseTimer) zenPhaseTimer.textContent = `${secondsLeft}s`;

            if (secondsLeft <= 0) {
                clearInterval(zenTimerInterval);

                if (currentPhaseIndex === 2) {
                    completedCycles++;
                    if (zenCycleCount) zenCycleCount.textContent = completedCycles;
                    if (completedCycles === 4) {
                        launchConfetti(40);
                        showToast('🧘 Kitaran selesai! Minda anda kini lebih tenang dan bersedia.');
                    }
                }

                currentPhaseIndex = (currentPhaseIndex + 1) % zenPhases.length;
                runZenStep();
            }
        }, 1000);
    }

    function startZen() {
        isZenRunning = true;
        currentPhaseIndex = 0;
        if (zenBtnText) zenBtnText.textContent = '⏹️ Hentikan Latihan';
        if (zenStartBtn) zenStartBtn.classList.replace('btn-primary', 'btn-secondary');
        runZenStep();
    }

    function stopZen() {
        isZenRunning = false;
        clearInterval(zenTimerInterval);
        if (zenOrb) zenOrb.className = 'zen-orb';
        if (zenPhaseTitle) zenPhaseTitle.textContent = 'Bersedia...';
        if (zenPhaseIcon) zenPhaseIcon.textContent = '🌬️';
        if (zenPhaseTimer) zenPhaseTimer.textContent = '0s';
        if (zenBtnText) zenBtnText.textContent = '▶️ Mula Latihan Pernafasan';
        if (zenStartBtn) zenStartBtn.classList.replace('btn-secondary', 'btn-primary');
    }

    if (zenStartBtn) {
        zenStartBtn.addEventListener('click', () => {
            soundFX.click();
            if (isZenRunning) {
                stopZen();
            } else {
                startZen();
            }
        });
    }

    /* ─────────────────────────────────────────────────────
       16. AZAM / REFLEKSI (localStorage)
       ───────────────────────────────────────────────────── */
    const azamInput = document.getElementById('azamInput');
    const saveAzamBtn = document.getElementById('saveAzam');
    const savedAzamDiv = document.getElementById('savedAzam');
    const savedText = document.getElementById('savedText');
    const savedDate = document.getElementById('savedDate');
    const resetAzamBtn = document.getElementById('resetAzam');

    function loadAzam() {
        const azamData = JSON.parse(localStorage.getItem('azamKesihatan') || 'null');
        if (azamData && azamData.text) {
            if (azamInput && azamInput.parentElement) {
                azamInput.parentElement.style.display = 'none';
            }
            if (savedAzamDiv) savedAzamDiv.style.display = 'block';
            if (savedText) savedText.textContent = azamData.text;
            if (savedDate) savedDate.textContent = '📅 Disimpan pada: ' + azamData.date;
        }
    }

    if (saveAzamBtn) {
        saveAzamBtn.addEventListener('click', () => {
            const text = azamInput ? azamInput.value.trim() : '';
            if (!text) {
                soundFX.wrong();
                showToast('⚠️ Sila tulis azam anda terlebih dahulu.');
                if (azamInput) azamInput.focus();
                return;
            }

            const now = new Date();
            const dateStr = now.toLocaleDateString('ms-MY', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const azamData = { text: text, date: dateStr };
            localStorage.setItem('azamKesihatan', JSON.stringify(azamData));

            if (azamInput && azamInput.parentElement) {
                azamInput.parentElement.style.display = 'none';
            }
            if (savedAzamDiv) savedAzamDiv.style.display = 'block';
            if (savedText) savedText.textContent = text;
            if (savedDate) savedDate.textContent = '📅 Disimpan pada: ' + dateStr;

            soundFX.victory();
            launchConfetti(60);
            showToast('✅ Azam anda telah berjaya disimpan!');
        });
    }

    if (resetAzamBtn) {
        resetAzamBtn.addEventListener('click', () => {
            soundFX.click();
            localStorage.removeItem('azamKesihatan');
            if (savedAzamDiv) savedAzamDiv.style.display = 'none';
            if (azamInput && azamInput.parentElement) {
                azamInput.parentElement.style.display = 'flex';
                azamInput.value = '';
                azamInput.focus();
            }
            showToast('🗑️ Azam telah dipadam. Sila tulis azam baharu.');
        });
    }

    loadAzam();

    /* ─────────────────────────────────────────────────────
       17. BUTTON RIPPLE EFFECT
       ───────────────────────────────────────────────────── */
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            btn.style.setProperty('--x', x + '%');
            btn.style.setProperty('--y', y + '%');
        });
    });

    /* ─────────────────────────────────────────────────────
       18. TOAST NOTIFICATION SYSTEM
       ───────────────────────────────────────────────────── */
    function showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    /* ─────────────────────────────────────────────────────
       19. SMOOTH SCROLL ANCHORS
       ───────────────────────────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId && targetId !== '#') {
                e.preventDefault();
                soundFX.click();
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

});
