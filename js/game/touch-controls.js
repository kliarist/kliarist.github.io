// Touch controls for mobile devices
window.addEventListener('load', function() {
    const btnUp = document.getElementById('btnUp');
    const btnDown = document.getElementById('btnDown');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const btnAB = document.getElementById('btnAB');
    const btnStart = document.getElementById('btnStart');
    
    function pressKey(key) {
        window.dispatchEvent(new KeyboardEvent('keydown', {key: key}));
    }
    
    // Separate button for each direction
    btnLeft.addEventListener('touchstart', function(e) { e.preventDefault(); pressKey('ArrowLeft'); });
    btnLeft.addEventListener('click', function(e) { e.preventDefault(); pressKey('ArrowLeft'); });
    
    btnRight.addEventListener('touchstart', function(e) { e.preventDefault(); pressKey('ArrowRight'); });
    btnRight.addEventListener('click', function(e) { e.preventDefault(); pressKey('ArrowRight'); });
    
    // DOWN button - hold to repeat like keyboard
    let downInterval = null;
    btnDown.addEventListener('touchstart', function(e) { 
        e.preventDefault(); 
        pressKey('ArrowDown');
        // Repeat while holding
        downInterval = setInterval(function() {
            pressKey('ArrowDown');
        }, 50); // Repeat every 50ms
    });
    btnDown.addEventListener('touchend', function(e) { 
        e.preventDefault(); 
        if(downInterval) {
            clearInterval(downInterval);
            downInterval = null;
        }
    });
    btnDown.addEventListener('click', function(e) { 
        e.preventDefault(); 
        pressKey('ArrowDown'); 
    });
    
    btnUp.addEventListener('touchstart', function(e) { e.preventDefault(); });
    btnUp.addEventListener('click', function(e) { e.preventDefault(); });
    
    // A Button
    btnAB.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = btnAB.getBoundingClientRect();
        if(touch.clientX - rect.left > rect.width/2) pressKey('ArrowUp');
    });
    
    btnAB.addEventListener('click', function(e) {
        const rect = btnAB.getBoundingClientRect();
        if(e.clientX - rect.left > rect.width/2) pressKey('ArrowUp');
    });
    
    // START Button
    btnStart.addEventListener('touchstart', function(e) {
        e.preventDefault();
        pressKey(window.gameStart ? ' ' : 'Enter');
    });
    
    btnStart.addEventListener('click', function(e) {
        pressKey(window.gameStart ? ' ' : 'Enter');
    });
});
