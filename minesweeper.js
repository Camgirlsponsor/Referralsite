const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 40;
const ROWS = 10;
const COLS = 10;
const MINE_COUNT = 15;

let grid, gameOver, minesLeft;

// Initializes a blank grid
function createGrid() {
  grid = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      isMine: false,
      revealed: false,
      flagged: false,
      adjacentMines: 0
    }))
  );
}

// Plants mines randomly
function placeMines() {
  let minesPlaced = 0;
  while (minesPlaced < MINE_COUNT) {
    const row = Math.floor(Math.random() * ROWS);
    const col = Math.floor(Math.random() * COLS);
    if (!grid[row][col].isMine) {
      grid[row][col].isMine = true;
      minesPlaced++;
    }
  }
}

// Calculates adjacent mines for each cell
function calculateAdjacentMines() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c].isMine) continue;
      let count = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const nr = r + i, nc = c + j;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc].isMine) {
            count++;
          }
        }
      }
      grid[r][c].adjacentMines = count;
    }
  }
}

// Draws the grid
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = grid[r][c];
      const x = c * TILE_SIZE;
      const y = r * TILE_SIZE;

      ctx.fillStyle = tile.revealed ? '#ddd' : '#999';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

      if (tile.revealed) {
        if (tile.isMine) {
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 4, 0, 2 * Math.PI);
          ctx.fill();
        } else if (tile.adjacentMines > 0) {
          ctx.fillStyle = 'black';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tile.adjacentMines, x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        }
      } else if (tile.flagged) {
        ctx.fillStyle = 'blue';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('F', x + TILE_SIZE / 2, y + TILE_SIZE / 2);
      }
    }
  }
}

// Reveals a tile
function revealTile(row, col) {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS || grid[row][col].revealed || grid[row][col].flagged) return;
  const tile = grid[row][col];
  tile.revealed = true;

  if (tile.isMine) {
    gameOver = true;
  } else if (tile.adjacentMines === 0) {
    // Flood-fill for empty cells
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        revealTile(row + i, col + j);
      }
    }
  }
}

// Toggles flag on a tile
function toggleFlag(row, col) {
  if (!grid[row][col].revealed) {
    grid[row][col].flagged = !grid[row][col].flagged;
  }
}

// Game click handling
canvas.addEventListener('click', (e) => {
  if (gameOver) return;

  const col = Math.floor(e.offsetX / TILE_SIZE);
  const row = Math.floor(e.offsetY / TILE_SIZE);

  revealTile(row, col);
  if (gameOver) alert('Game Over!');

  drawGrid();
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();

  if (gameOver) return;

  const col = Math.floor(e.offsetX / TILE_SIZE);
  const row = Math.floor(e.offsetY / TILE_SIZE);

  toggleFlag(row, col);
  drawGrid();
});

// Starts a new game
function startGame() {
  createGrid();
  placeMines();
  calculateAdjacentMines();
  gameOver = false;
  drawGrid();
}

startGame();
