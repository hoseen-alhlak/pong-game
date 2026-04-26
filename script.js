const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Paddle properties
const paddleHeight = 100;
const paddleWidth = 10;
const paddleSpeed = 6;

// Player paddle (left)
const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Computer paddle (right)
const computerPaddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 5,
    dy: 5
};

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse control
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerPaddle.y = mouseY - playerPaddle.height / 2;
});

// Button handlers
let pauseToggle = false;
document.getElementById('startBtn').addEventListener('click', function() {
    pauseToggle = !pauseToggle;
    gameRunning = pauseToggle;
    this.textContent = gameRunning ? 'Pause Game' : 'Resume Game';
});

document.getElementById('resetBtn').addEventListener('click', () => {
    resetGame();
});

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    gameRunning = false;
    pauseToggle = false;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 5;
    ball.dy = 5;
    playerPaddle.y = canvas.height / 2 - paddleHeight / 2;
    computerPaddle.y = canvas.height / 2 - paddleHeight / 2;
    updateScore();
    document.getElementById('startBtn').textContent = 'Start Game';
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

function handlePlayerPaddleMovement() {
    // Arrow key controls
    if (keys['ArrowUp']) {
        playerPaddle.dy = -paddleSpeed;
    } else if (keys['ArrowDown']) {
        playerPaddle.dy = paddleSpeed;
    } else {
        playerPaddle.dy = 0;
    }

    playerPaddle.y += playerPaddle.dy;

    // Boundary collision for player paddle
    if (playerPaddle.y < 0) {
        playerPaddle.y = 0;
    }
    if (playerPaddle.y + playerPaddle.height > canvas.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }
}

function handleComputerPaddleMovement() {
    // Simple AI: follow the ball
    const paddleCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenterY = ball.y;
    const aiSpeed = 4.5;

    if (ballCenterY < paddleCenter - 35) {
        computerPaddle.dy = -aiSpeed;
    } else if (ballCenterY > paddleCenter + 35) {
        computerPaddle.dy = aiSpeed;
    } else {
        computerPaddle.dy = 0;
    }

    computerPaddle.y += computerPaddle.dy;

    // Boundary collision for computer paddle
    if (computerPaddle.y < 0) {
        computerPaddle.y = 0;
    }
    if (computerPaddle.y + computerPaddle.height > canvas.height) {
        computerPaddle.y = canvas.height - computerPaddle.height;
    }
}

function checkPaddleCollision(paddle) {
    if (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.y + ball.radius > paddle.y
    ) {
        // Calculate collision point
        const collidePoint = ball.y - (paddle.y + paddle.height / 2);
        const collidePointNormalized = collidePoint / (paddle.height / 2);
        const maxBounceAngle = Math.PI / 4; // 45 degrees
        const bounceAngle = collidePointNormalized * maxBounceAngle;

        // Bounce the ball
        ball.dx = -ball.dx;
        ball.dy = Math.sin(bounceAngle) * 5;
        ball.dx *= 1.02; // Slight speed increase

        // Prevent ball from getting stuck
        if (paddle === playerPaddle) {
            ball.x = paddle.x + paddle.width;
        } else {
            ball.x = paddle.x - ball.radius;
        }
    }
}

function updateBallPosition() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Left and right wall (scoring)
    if (ball.x - ball.radius < 0) {
        computerScore++;
        resetBall();
        updateScore();
    }
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        resetBall();
        updateScore();
    }

    // Paddle collisions
    checkPaddleCollision(playerPaddle);
    checkPaddleCollision(computerPaddle);
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 4;
}

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#16213e');

    // Draw center line
    drawCenterLine();

    // Draw paddles
    drawRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, '#ffeb3b');
    drawRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height, '#ff6b9d');

    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#00ff88');
}

function update() {
    if (gameRunning) {
        handlePlayerPaddleMovement();
        handleComputerPaddleMovement();
        updateBallPosition();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();

// Initialize
updateScore();
