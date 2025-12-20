document.addEventListener('DOMContentLoaded', () => {
    // 1. SELECT ELEMENTS
    const enterBtn = document.getElementById('enter-btn');
    const landingPage = document.getElementById('landing-page');
    const terminalContainer = document.querySelector('.terminal-container');
    const output = document.getElementById('typing-output');
    const wrapper = document.getElementById('terminal-content-wrapper');

    // 2. THE INITIALIZE TRIGGER (The Fix)
    if (enterBtn) {
        enterBtn.onclick = () => {
            console.log("System Initialization Sequence Started...");
            
            // Toggle Visibility
            landingPage.style.setProperty('display', 'none', 'important');
            terminalContainer.style.display = 'flex';
            
            // Start Avionics
            startAvionicsHum();
            bootSystem();
        };
    }
// 1. MAINTENANCE UNLOCK (Press F8)
    window.addEventListener('keydown', (e) => {
        // F8 key code is 119
        if (e.key === "F8" || e.keyCode === 119) {
            e.preventDefault(); // Prevents any default browser behavior
            
            const shield = document.getElementById('maintenance-screen');
            const landingPage = document.getElementById('landing-page');
            
            if (shield) {
                // Add a cool fade-out effect via JS
                shield.style.transition = "opacity 0.5s ease";
                shield.style.opacity = "0";
                
                setTimeout(() => {
                    shield.style.display = 'none';
                    landingPage.style.display = 'flex';
                    console.log("ADMIN AUTHENTICATED: System Unlocked.");
                }, 500);
            }
        }
    });
    // 3. THEME SYSTEM
    window.setTheme = function(themeName) {
        const themes = ['theme-green', 'theme-amber', 'theme-white', 'theme-red', 'theme-blue'];
        document.body.classList.remove(...themes);
        document.body.classList.add(themeName);
    };

    // 4. BOOT SEQUENCE
    function bootSystem() {
        const progressContainer = document.getElementById('progress-container');
        const progressBar = document.getElementById('progress-bar');
        
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

    // 5. TYPING ENGINE (With HTML Tag Support)
    function typeWriter(text) {
        let i = 0;
        output.innerHTML = "";
        function type() {
            if (i < text.length) {
                if (text.charAt(i) === '<') {
                    let tagEnd = text.indexOf('>', i);
                    output.innerHTML += text.substring(i, tagEnd + 1);
                    i = tagEnd + 1;
                    type(); 
                } else {
                    output.innerHTML += text.charAt(i);
                    i++;
                    wrapper.scrollTop = wrapper.scrollHeight;
                    setTimeout(type, 10);
                }
            } else {
                document.getElementById('input-line-container').style.display = 'flex';
                document.getElementById('command-input').focus();
            }
        }
        type();
    }

    // 6. AUDIO & INSTRUMENTS
    let audioCtx;
    function startAvionicsHum() {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(55, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
    }
});
