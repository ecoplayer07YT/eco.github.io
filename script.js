document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('typing-output');
    const inputContainer = document.getElementById('input-line-container');
    const commandInput = document.getElementById('command-input');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');

    let isAudioOn = false;
    let audioCtx, oscillator, gainNode;

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

    // --- 2. Typing Engine ---
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
                output.scrollTop = output.scrollHeight;
                setTimeout(type, 12);
            } else {
                inputContainer.style.display = 'flex';
                commandInput.focus();
                startCountdown(); // Starts the Birthday countdown
            }
        }
        type();
    }

    // --- 3. Command Map ---
    const commands = {
        'HELP': () => `Commands: STATUS, ATC, FUEL, DESTINATION, HISTORY, CLEAR, THEME`,
        'STATUS': "[OK] APU: ON | GEAR: DOWN | HYDRAULICS: NORM",
        'ATC': () => "RESPONSE: Cleared to land Runway 22L.",
        'THEME': () => {
            const themes = ['theme-green', 'theme-amber', 'theme-white'];
            let current = themes.find(t => document.body.classList.contains(t)) || 'theme-green';
            document.body.classList.replace(current, themes[(themes.indexOf(current)+1)%3]);
            return "Display Mode Cycled.";
        },
        'CLEAR': () => { output.innerHTML = ""; return "[System Wiped]"; }
    };

    // --- 4. Event Listeners ---
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
            output.scrollTop = output.scrollHeight;
        }
    });

    // --- 5. Utilities & Birthday Logic ---
    function startCountdown() {
        // SET YOUR BIRTHDAY HERE (Month is 0-indexed, so June is 5)
        const currentYear = new Date().getFullYear();
        let birthday = new Date(currentYear, 5, 6); // June 6th

        // If birthday already passed this year, set to next year
        if (new Date() > birthday) {
            birthday = new Date(currentYear + 1, 5, 6);
        }

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
