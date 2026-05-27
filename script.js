document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY_DAILY = 'leanScoreHistoryDaily';
    const STORAGE_KEY_WEEKLY = 'leanScoreHistoryWeekly';
    const PREFS_KEY = 'leanDashPrefs';

    let trackingMode = 'daily';
    let viewMode = 'normal';

    const els = {
        trainingHours: document.getElementById('trainingHours'),
        trainingSlider: document.getElementById('trainingSlider'),
        standardWork: document.getElementById('standardWork'),
        standardWorkSlider: document.getElementById('standardWorkSlider'),
        dailyManagement: document.getElementById('dailyManagement'),
        dailyManagementSlider: document.getElementById('dailyManagementSlider'),
        totalActions: document.getElementById('totalActions'),
        closedActions: document.getElementById('closedActions'),
        actionMessage: document.getElementById('actionMessage'),
        kaizenSubmitted: document.getElementById('kaizenSubmitted'),
        kaizenImplemented: document.getElementById('kaizenImplemented'),
        fiveSScore: document.getElementById('fiveSScore'),
        fiveSSlider: document.getElementById('fiveSSlider'),
        wasteDefects: document.getElementById('wasteDefects'),
        wasteOverproduction: document.getElementById('wasteOverproduction'),
        wasteWaiting: document.getElementById('wasteWaiting'),
        wasteNonUtilized: document.getElementById('wasteNonUtilized'),
        wasteTransport: document.getElementById('wasteTransport'),
        wasteInventory: document.getElementById('wasteInventory'),
        wasteMotion: document.getElementById('wasteMotion'),
        wasteExtraProcessing: document.getElementById('wasteExtraProcessing'),
        targetScore: document.getElementById('targetScore'),
        calculateBtn: document.getElementById('calculateBtn'),
        resultsSection: document.getElementById('resultsSection'),
        gaugeFill: document.getElementById('gaugeFill'),
        gaugeTarget: document.getElementById('gaugeTarget'),
        scoreValue: document.getElementById('scoreValue'),
        performanceBadge: document.getElementById('performanceBadge'),
        improvementMsg: document.getElementById('improvementMsg'),
        streakCounter: document.getElementById('streakCounter'),
        motivationalQuote: document.getElementById('motivationalQuote'),
        barTraining: document.getElementById('barTraining'),
        barStandard: document.getElementById('barStandard'),
        barDaily: document.getElementById('barDaily'),
        barAction: document.getElementById('barAction'),
        barKaizen: document.getElementById('barKaizen'),
        barWaste: document.getElementById('barWaste'),
        valTraining: document.getElementById('valTraining'),
        valStandard: document.getElementById('valStandard'),
        valDaily: document.getElementById('valDaily'),
        valAction: document.getElementById('valAction'),
        valKaizen: document.getElementById('valKaizen'),
        valWaste: document.getElementById('valWaste'),
        suggestionsList: document.getElementById('suggestionsList'),
        suggestionsCard: document.getElementById('suggestionsCard'),
        trendCanvas: document.getElementById('trendCanvas'),
        trendTitle: document.getElementById('trendTitle'),
        historyTitle: document.getElementById('historyTitle'),
        historyList: document.getElementById('historyList'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        confettiCanvas: document.getElementById('confettiCanvas'),
        particles: document.getElementById('particles'),
        normalModeBtn: document.getElementById('normalModeBtn'),
        compactModeBtn: document.getElementById('compactModeBtn'),
        dailyBtn: document.getElementById('dailyBtn'),
        weeklyBtn: document.getElementById('weeklyBtn'),
        entryTitle: document.getElementById('entryTitle'),
        entryDate: document.getElementById('entryDate'),
        downtimeHelpBtn: document.getElementById('downtimeHelpBtn'),
        downtimeModal: document.getElementById('downtimeModal'),
        modalClose: document.getElementById('modalClose')
    };

    loadPrefs();
    initParticles();
    syncSliders();
    loadHistory();
    updateDateLabel();

    els.calculateBtn.addEventListener('click', calculate);
    els.clearHistoryBtn.addEventListener('click', clearHistory);
    els.normalModeBtn.addEventListener('click', () => setViewMode('normal'));
    els.compactModeBtn.addEventListener('click', () => setViewMode('compact'));
    els.dailyBtn.addEventListener('click', () => setTrackingMode('daily'));
    els.weeklyBtn.addEventListener('click', () => setTrackingMode('weekly'));
    els.downtimeHelpBtn.addEventListener('click', openModal);
    els.modalClose.addEventListener('click', closeModal);
    els.downtimeModal.addEventListener('click', (e) => {
        if (e.target === els.downtimeModal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    function loadPrefs() {
        try {
            const prefs = JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
            if (prefs.trackingMode) setTrackingMode(prefs.trackingMode);
            if (prefs.viewMode) setViewMode(prefs.viewMode);
            if (prefs.target) els.targetScore.value = prefs.target;
        } catch {}
    }

    function savePrefs() {
        localStorage.setItem(PREFS_KEY, JSON.stringify({
            trackingMode,
            viewMode,
            target: els.targetScore.value
        }));
    }

    function setViewMode(mode) {
        viewMode = mode;
        if (mode === 'compact') {
            document.body.classList.add('compact');
            els.compactModeBtn.classList.add('active');
            els.normalModeBtn.classList.remove('active');
        } else {
            document.body.classList.remove('compact');
            els.normalModeBtn.classList.add('active');
            els.compactModeBtn.classList.remove('active');
        }
        savePrefs();
    }

    function setTrackingMode(mode) {
        trackingMode = mode;
        if (mode === 'daily') {
            els.dailyBtn.classList.add('active');
            els.weeklyBtn.classList.remove('active');
            els.entryTitle.textContent = 'Daily Entry';
            els.trendTitle.textContent = '📈 7-Day Trend';
            els.historyTitle.textContent = '📅 Daily History';
            els.trainingSlider.max = '2';
            els.trainingHours.max = '2';
            document.querySelectorAll('.max-training').forEach(el => el.textContent = '2');
            document.querySelectorAll('.freq-label').forEach(el => el.textContent = 'today');
            document.querySelectorAll('.kaizen-target').forEach(el => el.textContent = '1+ idea/day');
        } else {
            els.weeklyBtn.classList.add('active');
            els.dailyBtn.classList.remove('active');
            els.entryTitle.textContent = 'Weekly Entry';
            els.trendTitle.textContent = '📈 4-Week Trend';
            els.historyTitle.textContent = '📅 Weekly History';
            els.trainingSlider.max = '10';
            els.trainingHours.max = '10';
            document.querySelectorAll('.max-training').forEach(el => el.textContent = '10');
            document.querySelectorAll('.freq-label').forEach(el => el.textContent = 'this week');
            document.querySelectorAll('.kaizen-target').forEach(el => el.textContent = '2+ ideas/week');
        }
        updateDateLabel();
        renderHistory();
        savePrefs();
    }

    function updateDateLabel() {
        const now = new Date();
        if (trackingMode === 'daily') {
            els.entryDate.textContent = now.toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric'
            });
        } else {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            els.entryDate.textContent = 'Week of ' + weekStart.toLocaleDateString('en-US', {
                month: 'short', day: 'numeric'
            });
        }
    }

    function openModal() {
        els.downtimeModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        els.downtimeModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function initParticles() {
        const colors = ['#a5d6a7', '#81c784', '#66bb6a', '#c8e6c9', '#b9f6ca'];
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 12 + 6;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
            particle.style.animationDelay = (Math.random() * 10) + 's';
            els.particles.appendChild(particle);
        }
    }

    function syncSliders() {
        linkSlider(els.trainingHours, els.trainingSlider);
        linkSlider(els.standardWork, els.standardWorkSlider);
        linkSlider(els.dailyManagement, els.dailyManagementSlider);
        linkSlider(els.fiveSScore, els.fiveSSlider);
    }

    function linkSlider(input, slider) {
        input.addEventListener('input', () => {
            slider.value = input.value || 0;
        });
        slider.addEventListener('input', () => {
            input.value = slider.value;
        });
    }

    function getStorageKey() {
        return trackingMode === 'daily' ? STORAGE_KEY_DAILY : STORAGE_KEY_WEEKLY;
    }

    function getMaxTraining() {
        return trackingMode === 'daily' ? 2 : 10;
    }

    function calculate() {
        const maxTraining = getMaxTraining();
        const trainingHours = clamp(parseFloat(els.trainingHours.value) || 0, 0, maxTraining);
        const standardWork = clamp(parseFloat(els.standardWork.value) || 0, 0, 100);
        const dailyManagement = clamp(parseFloat(els.dailyManagement.value) || 0, 0, 100);
        const totalActions = Math.max(parseInt(els.totalActions.value) || 0, 0);
        const closedActions = Math.max(parseInt(els.closedActions.value) || 0, 0);
        const kaizenSubmitted = Math.max(parseInt(els.kaizenSubmitted.value) || 0, 0);
        const kaizenImplemented = Math.max(parseInt(els.kaizenImplemented.value) || 0, 0);
        const fiveSScore = clamp(parseFloat(els.fiveSScore.value) || 0, 0, 100);

        if (totalActions === 0) {
            els.actionMessage.classList.remove('hidden');
        } else {
            els.actionMessage.classList.add('hidden');
        }

        const trainingScore = (trainingHours / maxTraining) * 100;
        const actionClosure = totalActions === 0 ? 0 : (closedActions / totalActions) * 100;

        const kaizenTarget = trackingMode === 'daily' ? 1 : 2;
        const kaizenBaseScore = Math.min((kaizenSubmitted / kaizenTarget) * 100, 100);
        const kaizenImplBonus = kaizenSubmitted > 0
            ? (kaizenImplemented / kaizenSubmitted) * 30
            : 0;
        const kaizenScore = Math.min(kaizenBaseScore + kaizenImplBonus, 100);

        const wasteCheckboxes = [
            els.wasteDefects, els.wasteOverproduction, els.wasteWaiting,
            els.wasteNonUtilized, els.wasteTransport, els.wasteInventory,
            els.wasteMotion, els.wasteExtraProcessing
        ];
        const wastesIdentified = wasteCheckboxes.filter(cb => cb.checked).length;
        const timwoodsAwareness = (wastesIdentified / 8) * 100;
        const wasteScore = (timwoodsAwareness * 0.40) + (fiveSScore * 0.60);

        const leanScore =
            (trainingScore * 0.15) +
            (standardWork * 0.15) +
            (dailyManagement * 0.15) +
            (actionClosure * 0.25) +
            (kaizenScore * 0.15) +
            (wasteScore * 0.15);

        const finalScore = Math.round(Math.min(leanScore, 100) * 10) / 10;

        displayResults(finalScore, trainingScore, standardWork, dailyManagement, actionClosure, kaizenScore, wasteScore);
        saveEntry(finalScore, trainingScore, standardWork, dailyManagement, actionClosure, kaizenScore, wasteScore);
        drawTrend();
        renderHistory();

        if (finalScore >= 85) {
            launchConfetti();
        }
    }

    function displayResults(score, training, standard, daily, action, kaizen, waste) {
        els.resultsSection.classList.remove('hidden');

        setTimeout(() => {
            els.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        animateScore(score);
        setGauge(score);
        setPerformanceBadge(score);
        showImprovement(score);
        showStreak(score);
        showMotivationalQuote(score);
        animateBars(training, standard, daily, action, kaizen, waste);
        generateSuggestions(training, standard, daily, action, kaizen, waste, score);
    }

    function animateScore(target) {
        const duration = 1200;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target * 10) / 10;
            els.scoreValue.textContent = current.toFixed(1);

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    }

    function setGauge(score) {
        const circumference = 2 * Math.PI * 85;
        const offset = circumference - (score / 100) * circumference;
        els.gaugeFill.style.strokeDashoffset = offset;

        if (score >= 85) els.gaugeFill.style.stroke = '#2e7d32';
        else if (score >= 70) els.gaugeFill.style.stroke = '#558b2f';
        else if (score >= 50) els.gaugeFill.style.stroke = '#f57f17';
        else els.gaugeFill.style.stroke = '#c62828';

        const gaugeContainer = els.gaugeFill.closest('.gauge-container');
        if (score >= 85) {
            gaugeContainer.classList.add('pulse');
        } else {
            gaugeContainer.classList.remove('pulse');
        }

        const target = parseFloat(els.targetScore.value) || 85;
        const targetOffset = circumference - (target / 100) * circumference;
        els.gaugeTarget.style.strokeDasharray = `2 ${circumference - 2}`;
        els.gaugeTarget.style.strokeDashoffset = targetOffset;
    }

    function setPerformanceBadge(score) {
        const badge = els.performanceBadge;
        badge.className = 'performance-badge';

        let icon, text, level;
        if (score >= 85) {
            icon = '🏆'; text = 'Excellent — Lean Champion'; level = 'excellent';
        } else if (score >= 70) {
            icon = '👍'; text = 'Good — Keep Improving'; level = 'good';
        } else if (score >= 50) {
            icon = '⚠️'; text = 'Needs Focus'; level = 'focus';
        } else {
            icon = '🚨'; text = 'At Risk'; level = 'risk';
        }

        badge.classList.add(level);
        badge.querySelector('.badge-icon').textContent = icon;
        badge.querySelector('.badge-text').textContent = text;
    }

    function showImprovement(score) {
        const history = getHistory();
        if (history.length < 2) {
            els.improvementMsg.classList.add('hidden');
            return;
        }

        const prevScore = history[history.length - 2].score;
        const diff = (score - prevScore).toFixed(1);
        const period = trackingMode === 'daily' ? 'yesterday' : 'last week';

        if (diff > 0) {
            els.improvementMsg.textContent = `🎉 You improved by +${diff}% from ${period}!`;
            els.improvementMsg.style.background = '#e8f5e9';
            els.improvementMsg.style.color = '#2e7d32';
        } else if (diff < 0) {
            els.improvementMsg.textContent = `📉 Down ${diff}% from ${period}. Let's refocus!`;
            els.improvementMsg.style.background = '#fff3e0';
            els.improvementMsg.style.color = '#e65100';
        } else {
            els.improvementMsg.textContent = `➡️ Same score as ${period}. Push for growth!`;
            els.improvementMsg.style.background = '#e3f2fd';
            els.improvementMsg.style.color = '#1565c0';
        }

        els.improvementMsg.classList.remove('hidden');
    }

    function showStreak(score) {
        const history = getHistory();
        const target = parseFloat(els.targetScore.value) || 85;

        let streak = 0;
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].score >= target) streak++;
            else break;
        }

        const unit = trackingMode === 'daily' ? 'day' : 'week';
        if (streak >= 2) {
            els.streakCounter.textContent = `🔥 ${streak}-${unit} streak above ${target}%!`;
            els.streakCounter.classList.remove('hidden');
        } else {
            els.streakCounter.classList.add('hidden');
        }
    }

    function showMotivationalQuote(score) {
        const quotes = {
            excellent: [
                '"Excellence is not a destination but a continuous journey." — Brian Tracy',
                '"The secret of getting ahead is getting started, and staying consistent." — Mark Twain',
                '"Champions keep playing until they get it right." — Billie Jean King'
            ],
            good: [
                '"Good is the enemy of great. Keep pushing." — Jim Collins',
                '"Progress, not perfection, is what we should be asking of ourselves." — Julia Cameron',
                '"Small daily improvements over time lead to stunning results." — Robin Sharma'
            ],
            focus: [
                '"Discipline is the bridge between goals and accomplishment." — Jim Rohn',
                '"It does not matter how slowly you go as long as you do not stop." — Confucius',
                '"Focus on being productive instead of busy." — Tim Ferriss'
            ],
            risk: [
                '"Every master was once a disaster. Start where you are." — Robin Sharma',
                '"The only way to do great work is to love what you do." — Steve Jobs',
                '"Fall seven times, stand up eight." — Japanese Proverb'
            ]
        };

        let tier;
        if (score >= 85) tier = 'excellent';
        else if (score >= 70) tier = 'good';
        else if (score >= 50) tier = 'focus';
        else tier = 'risk';

        const pool = quotes[tier];
        const quote = pool[Math.floor(Math.random() * pool.length)];
        els.motivationalQuote.textContent = quote;
    }

    function animateBars(training, standard, daily, action, kaizen, waste) {
        setTimeout(() => {
            setBars(els.barTraining, training, els.valTraining, 'training');
            setBars(els.barStandard, standard, els.valStandard, 'standard');
            setBars(els.barDaily, daily, els.valDaily, 'daily');
            setBars(els.barAction, action, els.valAction, 'action');
            setBars(els.barKaizen, kaizen, els.valKaizen, 'kaizen');
            setBars(els.barWaste, waste, els.valWaste, 'waste');
        }, 200);
    }

    function setBars(barEl, value, valEl, className) {
        barEl.className = `bar-fill ${className}`;
        barEl.style.width = `${Math.min(value, 100)}%`;
        valEl.textContent = `${Math.round(value)}%`;
    }

    function generateSuggestions(training, standard, daily, action, kaizen, waste, overall) {
        const suggestions = [];

        if (training < 50) {
            suggestions.push({
                type: 'warning',
                icon: '📚',
                text: trackingMode === 'daily'
                    ? 'Dedicate at least 1 hour today to Lean learning — watch a video, read an article, or practice a tool.'
                    : 'Increase your Lean learning time — target 5–7 hours per week to build strong fundamentals.'
            });
        }

        if (standard < 70) {
            suggestions.push({
                type: 'warning',
                icon: '📋',
                text: 'Improve adherence to your Standard Work — focus on consistency and following documented processes.'
            });
        }

        if (daily < 70) {
            suggestions.push({
                type: 'warning',
                icon: '📊',
                text: 'Be more disciplined in daily standups and KPI updates — show up, speak up, follow up.'
            });
        }

        if (action < 60) {
            suggestions.push({
                type: 'warning',
                icon: '✅',
                text: 'Focus on closing actions, not just identifying problems. Execution is the key differentiator.'
            });
        }

        if (kaizen < 50) {
            suggestions.push({
                type: 'warning',
                icon: '💡',
                text: trackingMode === 'daily'
                    ? 'Submit at least 1 improvement idea today. Look at your current task — what small irritant can you fix?'
                    : 'Submit at least 2 improvement ideas per week. Look for small irritants in your daily work — each one is a Kaizen opportunity.'
            });
        }

        if (waste < 50) {
            suggestions.push({
                type: 'warning',
                icon: '🧹',
                text: 'Sharpen your waste-spotting skills. Use DOWNTIME daily — ask "What am I waiting for? What am I doing twice?" and maintain 5S discipline.'
            });
        }

        if (overall < 70) {
            suggestions.push({
                type: 'warning',
                icon: '🎯',
                text: 'Focus on execution discipline across all areas to improve your overall Lean maturity.'
            });
        }

        if (suggestions.length === 0) {
            suggestions.push({
                type: 'success',
                icon: '🌟',
                text: 'Outstanding performance! You\'re demonstrating strong Lean discipline across all dimensions. Keep setting the standard!'
            });
        }

        els.suggestionsList.innerHTML = suggestions.map((s, i) =>
            `<div class="suggestion-item ${s.type}" style="animation-delay: ${i * 0.1}s">
                <span class="suggestion-icon">${s.icon}</span>
                <span>${s.text}</span>
            </div>`
        ).join('');
    }

    function drawTrend() {
        const canvas = els.trendCanvas;
        const ctx = canvas.getContext('2d');
        const maxEntries = trackingMode === 'daily' ? 7 : 4;
        const history = getHistory().slice(-maxEntries);
        const target = parseFloat(els.targetScore.value) || 85;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;
        const padding = { top: 20, right: 30, bottom: 40, left: 40 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;

        ctx.clearRect(0, 0, w, h);

        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(w - padding.right, y);
            ctx.stroke();

            ctx.fillStyle = '#9e9e9e';
            ctx.font = '11px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(`${100 - i * 25}%`, padding.left - 8, y + 4);
        }

        ctx.strokeStyle = '#ef5350';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        const targetY = padding.top + chartH * (1 - target / 100);
        ctx.beginPath();
        ctx.moveTo(padding.left, targetY);
        ctx.lineTo(w - padding.right, targetY);
        ctx.stroke();
        ctx.setLineDash([]);

        if (history.length < 2) {
            ctx.fillStyle = '#9e9e9e';
            ctx.font = '13px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Add more entries to see your trend', w / 2, h / 2);
            return;
        }

        const points = history.map((entry, i) => ({
            x: padding.left + (chartW / (history.length - 1)) * i,
            y: padding.top + chartH * (1 - entry.score / 100)
        }));

        const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
        gradient.addColorStop(0, 'rgba(76, 175, 80, 0.3)');
        gradient.addColorStop(1, 'rgba(76, 175, 80, 0)');

        ctx.beginPath();
        ctx.moveTo(points[0].x, h - padding.bottom);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, h - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        points.forEach((p, i) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = '#4caf50';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.fillStyle = '#333';
            ctx.font = 'bold 11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${history[i].score}%`, p.x, p.y - 12);

            ctx.fillStyle = '#9e9e9e';
            ctx.font = '10px Inter';
            const label = trackingMode === 'daily'
                ? history[i].date.split(',')[0]
                : `Wk ${i + 1}`;
            ctx.fillText(label, p.x, h - padding.bottom + 18);
        });
    }

    function launchConfetti() {
        const canvas = els.confettiCanvas;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#4caf50', '#81c784', '#ffeb3b', '#ff9800', '#e91e63', '#2196f3', '#9c27b0'];

        for (let i = 0; i < 120; i++) {
            particles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 200,
                y: canvas.height / 2 - 100,
                vx: (Math.random() - 0.5) * 16,
                vy: Math.random() * -14 - 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 12,
                gravity: 0.4,
                opacity: 1,
                shape: Math.random() > 0.5 ? 'rect' : 'circle'
            });
        }

        let frame = 0;
        const maxFrames = 150;

        function animate() {
            if (frame >= maxFrames) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.vx;
                p.vy += p.gravity;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
                p.opacity = Math.max(0, 1 - (frame / maxFrames));

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = p.color;

                if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            });

            frame++;
            requestAnimationFrame(animate);
        }

        animate();
    }

    function saveEntry(score, training, standard, daily, action, kaizen, waste) {
        const history = getHistory();
        const now = new Date();
        const entry = {
            date: now.toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
            }),
            timestamp: now.toISOString(),
            score: Math.round(score * 10) / 10,
            training: Math.round(training),
            standard: Math.round(standard),
            daily: Math.round(daily),
            action: Math.round(action),
            kaizen: Math.round(kaizen),
            waste: Math.round(waste)
        };

        history.push(entry);
        localStorage.setItem(getStorageKey(), JSON.stringify(history));
    }

    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem(getStorageKey())) || [];
        } catch {
            return [];
        }
    }

    function loadHistory() {
        renderHistory();
    }

    function renderHistory() {
        const history = getHistory();

        if (history.length === 0) {
            els.historyList.innerHTML = '<p class="no-history">No history yet. Start tracking your Lean journey!</p>';
            els.clearHistoryBtn.classList.add('hidden');
            return;
        }

        els.clearHistoryBtn.classList.remove('hidden');
        els.historyList.innerHTML = history.slice().reverse().map(entry =>
            `<div class="history-entry">
                <span class="history-date">${entry.date}</span>
                <span class="history-score">${entry.score}%</span>
            </div>`
        ).join('');
    }

    function clearHistory() {
        if (confirm('Clear all history? This cannot be undone.')) {
            localStorage.removeItem(getStorageKey());
            renderHistory();
            drawTrend();
        }
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
});
