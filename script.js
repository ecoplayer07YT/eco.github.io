import * as THREE from 'three'; // If you're not using Three.js anymore, you can remove this line.

document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('typing-output');
    const inputContainer = document.getElementById('input-line-container');
    const commandInput = document.getElementById('command-input');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const wrapper = document.getElementById('terminal-content-wrapper');

    let isAudioOn = false;
    let audioCtx, oscillator, gainNode;
    let rollAngle = 0;

    // --- 1. Audio Engine ---
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

    // --- 2. Theme Switcher Logic ---
    window.setTheme = function(themeName) {
        const themes = ['theme-green', 'theme-amber', 'theme-white', 'theme-red', 'theme-blue'];
        document.body.classList.remove(...themes);
        document.body.classList.add(themeName);
        playClick();
    };

    // --- 3. Typing Engine (With Auto-Scroll) ---
    function typeWriter(text) {
        let i = 0;
        output.innerHTML = "";
        function type() {
            if (i < text.length) {
                if (text.charAt(i) === '<') {
                    let tagEnd = text.indexOf('>', i);
                    let tag = text.substring(i, tagEnd + 1);
                    output.innerHTML += tag;
                    if (tag.includes('id="countdown-display-terminal"')) i = text.indexOf('</span>', i);
                    else i = tagEnd + 1;
                } else {
                    output.innerHTML += text.charAt(i);
                    playClick();
                    i++;
                }
                wrapper.scrollTop = wrapper.scrollHeight; // Auto-scroll
                setTimeout(type, 12);
            } else {
                inputContainer.style.display = 'flex';
                commandInput.focus();
                startCountdown();
            }
        }
        type();
    }

    // --- 4. Interactive Cockpit Controls ---
    // Checklist interaction
    document.querySelectorAll('.check-item').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('done');
            playClick();
        });
    });

    // Annunciator Buttons
    document.querySelectorAll('.sys-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            playClick();
        });
    });

    // Horizon Movement (Arrows)
    window.addEventListener('keydown', (e) => {
        const horizon = document.getElementById('horizon-instrument');
        const warnOverlay = document.getElementById('master-warning-overlay');
        const rollStatus = document.getElementById('bank-status');

        if(e.key === "ArrowLeft") rollAngle -= 5;
        if(e.key === "ArrowRight") rollAngle += 5;
        if(e.key === "ArrowUp" || e.key === "ArrowDown") rollAngle = 0; // Level off

        horizon.style.transform = `rotate(${rollAngle}deg)`;
        rollStatus.innerText = `ROLL: ${rollAngle}°`;

        // Bank Angle Warning Logic
        if (Math.abs(rollAngle) > 35) {
            warnOverlay.style.display = 'block';
        } else {
            warnOverlay.style.display = 'none';
        }
    });

    // --- 5. Command Map ---
    const commands = {
        'HELP': () => `Commands: STATUS, ATC, FUEL, DESTINATION, HISTORY, CLEAR, THEME`,
        'STATUS': "[OK] APU: ON | GEAR: DOWN | HYDRAULICS: NORM",
        'ATC': () => "RESPONSE: Cleared to land Runway 22L.",
        'THEME': () => {
            const themes = ['theme-green', 'theme-amber', 'theme-white', 'theme-blue'];
            let current = themes.find(t => document.body.classList.contains(t)) || 'theme-green';
            let next = themes[(themes.indexOf(current) + 1) % themes.length];
            setTheme(next);
            return `Display switched to ${next.replace('theme-', '')}.`;
        },
        'CLEAR': () => { output.innerHTML = ""; return "[System Wiped]"; }
    };

    // --- 6. Event Listeners ---
    document.getElementById('enter-btn').addEventListener('click', () => {
        document.getElementById('landing-page').style.display = 'none';
        document.querySelector('.terminal-container').style.display = 'flex';
        startAvionicsHum();
        isAudioOn = true;
        bootSystem();
    });

    function bootSystem() {
        progressContainer.style.display = 'block';
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) { 
                clearInterval(interval); 
                progressContainer.style.display = 'none'; 
                typeWriter(terminalContent.trim()); 
            } else { 
                width++; 
                progressBar.style.width = width + '%'; 
            }
        }, 15);
    }

    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const rawInput = commandInput.value.trim();
            const cmd = rawInput.toUpperCase();
            output.innerHTML += `\n<span style="color:var(--accent)">PILOT@ECOVERSE > ${rawInput}</span>\n`;
            if (commands[cmd]) {
                output.innerHTML += (typeof commands[cmd] === 'function' ? commands[cmd]() : commands[cmd]) + "\n";
            } else if (cmd !== "") {
                output.innerHTML += "Unknown Command.\n";
            }
            commandInput.value = "";
            wrapper.scrollTop = wrapper.scrollHeight;
        }
    });

    document.getElementById('sound-toggle').addEventListener('click', (e) => {
        isAudioOn = !isAudioOn;
        e.target.classList.toggle('fa-volume-mute');
        if (isAudioOn && audioCtx.state === 'suspended') audioCtx.resume();
    });

    // --- 7. Utilities & Birthday Logic ---
    function startCountdown() {
        const currentYear = new Date().getFullYear();
        let birthday = new Date(currentYear, 5, 6); // June 6th
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
        document.getElementById('hud-alt-val').innerText = (35000 + Math.floor(Math.random()*15)).toLocaleString();
    }, 1000);
});
