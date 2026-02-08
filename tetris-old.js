// Game constants
const COLS = 10;
const ROWS = 18;
const BLOCK_SIZE = 16;
const GAME_WIDTH = COLS * BLOCK_SIZE;  // 160px
const WALL_WIDTH = BLOCK_SIZE * 2;  // Side walls
const STATS_WIDTH = 160;
const CANVAS_WIDTH = WALL_WIDTH + GAME_WIDTH + WALL_WIDTH + STATS_WIDTH;  // Walls + game + walls + stats
const CANVAS_HEIGHT = ROWS * BLOCK_SIZE;  // 288px

// Authentic Game Boy colors matching reference repo
const COLORS = {
    darkest: '#404243',   // Darkest - black (64,66,67)
    dark: '#6C7355',      // Dark gray (108,115,85)
    light: '#8B9371',     // Gray (139,147,113)
    lightest: '#C6CFA1'   // White/lightest (198,207,161)
};

// Tetromino shapes
const SHAPES = {
    I: [
        [[0, 0, 0, 0],
         [1, 1, 1, 1],
         [0, 0, 0, 0],
         [0, 0, 0, 0]],
        [[0, 0, 1, 0],
         [0, 0, 1, 0],
         [0, 0, 1, 0],
         [0, 0, 1, 0]]
    ],
    O: [
        [[1, 1],
         [1, 1]]
    ],
    T: [
        [[0, 1, 0],
         [1, 1, 1],
         [0, 0, 0]],
        [[0, 1, 0],
         [0, 1, 1],
         [0, 1, 0]],
        [[0, 0, 0],
         [1, 1, 1],
         [0, 1, 0]],
        [[0, 1, 0],
         [1, 1, 0],
         [0, 1, 0]]
    ],
    S: [
        [[0, 1, 1],
         [1, 1, 0],
         [0, 0, 0]],
        [[0, 1, 0],
         [0, 1, 1],
         [0, 0, 1]]
    ],
    Z: [
        [[1, 1, 0],
         [0, 1, 1],
         [0, 0, 0]],
        [[0, 0, 1],
         [0, 1, 1],
         [0, 1, 0]]
    ],
    J: [
        [[1, 0, 0],
         [1, 1, 1],
         [0, 0, 0]],
        [[0, 1, 1],
         [0, 1, 0],
         [0, 1, 0]],
        [[0, 0, 0],
         [1, 1, 1],
         [0, 0, 1]],
        [[0, 1, 0],
         [0, 1, 0],
         [1, 1, 0]]
    ],
    L: [
        [[0, 0, 1],
         [1, 1, 1],
         [0, 0, 0]],
        [[0, 1, 0],
         [0, 1, 0],
         [0, 1, 1]],
        [[0, 0, 0],
         [1, 1, 1],
         [1, 0, 0]],
        [[1, 1, 0],
         [0, 1, 0],
         [0, 1, 0]]
    ]
};

const SHAPE_NAMES = Object.keys(SHAPES);

// Game state
let canvas, ctx, nextCanvas, nextCtx;
let board = [];
let boardTypes = []; // Track which piece type is in each cell
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let dropInterval = 1000;
let lastDropTime = 0;
let keys = {};
let softDropping = false;
let highScore = 0;
let combo = 0;
let lastClearTime = 0;

// Block images
const blockImages = {};
const wallImage = new Image();
const scoreBoardImage = new Image();
let imagesLoaded = 0;
const totalImages = 9; // 7 blocks + wall + scoreboard

function loadImages() {
    const blocks = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    blocks.forEach(block => {
        blockImages[block] = new Image();
        blockImages[block].src = `assets/${block.toLowerCase()}.png`;
        blockImages[block].onload = () => {
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                console.log('All images loaded');
            }
        };
    });
    
    wallImage.src = 'assets/wall.png';
    wallImage.onload = () => imagesLoaded++;
    
    scoreBoardImage.src = 'assets/score_board.svg';
    scoreBoardImage.onload = () => imagesLoaded++;
}

// Sound effects (using Web Audio API)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = true;

