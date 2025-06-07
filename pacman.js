const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const controls = {
  up: document.getElementById('up'),
  down: document.getElementById('down'),
  left: document.getElementById('left'),
  right: document.getElementById('right')
};

const tileSize = 24;
const map = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#P####.#####.##.#####.####P#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  "######.##### ## #####.######",
  "######.##          ##.######",
  "######.## ######## ##.######",
  "######.## ######## ##.######",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#.####.#####.##.#####.####.#",
  "#P..##................##..P#",
  "###.##.##.########.##.##.###",
  "###.##.##.########.##.##.###",
  "#......##....##....##......#",
  "#.##########.##.##########.#",
  "#.##########.##.##########.#",
  "#..........................#",
  "############################"
];
const originalMap = map.map(x=>x.slice());

const pacman = {
  x: 13,
  y: 17,
  dir: {x: 0, y: 0},
  nextDir: {x: 0, y: 0},
  color: 'yellow',
  alive: true
};

const ghostColors = ["red", "pink", "cyan", "orange"];
const ghostHomes = [ // À l'image classique
  {x: 13, y: 11}, // rouge
  {x: 14, y: 11}, // rose
  {x: 13, y: 13}, // bleu
  {x: 14, y: 13}, // orange
];
const ghosts = ghostColors.map((color,i) => ({
  x: ghostHomes[i].x,
  y: ghostHomes[i].y,
  color,
  dir: {x: 0, y: -1},
  scatter: i, // Pour IA: chaque fantôme a sa zone de "scatter"
  frightened: false,
  home: {...ghostHomes[i]},
  name: ["Blinky","Pinky","Inky","Clyde"][i]
}));

let score = 0;
let win = false;
let gameOver = false;
let dotsLeft = 0;
let frightTimer = 0;

// --- Responsive ---
function resizeCanvas() {
  canvas.width = tileSize * map[0].length;
  canvas.height = tileSize * map.length;
  canvas.style.width = Math.min(window.innerWidth * 0.95, canvas.width) + "px";
  canvas.style.height = (canvas.height * (parseInt(canvas.style.width) / canvas.width)) + "px";
}
window.addEventListener('resize', resizeCanvas);

// --- Utilitaires ---
function isWall(x, y) {
  if (y<0||y>=map.length||x<0||x>=map[0].length) return true;
  return map[y][x] === "#";
}
function isGhostHouse(x, y) {
  // Centre du niveau : "cage des fantômes"
  return (x>=11 && x<=16 && y>=11 && y<=14);
}
function isDot(x, y) {
  return map[y][x] === ".";
}
function isPower(x, y) {
  return map[y][x] === "P";
}
function isEmpty(x, y) {
  return map[y][x] === " ";
}

