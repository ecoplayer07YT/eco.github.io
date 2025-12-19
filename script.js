// --- 1. CORE SYSTEM INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Select all necessary elements
    const enterBtn = document.getElementById('enter-btn');
    const landingPage = document.getElementById('landing-page');
    const terminalContainer = document.querySelector('.terminal-container');
    const output = document.getElementById('typing-output');
    const inputContainer = document.getElementById('input-line-container');
    const commandInput = document.getElementById('command-input');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const wrapper = document.getElementById('terminal-content-wrapper');

    // --- 2. THE INITIALIZE BUTTON FIX ---
    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            console.log("Avionics Initializing..."); // Debug check
            landingPage.style.display = 'none';
            terminalContainer.style.display = 'flex';
            
            // Start audio and boot
            startAvionicsHum();
            isAudioOn = true;
            bootSystem();
        });
    }

    // --- 3. AUDIO ENGINE ---
    let isAudioOn = false;
    let audioCtx, oscillator, gainNode;

    function playClick() {
        if (!audioCtx || !isAudioOn) return;
        const clickOsc = audioCtx.createOscillator();
        const clickGain = audioCtx.createGain();
        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(150 + Math.random() * 60, audioCtx.currentTime);
        clickGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.03);
        clickOsc.connect(clickGain);
        clickGain.connect(audioCtx.destination);
        clickOsc.start();
        clickOsc.stop(audioCtx.currentTime + 0.03);
    }

    function startAvionicsHum() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(55, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
    }

    // --- 4. THEME & UI LOGIC ---
    window.setTheme = function(themeName) {
        const themes = ['theme-green', 'theme-amber', 'theme-white', 'theme-red', 'theme-blue'];
        document.body.classList.remove(...themes);
        document.body.classList.add(themeName);
        playClick();
    };

    function bootSystem() {
        progressContainer.style.display = 'block';
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) { 
                clearInterval(interval); 
                progressContainer.style.display = 'none'; 
                // Ensure terminalContent exists in terminal-content.js
                if (typeof terminalContent !== 'undefined') {
                    typeWriter(terminalContent.trim()); 
                } else {
                    typeWriter("ERROR: TERMINAL CONTENT NOT FOUND.");
                }
            } else { 
                width++; 
                progressBar.style.width = width + '%'; 
            }
        }, 15);
    }

    // --- 5. TYPING & COMMANDS ---
    function typeWriter(text) {
        let i = 0;
        output.innerHTML = "";
        function type() {
            if (i < text.length) {
                if (text.charAt(i) === '<') {
                    let tagEnd = text.indexOf('>', i);
                    let tag = text.substring(i, tagEnd + 1);
                    output.innerHTML += tag;
                    i = tagEnd + 1;
                } else {
                    output.innerHTML += text.charAt(i);
                    playClick();
                    i++;
                }
                wrapper.scrollTop = wrapper.scrollHeight;
                setTimeout(type, 12);
            } else {
                inputContainer.style.display = 'flex';
                commandInput.focus();
                startCountdown();
            }
        }
        type();
    }

    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const rawInput = commandInput.value.trim();
            const cmd = rawInput.toUpperCase();
            output.innerHTML += `\n<span style="color:var(--accent)">PILOT@ECOVERSE > ${rawInput}</span>\n`;
            
            const commands = {
                'HELP': "Commands: STATUS, ATC, FUEL, CLEAR, THEME",
                'STATUS': "[OK] APU: ON | GEAR: DOWN | HYDRAULICS: NORM",
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

    // --- 6. UTILITIES (Clock & Countdown) ---
    function startCountdown() {
        const currentYear = new Date().getFullYear();
        let birthday = new Date(currentYear, 5, 6);
        if (new Date() > birthday) birthday = new Date(currentYear + 1, 5, 6);

        setInterval(() => {
            const el = document.getElementById('countdown-display-terminal');
            if(!el) return;
            const dist = birthday.getTime() - new Date().getTime();
            const d = Math.floor(dist / (1000 * 60 * 60 * 24));
            const h = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            el.innerHTML = `<span class="terminal-value">${d}d ${h}h remaining</span>`;
        }, 1000);
    }

    setInterval(() => {
        const now = new Date();
        document.getElementById('live-clock').innerText = now.toISOString().split('T')[1].split('.')[0] + 'Z';
    }, 1000);
});