function playTone(freq, duration, type = 'square') {
    if (!soundEnabled) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.value = 0.1;
    
    osc.start(audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
}

const sounds = {
    move: () => playTone(200, 0.05),
    rotate: () => playTone(400, 0.08),
    land: () => playTone(150, 0.1),
    clear: () => {
        playTone(500, 0.1);
        setTimeout(() => playTone(600, 0.1), 100);
        setTimeout(() => playTone(700, 0.15), 200);
    },
    tetris: () => {
        [500, 600, 700, 800].forEach((f, i) => {
            setTimeout(() => playTone(f, 0.15), i * 80);
        });
    },
    gameOver: () => {
        playTone(300, 0.2);
        setTimeout(() => playTone(200, 0.2), 200);
        setTimeout(() => playTone(100, 0.4), 400);
    },
    levelUp: () => {
        [400, 500, 600, 800].forEach((f, i) => {
            setTimeout(() => playTone(f, 0.1, 'sine'), i * 60);
        });
    }
};

// Load high score from localStorage
function loadHighScore() {
    const saved = localStorage.getItem('tetris_highscore');
    if (saved) highScore = parseInt(saved);
}

function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('tetris_highscore', highScore.toString());
    }
}

// Level speed settings (frames per drop, Game Boy runs at ~60fps)
const LEVEL_SPEEDS = {
    0: 53, 1: 49, 2: 45, 3: 41, 4: 37, 5: 33,
    6: 28, 7: 22, 8: 17, 9: 11, 10: 10, 11: 9,
    12: 8, 13: 7, 14: 6, 15: 6, 16: 5, 17: 5,
    18: 4, 19: 4, 20: 3
};

let frameCount = 0;
let dropCounter = 0;

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Load images first
    loadImages();

    // Load high score
    loadHighScore();

    // Initialize board
    for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        boardTypes[r] = [];
        for (let c = 0; c < COLS; c++) {
            board[r][c] = 0; // 0 = empty, 1 = filled
            boardTypes[r][c] = null; // Track piece type
        }
    }

    // Event listeners
    setupControls();
    setupKeyboard();

    // Start game on START button
    document.querySelector('[data-key="start"]').addEventListener('click', toggleGame);
    
    // Sound toggle on SELECT button
    document.querySelector('[data-key="select"]').addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        playTone(soundEnabled ? 600 : 300, 0.1);
        const indicator = document.querySelector('.sound-indicator');
        if (indicator) {
            indicator.textContent = soundEnabled ? '🔊' : '🔇';
        }
    });
    
    // Initialize first pieces
    nextPiece = createPiece();
    
    // Draw initial screen
    draw();
    
    console.log('Game initialized successfully');
}

// Setup touch controls
function setupControls() {
    const buttons = document.querySelectorAll('[data-key]');
    
    buttons.forEach(btn => {
        const key = btn.dataset.key;
        
        // Touch events
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleInput(key, true);
        });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleInput(key, false);
        });

        // Mouse events for desktop
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            handleInput(key, true);
        });
        
        btn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            handleInput(key, false);
        });
    });
}

// Setup keyboard controls
function setupKeyboard() {
    const keyMap = {
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'ArrowDown': 'down',
        'ArrowUp': 'up',
        ' ': 'a',
        'x': 'b',
        'X': 'b',
        'z': 'b',
        'Z': 'b',
        'Enter': 'start',
        'Escape': 'select'
    };

    document.addEventListener('keydown', (e) => {
        const key = keyMap[e.key];
        if (key) {
            e.preventDefault();
            handleInput(key, true);
        }
    });

    document.addEventListener('keyup', (e) => {
        const key = keyMap[e.key];
        if (key) {
            e.preventDefault();
            handleInput(key, false);
        }
    });
}

// Handle input
function handleInput(key, pressed) {
    if (!pressed) {
        keys[key] = false;
        if (key === 'down') {
            softDropping = false;
        }
        return;
    }

    if (keys[key]) return; // Prevent key repeat
    keys[key] = true;

    if (key === 'start') {
        toggleGame();
        return;
    }

    if (!gameRunning || gamePaused || gameOver) return;

    switch (key) {
        case 'left':
            if (movePiece(-1, 0)) sounds.move();
            break;
        case 'right':
            if (movePiece(1, 0)) sounds.move();
            break;
        case 'down':
            hardDrop(); // Down button = instant drop
            break;
        case 'up':
            if (rotatePiece()) sounds.rotate();
            break;
        case 'a':
            if (rotatePiece()) sounds.rotate();
            break;
        case 'b':
            if (rotatePiece()) sounds.rotate();
            break;
    }
}

// Toggle game start/pause
function toggleGame() {
    if (gameOver) {
        resetGame();
        return;
    }

    if (!gameRunning) {
        startGame();
    } else {
        gamePaused = !gamePaused;
        // Show/hide pause overlay
        if (gamePaused) {
            document.getElementById('gamePaused').classList.remove('hidden');
        } else {
            document.getElementById('gamePaused').classList.add('hidden');
        }
    }
}

