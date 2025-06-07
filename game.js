const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// UI Buttons
const modeBtn = document.createElement('button');
modeBtn.textContent = 'Mode: Solo (vs IA)';
modeBtn.style.position = "absolute";
modeBtn.style.bottom = "40px";
modeBtn.style.left = "50%";
modeBtn.style.transform = "translateX(-50%)";
modeBtn.style.fontSize = "20px";
modeBtn.style.zIndex = 10;
document.body.appendChild(modeBtn);

const restartBtn = document.createElement('button');
restartBtn.textContent = 'Rejouer';
restartBtn.style.position = "absolute";
restartBtn.style.bottom = "80px";
restartBtn.style.left = "50%";
restartBtn.style.transform = "translateX(-50%)";
restartBtn.style.fontSize = "20px";
restartBtn.style.zIndex = 10;
restartBtn.style.display = "none";
document.body.appendChild(restartBtn);

// Game objects
const paddleWidth = 12, paddleHeight = 100, ballSize = 16;
const player = { x: 20, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, color: "#4CAF50", score: 0 };
const player2 = { x: canvas.width - paddleWidth - 20, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, color: "#1976D2", score: 0 };
const ai = player2; // alias for code clarity

const ball = { x: canvas.width / 2 - ballSize / 2, y: canvas.height / 2 - ballSize / 2, size: ballSize, speed: 5, dx: 5, dy: 5, color: "#FFD600" };

let gameMode = "solo"; // solo or duo
let gameEnd = false;

// Touch support variables for tablet
let touchActive1 = false;
let touchActive2 = false;
let touchOffset1 = 0;
let touchOffset2 = 0;

// Clavier pour player 2 sur desktop
let upPressed = false, downPressed = false;

// Draw rectangle
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// Draw circle (ball)
function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

// Draw net
function drawNet() {
    ctx.strokeStyle = "#fff";
    for (let i = 0; i < canvas.height; i += 30) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, i);
        ctx.lineTo(canvas.width / 2, i + 20);
        ctx.stroke();
    }
}

// Draw scores
function drawScore() {
    ctx.font = "40px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(player.score, canvas.width / 4, 50);
    ctx.fillText(player2.score, 3 * canvas.width / 4, 50);
}

