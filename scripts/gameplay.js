const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const CELL_SIZE = 20;
const GRID_WIDTH = Math.floor(canvas.width / CELL_SIZE);
const GRID_HEIGHT = Math.floor(canvas.height / CELL_SIZE);

let player = {
    x: Math.floor(GRID_WIDTH / 2),
    y: Math.floor(GRID_HEIGHT / 2),
    direction: { x: 0, y: 0 },
    tail: []
};

let pellets = [];
let invaders = [];
let score = 0;
let wave = 1;
let waveInterval = 5000; // Interval to spawn new waves (in milliseconds)
let lastWaveTime = 0;

function initGame() {
    // Clear existing pellets and invaders
    pellets = [];
    invaders = [];

    // Generate pellets
    for (let i = 0; i < 50; i++) {
        pellets.push({
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
        });
    }

    // Generate initial invaders
    spawnWave();
}

function spawnWave() {
    const invaderCount = 5 + wave * 2; // Increase invader count with each wave
    for (let i = 0; i < invaderCount; i++) {
        invaders.push({
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: 0
        });
    }
}

function update() {
    const currentTime = Date.now();
    if (currentTime - lastWaveTime > waveInterval) {
        lastWaveTime = currentTime;
        wave++;
        spawnWave();
        waveInterval = Math.max(1000, waveInterval - 500); // Decrease interval, but not below 1000ms
    }

    // Move player
    player.x += player.direction.x;
    player.y += player.direction.y;

    // Wrap around screen
    player.x = (player.x + GRID_WIDTH) % GRID_WIDTH;
    player.y = (player.y + GRID_HEIGHT) % GRID_HEIGHT;

    // Update tail
    player.tail.unshift({ x: player.x, y: player.y });
    if (player.tail.length > score + 1) {
        player.tail.pop();
    }

    // Check collision with pellets
    pellets = pellets.filter(pellet => {
        if (pellet.x === player.x && pellet.y === player.y) {
            score++;
            scoreElement.textContent = `Score: ${score}`;
            return false;
        }
        return true;
    });

    // Move invaders
    invaders.forEach(invader => {
        invader.y += 0.1;
        if (invader.y >= GRID_HEIGHT) {
            invader.y = 0;
            invader.x = Math.floor(Math.random() * GRID_WIDTH);
        }
    });

    // Check collision with invaders
    if (invaders.some(invader => Math.abs(invader.x - player.x) < 1 && Math.abs(invader.y - player.y) < 1)) {
        gameOver();
    }

    // Check collision with tail
    if (player.tail.slice(1).some(segment => segment.x === player.x && segment.y === player.y)) {
        gameOver();
    }
}

function draw() {
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw fog effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            if (Math.random() < 0.01) {
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }

    // Draw player
    ctx.fillStyle = '#8b0000';
    player.tail.forEach((segment, index) => {
        const alpha = 1 - (index / player.tail.length);
        ctx.fillStyle = `rgba(139, 0, 0, ${alpha})`;
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });

    // Draw pellets
    ctx.fillStyle = '#fff';
    pellets.forEach(pellet => {
        ctx.beginPath();
        ctx.arc((pellet.x + 0.5) * CELL_SIZE, (pellet.y + 0.5) * CELL_SIZE, CELL_SIZE / 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw invaders
    ctx.fillStyle = '#0f0';
    invaders.forEach(invader => {
        ctx.fillRect(invader.x * CELL_SIZE, invader.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    alert(`Game Over! Your score: ${score}`);

    // Reset game state
    player.tail = [];
    score = 0;
    scoreElement.textContent = 'Score: 0';
    wave = 1;
    waveInterval = 5000;
    lastWaveTime = Date.now();

    // Reinitialize the game state
    initGame();

    // Optionally, reset player position and direction if needed
    player.x = Math.floor(GRID_WIDTH / 2);
    player.y = Math.floor(GRID_HEIGHT / 2);
    player.direction = { x: 0, y: 0 };
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            if (player.direction.y !== 1) player.direction = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (player.direction.y !== -1) player.direction = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (player.direction.x !== 1) player.direction = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (player.direction.x !== -1) player.direction = { x: 1, y: 0 };
            break;
    }
});

initGame();
gameLoop();