// Start game
function startGame() {
    console.log('Starting game...');
    gameRunning = true;
    gamePaused = false;
    gameOver = false;
    document.getElementById('gameOver').classList.add('hidden');
    
    // Initialize pieces
    if (!nextPiece) {
        nextPiece = createPiece();
    }
    console.log('Next piece:', nextPiece);
    spawnPiece();
    console.log('Current piece:', currentPiece);
    
    // Reset counters
    frameCount = 0;
    dropCounter = 0;
    
    console.log('Starting game loop...');
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Reset game
function resetGame() {
    board = [];
    for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        for (let c = 0; c < COLS; c++) {
            board[r][c] = 0;
        }
    }
    
    saveHighScore();
    score = 0;
    level = 1;
    lines = 0;
    combo = 0;
    gameOver = false;
    frameCount = 0;
    dropCounter = 0;
    softDropping = false;
    
    updateStats();
    startGame();
}

// Create random piece
function createPiece() {
    const shapeName = SHAPE_NAMES[Math.floor(Math.random() * SHAPE_NAMES.length)];
    return {
        shape: SHAPES[shapeName][0],
        rotations: SHAPES[shapeName],
        rotation: 0,
        x: Math.floor(COLS / 2) - 1,
        y: 0,
        color: shapeName
    };
}

// Spawn new piece
function spawnPiece() {
    currentPiece = nextPiece;
    currentPiece.x = Math.floor(COLS / 2) - 1;
    currentPiece.y = 0;
    nextPiece = createPiece();
    
    if (!isValidMove(currentPiece.x, currentPiece.y, currentPiece.shape)) {
        endGame();
    }
    
    draw();
}

// Move piece
function movePiece(dx, dy) {
    if (!currentPiece) {
        console.error('No current piece!');
        return false;
    }
    if (isValidMove(currentPiece.x + dx, currentPiece.y + dy, currentPiece.shape)) {
        currentPiece.x += dx;
        currentPiece.y += dy;
        return true;
    }
    return false;
}

// Rotate piece (with wall kick attempts)
function rotatePiece() {
    const nextRotation = (currentPiece.rotation + 1) % currentPiece.rotations.length;
    const nextShape = currentPiece.rotations[nextRotation];
    
    // Try original position
    if (isValidMove(currentPiece.x, currentPiece.y, nextShape)) {
        currentPiece.rotation = nextRotation;
        currentPiece.shape = nextShape;
        return true;
    }
    
    // Try wall kicks (Game Boy Tetris style)
    const kicks = [
        { x: -1, y: 0 },  // Left
        { x: 1, y: 0 },   // Right
        { x: -2, y: 0 },  // Left 2
        { x: 2, y: 0 },   // Right 2
    ];
    
    for (let kick of kicks) {
        if (isValidMove(currentPiece.x + kick.x, currentPiece.y + kick.y, nextShape)) {
            currentPiece.x += kick.x;
            currentPiece.y += kick.y;
            currentPiece.rotation = nextRotation;
            currentPiece.shape = nextShape;
            return true;
        }
    }
    return false;
}

// Hard drop
function hardDrop() {
    while (movePiece(0, 1)) {}
    lockPiece();
}

// Check if move is valid
function isValidMove(x, y, shape) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const newX = x + c;
                const newY = y + r;
                
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return false;
                }
                
                if (newY >= 0 && board[newY][newX] !== 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Lock piece to board
function lockPiece() {
    for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c]) {
                const y = currentPiece.y + r;
                const x = currentPiece.x + c;
                if (y >= 0) {
                    board[y][x] = 1; // Mark as filled
                    boardTypes[y][x] = currentPiece.type; // Store piece type
                }
            }
        }
    }
    
    sounds.land();
    softDropping = false; // Reset soft drop when piece locks
    clearLines();
    spawnPiece();
}

// Clear completed lines
function clearLines() {
    let linesCleared = 0;
    let clearedRows = [];
    
    // Find completed lines
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            clearedRows.push(r);
            linesCleared++;
        }
    }
    
    if (linesCleared > 0) {
        // Flash effect for cleared lines
        clearedRows.forEach(row => {
            for (let c = 0; c < COLS; c++) {
                board[row][c] = 2; // Temporary flash state
            }
        });
        draw();
        
        // Remove lines after brief delay
        setTimeout(() => {
            clearedRows.forEach(() => {
                for (let r = ROWS - 1; r >= 0; r--) {
                    if (board[r].every(cell => cell === 2)) {
                        board.splice(r, 1);
                        boardTypes.splice(r, 1);
                        board.unshift(new Array(COLS).fill(0));
                        boardTypes.unshift(new Array(COLS).fill(null));
                    }
                }
            });
            
            lines += linesCleared;
            
            // Game Boy Tetris scoring (Type A)
            const points = [0, 40, 100, 300, 1200];
            score += points[linesCleared] * level;
            
            // Combo bonus
            const now = Date.now();
            if (now - lastClearTime < 1000) {
                combo++;
                score += combo * 50 * level;
            } else {
                combo = 0;
            }
            lastClearTime = now;
            
            // Sound effects
            if (linesCleared === 4) {
                sounds.tetris();
            } else {
                sounds.clear();
            }
            
            // Level progression based on lines cleared
            const oldLevel = level;
            const newLevel = Math.floor(lines / 10) + 1;
            if (newLevel !== level) {
                level = Math.min(newLevel, 20); // Max level 20
                if (level > oldLevel) {
                    sounds.levelUp();
                }
            }
            
            updateStats();
        }, 100);
    }
}