// Draw winner
function drawWinner() {
    ctx.font = "60px Arial";
    ctx.fillStyle = "#FFD600";
    ctx.textAlign = "center";
    let text = "";
    if (player.score >= 10) text = "Joueur 1 a gagné !";
    else if (player2.score >= 10) text = (gameMode === "solo" ? "L'IA a gagné !" : "Joueur 2 a gagné !");
    if (text) {
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
}

function draw() {
    // Clear
    drawRect(0, 0, canvas.width, canvas.height, "#222");

    // Net
    drawNet();

    // Paddles
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(player2.x, player2.y, player2.width, player2.height, player2.color);

    // Ball
    drawCircle(ball.x, ball.y, ball.size / 2, ball.color);

    // Scores
    drawScore();

    // Winner
    if (gameEnd) drawWinner();
}

function resetBall() {
    ball.x = canvas.width / 2 - ball.size / 2;
    ball.y = canvas.height / 2 - ball.size / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
}

function resetGame() {
    player.score = 0;
    player2.score = 0;
    gameEnd = false;
    restartBtn.style.display = "none";
    resetBall();
}

function update() {
    if (gameEnd) return;

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top/bottom)
    if (ball.y <= 0 || ball.y + ball.size >= canvas.height) {
        ball.dy *= -1;
    }

    // Paddle collision - Player 1
    if (
        ball.x <= player.x + player.width &&
        ball.x >= player.x &&
        ball.y + ball.size >= player.y &&
        ball.y <= player.y + player.height
    ) {
        ball.dx *= -1;
        ball.x = player.x + player.width; // Prevent sticking
    }
    // Paddle collision - Player 2 (or IA)
    if (
        ball.x + ball.size >= player2.x &&
        ball.x + ball.size <= player2.x + player2.width &&
        ball.y + ball.size >= player2.y &&
        ball.y <= player2.y + player2.height
    ) {
        ball.dx *= -1;
        ball.x = player2.x - ball.size; // Prevent sticking
    }

    // Score
    if (ball.x < 0) {
        player2.score++;
        resetBall();
    } else if (ball.x > canvas.width) {
        player.score++;
        resetBall();
    }

    // Test si match fini
    if (player.score >= 10 || player2.score >= 10) {
        gameEnd = true;
        restartBtn.style.display = "block";
    }

    // Mouvement IA ou joueur 2
    if (gameMode === "solo") {
        // AI movement: simple follow ball
        let aiCenter = ai.y + ai.height / 2;
        if (aiCenter < ball.y) {
            ai.y += 4;
        } else if (aiCenter > ball.y) {
            ai.y -= 4;
        }
        // Clamp AI paddle
        if (ai.y < 0) ai.y = 0;
        if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;
    } else if (gameMode === "duo") {
        // Contrôle clavier (desktop)
        if (upPressed) player2.y -= 6;
        if (downPressed) player2.y += 6;
        // Clamp
        if (player2.y < 0) player2.y = 0;
        if (player2.y + player2.height > canvas.height) player2.y = canvas.height - player2.height;
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Mouse control for player 1 (always)
canvas.addEventListener('mousemove', function(evt) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    player.y = mouseY - player.height / 2;
    // Clamp
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
});

// Touch control (tablette/tactile) pour J1 et J2
canvas.addEventListener('touchstart', function(evt) {
    for (let t of evt.touches) {
        let touchX = t.clientX - canvas.getBoundingClientRect().left;
        let touchY = t.clientY - canvas.getBoundingClientRect().top;
        // Zone gauche = joueur 1
        if (touchX < canvas.width / 2) {
            touchActive1 = true;
            touchOffset1 = touchY - player.y;
        }
        // Zone droite = joueur 2
        else if (touchX >= canvas.width / 2 && gameMode === "duo") {
            touchActive2 = true;
            touchOffset2 = touchY - player2.y;
        }
    }
});
canvas.addEventListener('touchmove', function(evt) {
    evt.preventDefault();
    for (let t of evt.touches) {
        let touchX = t.clientX - canvas.getBoundingClientRect().left;
        let touchY = t.clientY - canvas.getBoundingClientRect().top;
        // Zone gauche = joueur 1
        if (touchX < canvas.width / 2 && touchActive1) {
            player.y = touchY - touchOffset1;
            if (player.y < 0) player.y = 0;
            if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
        }
        // Zone droite = joueur 2 (seulement duo)
        else if (touchX >= canvas.width / 2 && touchActive2 && gameMode === "duo") {
            player2.y = touchY - touchOffset2;
            if (player2.y < 0) player2.y = 0;
            if (player2.y + player2.height > canvas.height) player2.y = canvas.height - player2.height;
        }
    }
}, { passive: false });
canvas.addEventListener('touchend', function(evt) {
    if (evt.touches.length === 0) {
        touchActive1 = false;
        touchActive2 = false;
    }
});

// Clavier pour joueur 2 (desktop duo)
document.addEventListener('keydown', function(evt) {
    if (gameMode === "duo") {
        if (evt.key === "ArrowUp") upPressed = true;
        if (evt.key === "ArrowDown") downPressed = true;
    }
});
document.addEventListener('keyup', function(evt) {
    if (gameMode === "duo") {
        if (evt.key === "ArrowUp") upPressed = false;
        if (evt.key === "ArrowDown") downPressed = false;
    }
});

// Mode switch bouton
modeBtn.addEventListener('click', () => {
    if (gameMode === "solo") {
        gameMode = "duo";
        modeBtn.textContent = "Mode: Deux joueurs (tactile/desktop)";
    } else {
        gameMode = "solo";
        modeBtn.textContent = "Mode: Solo (vs IA)";
    }
    resetGame();
});

// Restart button
restartBtn.addEventListener('click', () => {
    resetGame();
});

// Initialisation
resetGame();
gameLoop();