// --- Dessin ---
function drawMap() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      // Mur
      if (map[y][x] === "#") {
        ctx.fillStyle = "#2222cc";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        ctx.strokeStyle = "#3af";
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
      } else {
        ctx.fillStyle = "#000";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        // Points
        if (map[y][x] === ".") {
          ctx.fillStyle = "#ffd700";
          ctx.beginPath();
          ctx.arc(x * tileSize + tileSize/2, y * tileSize + tileSize/2, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
        if (map[y][x] === "P") {
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(x * tileSize + tileSize/2, y * tileSize + tileSize/2, 7, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
  }
}

function drawPacman() {
  ctx.save();
  ctx.fillStyle = pacman.color;
  ctx.beginPath();
  // Bouche animée
  let angle = (Math.sin(Date.now()/100) + 1) * 0.15 + 0.15;
  let start = angle * Math.PI;
  let end = (2 - angle) * Math.PI;
  let dirAngle = 0;
  if (pacman.dir.x === 1) dirAngle = 0;
  if (pacman.dir.y === 1) dirAngle = 0.5*Math.PI;
  if (pacman.dir.x === -1) dirAngle = Math.PI;
  if (pacman.dir.y === -1) dirAngle = 1.5*Math.PI;
  ctx.arc(
    pacman.x * tileSize + tileSize / 2,
    pacman.y * tileSize + tileSize / 2,
    tileSize / 2 - 2,
    start + dirAngle,
    end + dirAngle,
    false
  );
  ctx.lineTo(pacman.x * tileSize + tileSize / 2, pacman.y * tileSize + tileSize / 2);
  ctx.fill();
  ctx.restore();
}

function drawGhosts() {
  ghosts.forEach(g => {
    ctx.save();
    ctx.globalAlpha = g.frightened ? 0.7 : 1;
    ctx.fillStyle = g.frightened ? "#33f" : g.color;
    let cx = g.x * tileSize + tileSize / 2;
    let cy = g.y * tileSize + tileSize / 2;
    // Corps rond
    ctx.beginPath();
    ctx.arc(cx, cy, tileSize/2-2, Math.PI, 0, false);
    ctx.lineTo(cx + tileSize/2-2, cy + tileSize/2-4);
    for(let i=2; i>=-2; i--) {
      ctx.quadraticCurveTo(
        cx + (i-0.5)*(tileSize/5), cy + tileSize/2-2 - ((i%2)*6),
        cx + i*(tileSize/5), cy + tileSize/2-2
      );
    }
    ctx.closePath();
    ctx.fill();
    // Yeux
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx-tileSize/6, cy-tileSize/8, tileSize/8, 0, 2*Math.PI);
    ctx.arc(cx+tileSize/6, cy-tileSize/8, tileSize/8, 0, 2*Math.PI);
    ctx.fill();
    ctx.fillStyle = "#00f";
    ctx.beginPath();
    ctx.arc(cx-tileSize/6, cy-tileSize/8, tileSize/16, 0, 2*Math.PI);
    ctx.arc(cx+tileSize/6, cy-tileSize/8, tileSize/16, 0, 2*Math.PI);
    ctx.fill();
    ctx.restore();
  });
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 8, canvas.height - 8);
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "32px Arial";
  ctx.textAlign = "center";
  ctx.fillText(win ? "Bravo, tu as gagné !" : "Perdu !", canvas.width/2, canvas.height/2-14);
  ctx.font = "20px Arial";
  ctx.fillText("Appuie pour rejouer", canvas.width/2, canvas.height/2+30);
  ctx.textAlign = "left";
}

// --- Contrôles ---
function setNextDir(dx, dy) {
  pacman.nextDir = {x: dx, y: dy};
}
window.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") setNextDir(0, -1);
  if (e.key === "ArrowDown") setNextDir(0, 1);
  if (e.key === "ArrowLeft") setNextDir(-1, 0);
  if (e.key === "ArrowRight") setNextDir(1, 0);
  if (gameOver) restartGame();
});
controls.up.addEventListener('touchstart', e => {e.preventDefault(); setNextDir(0,-1);});
controls.down.addEventListener('touchstart', e => {e.preventDefault(); setNextDir(0,1);});
controls.left.addEventListener('touchstart', e => {e.preventDefault(); setNextDir(-1,0);});
controls.right.addEventListener('touchstart', e => {e.preventDefault(); setNextDir(1,0);});
controls.up.addEventListener('click', () => setNextDir(0,-1));
controls.down.addEventListener('click', () => setNextDir(0,1));
controls.left.addEventListener('click', () => setNextDir(-1,0));
controls.right.addEventListener('click', () => setNextDir(1,0));
canvas.addEventListener('touchstart', e => {
  if (gameOver) restartGame();
});

// --- Déplacement ---
function movePacman() {
  // Changement de direction si possible
  if (!isWall(pacman.x + pacman.nextDir.x, pacman.y + pacman.nextDir.y)) {
    pacman.dir = {...pacman.nextDir};
  }
  const newX = pacman.x + pacman.dir.x;
  const newY = pacman.y + pacman.dir.y;
  if (!isWall(newX, newY)) {
    pacman.x = newX;
    pacman.y = newY;
    // téléportation tunnel
    if (pacman.x < 0) pacman.x = map[0].length-1;
    if (pacman.x >= map[0].length) pacman.x = 0;
  }
}

function eatDot() {
  if (isDot(pacman.x, pacman.y)) {
    map[pacman.y] = map[pacman.y].substring(0, pacman.x) + " " + map[pacman.y].substring(pacman.x + 1);
    score += 10;
    dotsLeft--;
  }
  if (isPower(pacman.x, pacman.y)) {
    map[pacman.y] = map[pacman.y].substring(0, pacman.x) + " " + map[pacman.y].substring(pacman.x + 1);
    score += 50;
    dotsLeft--;
    frightTimer = 180;
    ghosts.forEach(g => g.frightened = true);
  }
  if (dotsLeft === 0) {
    win = true;
    gameOver = true;
  }
}