// Update stats display
function updateStats() {
    // Stats are now drawn on canvas, no DOM updates needed
    draw();
}

// End game
function endGame() {
    gameOver = true;
    gameRunning = false;
    saveHighScore();
    sounds.gameOver();
    document.getElementById('gameOver').classList.remove('hidden');
}

// Game loop
function gameLoop(timestamp) {
    if (!gameRunning) {
        console.log('Game not running, stopping loop');
        return;
    }
    
    if (!gamePaused && !gameOver) {
        frameCount++;
        
        // Get drop speed for current level
        const framesPerDrop = LEVEL_SPEEDS[Math.min(level, 20)] || 3;
        
        // If soft dropping (holding down), drop faster (every 2 frames)
        const actualDropSpeed = softDropping ? 2 : framesPerDrop;
        
        dropCounter++;
        if (dropCounter >= actualDropSpeed) {
            if (currentPiece && !movePiece(0, 1)) {
                lockPiece();
            }
            dropCounter = 0;
        }
        
        draw();
    }
    
    requestAnimationFrame(gameLoop);
}

// Draw game
function draw() {
    // Clear entire canvas with lightest color (Game Boy LCD background)
    ctx.fillStyle = COLORS.lightest;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const gameAreaX = WALL_WIDTH;
    
    // Draw left wall
    drawWall(0);
    
    // Draw right wall  
    drawWall(WALL_WIDTH + GAME_WIDTH);
    
    // Draw game grid background
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const x = gameAreaX + c * BLOCK_SIZE;
            const y = r * BLOCK_SIZE;
            
            if (board[r][c] === 1) {
                // Draw locked piece with its type
                const pieceType = boardTypes[r][c];
                drawBlockImage(x, y, pieceType);
            } else if (board[r][c] === 2) {
                // Flash state for clearing lines
                ctx.fillStyle = COLORS.light;
                ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
            } else {
                // Empty cell - background
                ctx.fillStyle = COLORS.lightest;
                ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
    
    // Draw current piece
    if (currentPiece) {
        for (let r = 0; r < currentPiece.shape.length; r++) {
            for (let c = 0; c < currentPiece.shape[r].length; c++) {
                if (currentPiece.shape[r][c]) {
                    const x = gameAreaX + (currentPiece.x + c) * BLOCK_SIZE;
                    const y = (currentPiece.y + r) * BLOCK_SIZE;
                    if (currentPiece.y + r >= 0) {
                        drawBlockImage(x, y, currentPiece.type);
                    }
                }
            }
        }
    }
    
    // Draw border lines
    ctx.strokeStyle = COLORS.lightest;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gameAreaX - 1, 0);
    ctx.lineTo(gameAreaX - 1, CANVAS_HEIGHT);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(gameAreaX + GAME_WIDTH + 1, 0);
    ctx.lineTo(gameAreaX + GAME_WIDTH + 1, CANVAS_HEIGHT);
    ctx.stroke();
    
    // Draw stats area on the right
    drawStats();
}

