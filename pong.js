document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('pong');
  if (!canvas) return; // Empêche une erreur si le canvas est absent

  // Optionnel : définis la taille du canvas (modifiable selon tes besoins)
  canvas.width = 800;
  canvas.height = 500;

  const ctx = canvas.getContext('2d');

  // Game objects
  const paddleWidth = 12, paddleHeight = 100, ballSize = 16;
  const player = { x: 20, y: (canvas.height - paddleHeight) / 2, width: paddleWidth, height: paddleHeight, color: "#4CAF50" };
  const ai = { x: canvas.width - paddleWidth - 20, y: (canvas.height - paddleHeight) / 2, width: paddleWidth, height: paddleHeight, color: "#F44336" };
  const ball = { x: (canvas.width - ballSize) / 2, y: (canvas.height - ballSize) / 2, size: ballSize, speed: 5, dx: 5, dy: 5, color: "#FFD600" };

  function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
  }

  function drawNet() {
    ctx.strokeStyle = "#fff";
    for (let i = 0; i < canvas.height; i += 30) {
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, i);
      ctx.lineTo(canvas.width / 2, i + 20);
      ctx.stroke();
    }
  }

  function draw() {
    // Clear
    drawRect(0, 0, canvas.width, canvas.height, "#222");

    // Net
    drawNet();

    // Paddles
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);

    // Ball
    drawCircle(ball.x + ball.size / 2, ball.y + ball.size / 2, ball.size / 2, ball.color);
  }

  function resetBall() {
    ball.x = (canvas.width - ball.size) / 2;
    ball.y = (canvas.height - ball.size) / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
  }

  function update() {
    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (top/bottom)
    if (ball.y <= 0 || ball.y + ball.size >= canvas.height) {
      ball.dy *= -1;
    }

    // Paddle collision
    // Player
    if (
      ball.x <= player.x + player.width &&
      ball.x >= player.x &&
      ball.y + ball.size >= player.y &&
      ball.y <= player.y + player.height
    ) {
      ball.dx *= -1;
      ball.x = player.x + player.width; // Prevent sticking
    }
    // AI
    if (
      ball.x + ball.size >= ai.x &&
      ball.x + ball.size <= ai.x + ai.width &&
      ball.y + ball.size >= ai.y &&
      ball.y <= ai.y + ai.height
    ) {
      ball.dx *= -1;
      ball.x = ai.x - ball.size; // Prevent sticking
    }

    // Score reset (if ball passes left or right)
    if (ball.x < 0 || ball.x > canvas.width) {
      resetBall();
    }

    // AI movement: simple follow ball
    let aiCenter = ai.y + ai.height / 2;
    if (aiCenter < ball.y + ball.size / 2) {
      ai.y += 4;
    } else if (aiCenter > ball.y + ball.size / 2) {
      ai.y -= 4;
    }
    // Clamp AI paddle
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;
  }

  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  // Mouse control for player paddle
  canvas.addEventListener('mousemove', function(evt) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    player.y = mouseY - player.height / 2;
    // Clamp player paddle
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
  });

  resetBall();
  gameLoop();
});