// --- Fantômes IA ---
function moveGhosts() {
  ghosts.forEach((g, idx) => {
    // Mode frightened ?
    if (frightTimer > 0) {
      // Mouvement aléatoire
      let possible = [];
      const dirs = [
        {x:1,y:0}, {x:-1,y:0}, {x:0,y:1},{x:0,y:-1}
      ];
      for(let d of dirs) {
        let nx = g.x + d.x, ny = g.y + d.y;
        if (!isWall(nx, ny) && !(d.x === -g.dir.x && d.y === -g.dir.y)) possible.push(d);
      }
      if (possible.length > 0) {
        let d = possible[Math.floor(Math.random()*possible.length)];
        g.dir = d;
        g.x += g.dir.x; g.y += g.dir.y;
      }
    } else {
      g.frightened = false;
      // Mode normal : chaque fantôme a un comportement différent
      let target = {x: pacman.x, y: pacman.y};
      if (idx === 1) { // Pinky
        // Prédit la position de Pac-Man
        target = {
          x: pacman.x + 4*pacman.dir.x,
          y: pacman.y + 4*pacman.dir.y
        };
      }
      if (idx === 2) { // Inky
        // Prend une zone opposée à Blinky
        let blinky = ghosts[0];
        target = {
          x: pacman.x + (pacman.x - blinky.x),
          y: pacman.y + (pacman.y - blinky.y)
        };
      }
      if (idx === 3) { // Clyde
        // S'éloigne si proche, poursuit sinon
        let dist = Math.abs(g.x - pacman.x) + Math.abs(g.y - pacman.y);
        if (dist < 8) target = {x: 0, y: map.length-1};
      }
      // Choix du mouvement : cherche la direction qui rapproche le plus de la cible
      let bestDir = g.dir, minDist = Infinity;
      const dirs = [
        {x:1,y:0}, {x:-1,y:0}, {x:0,y:1},{x:0,y:-1}
      ];
      for(let d of dirs) {
        let nx = g.x + d.x, ny = g.y + d.y;
        if (!isWall(nx, ny) && !(d.x === -g.dir.x && d.y === -g.dir.y)) {
          let dist = Math.abs(target.x - nx) + Math.abs(target.y - ny);
          if (dist < minDist) {
            minDist = dist;
            bestDir = d;
          }
        }
      }
      g.dir = bestDir;
      g.x += g.dir.x;
      g.y += g.dir.y;
      // Tunnel
      if (g.x < 0) g.x = map[0].length-1;
      if (g.x >= map[0].length) g.x = 0;
    }
  });
  // Décrémenter le mode frightened
  if (frightTimer > 0) {
    frightTimer--;
    if (frightTimer === 0) ghosts.forEach(g => g.frightened = false);
  }
}

// --- Collision ---
function checkCollision() {
  for (let g of ghosts) {
    if (pacman.x === g.x && pacman.y === g.y) {
      if (g.frightened) {
        score += 200;
        g.x = g.home.x; g.y = g.home.y;
        g.dir = {x:0, y:-1};
        g.frightened = false;
      } else {
        gameOver = true; win = false;
      }
    }
  }
}

// --- Boucle du jeu ---
let lastTime = 0;
function gameLoop(ts) {
  if (!lastTime) lastTime = ts;
  let dt = ts - lastTime;
  if (dt > 95 && !gameOver) {
    movePacman();
    eatDot();
    moveGhosts();
    checkCollision();
    lastTime = ts;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawPacman();
  drawGhosts();
  drawScore();
  if (gameOver) drawGameOver();

  requestAnimationFrame(gameLoop);
}
function restartGame() {
  for (let i=0;i<map.length;i++) map[i]=originalMap[i];
  pacman.x = 13; pacman.y = 17; pacman.dir = {x:0,y:0}; pacman.nextDir = {x:0,y:0}; pacman.alive = true;
  ghosts.forEach((g,i) => {g.x = ghostHomes[i].x; g.y = ghostHomes[i].y; g.dir = {x:0,y:-1}; g.frightened=false;});
  score = 0;
  win = false;
  gameOver = false;
  frightTimer = 0;
  dotsLeft = 0;
  for (let y=0;y<map.length;y++) for (let x=0;x<map[0].length;x++) if (isDot(x,y)||isPower(x,y)) dotsLeft++;
  lastTime = 0;
}
function countDots() {
  dotsLeft = 0;
  for (let y=0;y<map.length;y++) for (let x=0;x<map[0].length;x++) if (isDot(x,y)||isPower(x,y)) dotsLeft++;
}

resizeCanvas();
countDots();
gameLoop();