// Draw stats panel on the right side
function drawStats() {
    const statsX = WALL_WIDTH + GAME_WIDTH + WALL_WIDTH + 10;
    
    // Use darkest shade for text - more pixelated font style
    ctx.fillStyle = COLORS.darkest;
    ctx.font = 'bold 9px monospace';
    
    // TOP (high score)
    ctx.fillText('TOP', statsX + 5, 18);
    ctx.font = 'bold 11px monospace';
    ctx.fillText(highScore.toString().padStart(6, '0'), statsX + 45, 18);
    
    // SCORE label and box
    ctx.font = 'bold 9px monospace';
    ctx.fillText('SCORE', statsX + 5, 38);
    
    // Score box
    ctx.strokeStyle = COLORS.darkest;
    ctx.lineWidth = 2;
    ctx.strokeRect(statsX + 5, 43, 130, 20);
    ctx.fillStyle = COLORS.darkest;
    ctx.font = 'bold 13px monospace';
    ctx.fillText(score.toString().padStart(6, '0'), statsX + 15, 57);
    
    // Combo indicator (if active)
    if (combo > 0) {
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = COLORS.darkest;
        ctx.fillText('COMBO x' + combo, statsX + 30, 75);
    }
    
    // LEVEL-0 label and number
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = COLORS.darkest;
    ctx.fillText('LEVEL-', statsX + 5, 95);
    ctx.font = 'bold 15px monospace';
    ctx.fillText(level.toString(), statsX + 58, 95);
    
    // LINES-000 label and number  
    ctx.font = 'bold 9px monospace';
    ctx.fillText('LINES-', statsX + 5, 122);
    ctx.font = 'bold 15px monospace';
    ctx.fillText(lines.toString().padStart(3, '0'), statsX + 58, 122);
    
    // NEXT label
    ctx.font = 'bold 9px monospace';
    ctx.fillText('NEXT', statsX + 48, 155);
    
    // Next piece box
    ctx.strokeStyle = COLORS.darkest;
    ctx.lineWidth = 2;
    ctx.strokeRect(statsX + 28, 165, 75, 65);
    
    // Draw next piece preview (centered in box) - only if nextPiece exists
    if (nextPiece && nextPiece.shape) {
        const boxCenterX = statsX + 65;
        const boxCenterY = 197;
        const previewSize = 11;
        
        // Calculate piece dimensions for centering
        const pieceWidth = nextPiece.shape[0].length * previewSize;
        const pieceHeight = nextPiece.shape.length * previewSize;
        const previewX = boxCenterX - pieceWidth / 2;
        const previewY = boxCenterY - pieceHeight / 2;
        
        for (let r = 0; r < nextPiece.shape.length; r++) {
            for (let c = 0; c < nextPiece.shape[r].length; c++) {
                if (nextPiece.shape[r][c]) {
                    const x = previewX + c * previewSize;
                    const y = previewY + r * previewSize;
                    // Draw preview blocks with simpler style
                    ctx.fillStyle = COLORS.darkest;
                    ctx.fillRect(x, y, previewSize - 1, previewSize - 1);
                }
            }
        }
    }
    
    // Draw decorative blocks at bottom for authentic look
    const decorY = 250;
    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = COLORS.darkest;
        ctx.fillRect(statsX + 18 + i * 11, decorY, 9, 9);
        ctx.fillRect(statsX + 70 + i * 11, decorY, 9, 9);
    }
}

// Draw wall decoration
function drawWall(x) {
    const wallTileHeight = BLOCK_SIZE * 0.75;
    const numTiles = Math.ceil(CANVAS_HEIGHT / wallTileHeight) + 1;
    
    for (let i = 0; i < numTiles; i++) {
        const y = i * wallTileHeight;
        if (wallImage.complete) {
            ctx.drawImage(wallImage, x, y, WALL_WIDTH, wallTileHeight);
        } else {
            // Fallback if image not loaded
            ctx.fillStyle = COLORS.dark;
            ctx.fillRect(x, y, WALL_WIDTH, wallTileHeight);
        }
    }
}

// Draw block using image
function drawBlockImage(x, y, type) {
    const img = blockImages[type];
    if (img && img.complete) {
        // Draw image scaled to block size
        ctx.drawImage(img, x, y, BLOCK_SIZE, BLOCK_SIZE);
    } else {
        // Fallback to simple rect if image not loaded
        ctx.fillStyle = COLORS.darkest;
        ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    }
}

// Draw a single block (Game Boy style with texture/shading) - FALLBACK
function drawBlock(x, y) {
    // Main block fill (darkest)
    ctx.fillStyle = COLORS.darkest;
    ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    
    // Top highlight (lighter)
    ctx.fillStyle = COLORS.light;
    ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, 3);
    
    // Left highlight
    ctx.fillRect(x + 1, y + 1, 3, BLOCK_SIZE - 2);
    
    // Bottom shadow (darker)
    ctx.fillStyle = COLORS.dark;
    ctx.fillRect(x + 1, y + BLOCK_SIZE - 4, BLOCK_SIZE - 2, 3);
    
    // Right shadow
    ctx.fillRect(x + BLOCK_SIZE - 4, y + 1, 3, BLOCK_SIZE - 2);
    
    // Center fill (medium)
    ctx.fillStyle = COLORS.dark;
    ctx.fillRect(x + 4, y + 4, BLOCK_SIZE - 8, BLOCK_SIZE - 8);
}

// Initialize game when page loads
window.addEventListener('load', init);
