document.addEventListener('DOMContentLoaded', () => {
    const enterBtn = document.getElementById('enter-btn');
    const landingPage = document.getElementById('landing-page');
    const terminalContainer = document.querySelector('.terminal-container');
    const output = document.getElementById('typing-output');
    const inputContainer = document.getElementById('input-line-container');
    const commandInput = document.getElementById('command-input');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const wrapper = document.getElementById('terminal-content-wrapper');

    let isAudioOn = false;
    let audioCtx, oscillator, gainNode;
    let rollAngle = 0;

    // --- 1. INITIALIZE ---
    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            landingPage.style.display = 'none';
            terminalContainer.style.display = 'flex';
            startAvionicsHum();
            isAudioOn = true;
            bootSystem();
        });
    }

    // --- 2. THEME SWITCHER ---
    window.setTheme = function(themeName) {
        const themes = ['theme-green', 'theme-amber', 'theme-white', 'theme-red', 'theme-blue'];
        document.body.classList.remove(...themes);
        document.body.classList.add(themeName);
        if(isAudioOn) playClick();
    };

    // --- 3. TYPING ENGINE (COLOR ENABLED) ---
    function typeWriter(text) {
        let i = 0;
        output.innerHTML = "";
        function type() {
            if (i < text.length) {
                if (text.charAt(i) === '<') {
                    let tagEnd = text.indexOf('>', i);
                    output.innerHTML += text.substring(i, tagEnd + 1);
                    i = tagEnd + 1;
                    type(); // Move to next char immediately
                } else {
                    output.innerHTML += text.charAt(i);
                    if (isAudioOn) playClick();
                    i++;
                    wrapper.scrollTop = wrapper.scrollHeight;
                    setTimeout(type, 15);
                }
            } else {
                inputContainer.style.display = 'flex';
                commandInput.focus();
                startCountdown();
            }
        }
        type();
    }

    // --- 4. COMMANDS ---
    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const rawInput = commandInput.value.trim();
            const cmd = rawInput.toUpperCase();
            output.innerHTML += `\n<span style="color:var(--accent)">PILOT@ECOVERSE > ${rawInput}</span>\n`;
            
            const commands = {
                'HELP': "<span class='text-accent'>STATUS, ATC, FUEL, THEME, CLEAR</span>",
                'STATUS': "<span class='text-success'>[OK]</span> ALL SYSTEMS NORM",
                'ATC': "<span class='text-accent'>TOWER:</span> Ecoverse 01, runway 22L clear.",
                'FUEL': () => `<span class='text-white'>FUEL:</span> ${Math.floor(Math.random()*15+75)}%`,
                'THEME': () => { setTheme('theme-amber'); return "Theme reset to Amber."; },
                'CLEAR': () => { output.innerHTML = ""; return "[System Wiped]"; }
            };

            if (commands[cmd]) {
                output.innerHTML += (typeof commands[cmd] === 'function' ? commands[cmd]() : commands[cmd]) + "\n";
            } else if (cmd !== "") {
                output.innerHTML += "Unknown Command.\n";
            }
            commandInput.value = "";
            wrapper.scrollTop = wrapper.scrollHeight;
        }
    });

    // --- 5. UTILS (Flight, Audio, Clock) ---
    window.addEventListener('keydown', (e) => {
        const horizon = document.getElementById('horizon-instrument');
        const warn = document.getElementById('master-warning-overlay');
        if(e.key === "ArrowLeft") rollAngle -= 5;
        if(e.key === "ArrowRight") rollAngle += 5;
        if(e.key === "ArrowUp") rollAngle = 0;
        if(horizon) {
            horizon.style.transform = `rotate(${rollAngle}deg)`;
            warn.style.display = Math.abs(rollAngle) > 30 ? 'block' : 'none';
        }
    });

    function playClick() {
        if (!audioCtx) return;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'square'; o.frequency.setValueAtTime(200, audioCtx.currentTime);
        g.gain.setValueAtTime(0.01, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.03);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(); o.stop(audioCtx.currentTime + 0.03);
    }

    function startAvionicsHum() {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();
        oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(55, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
        oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
        oscillator.start();
    }

    function bootSystem() {
        progressContainer.style.display = 'block';
        let w = 0;
        const t = setInterval(() => {
            if (w >= 100) { clearInterval(t); progressContainer.style.display = 'none'; typeWriter(terminalContent.trim()); }
            else { w++; progressBar.style.width = w + '%'; }
        }, 15);
    }

    function startCountdown() {
        setInterval(() => {
            const el = document.getElementById('countdown-display-terminal');
            const target = new Date(new Date().getFullYear(), 5, 6);
            if (new Date() > target) target.setFullYear(target.getFullYear() + 1);
            const dist = target - new Date();
            const d = Math.floor(dist / 86400000);
            const h = Math.floor((dist % 86400000) / 3600000);
            if(el) el.innerHTML = `${d}d ${h}h to Birthday`;
        }, 1000);
    }

    setInterval(() => {
        document.getElementById('live-clock').innerText = new Date().toISOString().split('T')[1].split('.')[0] + 'Z';
    }, 1000);
});
