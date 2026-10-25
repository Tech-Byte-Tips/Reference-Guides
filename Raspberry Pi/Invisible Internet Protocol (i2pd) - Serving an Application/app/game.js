"use strict";

const ROWS = 6;
const COLS = 7;
const WIN_IN_A_ROW = 4;

const HUMAN = 1; // red
const AI = 2;    // yellow

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const scoreRedEl = document.getElementById("score-red");
const scoreYellowEl = document.getElementById("score-yellow");
const scoreBoxRed = document.getElementById("scorebox-red");
const scoreBoxYellow = document.getElementById("scorebox-yellow");
const newGameBtn = document.getElementById("new-game");
const resetScoresBtn = document.getElementById("reset-scores");

let grid = [];          // grid[row][col] = 0 empty, 1 red, 2 yellow
let current = HUMAN;
let gameOver = false;
let aiThinking = false;
let aiToken = 0; // invalidates any pending AI move when a new game starts
let scores = { [HUMAN]: 0, [AI]: 0 };
let cells = [];         // DOM cells, same layout as grid

const COLORS = { [HUMAN]: "red", [AI]: "yellow" };
const NAMES = { [HUMAN]: "Player 1", [AI]: "Player 2" };

function createBoard() {
  grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
  cells = [];
  boardEl.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const btn = document.createElement("button");
      btn.className = "cell";
      btn.type = "button";
      btn.setAttribute("aria-label", `Drop in column ${c + 1}`);
      btn.addEventListener("click", () => onColumnClick(c));
      boardEl.appendChild(btn);
      cells.push(btn);
    }
  }
}

function cellAt(r, c) {
  return cells[r * COLS + c];
}

function columnFull(c) {
  return grid[0][c] !== 0;
}

function dropRow(c) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (grid[r][c] === 0) return r;
  }
  return -1;
}

function placeDisc(r, c, player) {
  grid[r][c] = player;
  const disc = document.createElement("span");
  disc.className = `disc ${COLORS[player]}`;
  // small delay so the drop animation plays
  requestAnimationFrame(() => requestAnimationFrame(() => disc.classList.add("drop")));
  cellAt(r, c).appendChild(disc);
}

const DIRECTIONS = [
  [0, 1],   // horizontal
  [1, 0],   // vertical
  [1, 1],   // diagonal down-right
  [1, -1],  // diagonal down-left
];

function checkWin(r, c, player) {
  for (const [dr, dc] of DIRECTIONS) {
    const line = [[r, c]];
    // walk forward
    for (let i = 1; i < WIN_IN_A_ROW; i++) {
      const nr = r + dr * i, nc = c + dc * i;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || grid[nr][nc] !== player) break;
      line.push([nr, nc]);
    }
    // walk backward
    for (let i = 1; i < WIN_IN_A_ROW; i++) {
      const nr = r - dr * i, nc = c - dc * i;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || grid[nr][nc] !== player) break;
      line.push([nr, nc]);
    }
    if (line.length >= WIN_IN_A_ROW) return line;
  }
  return null;
}

function isDraw() {
  return grid[0].every((v) => v !== 0);
}

function setStatus(text) {
  statusEl.textContent = text;
}

function highlightWin(line) {
  for (const [r, c] of line) cellAt(r, c).classList.add("won");
}

function endTurn(player, line) {
  if (line) {
    gameOver = true;
    scores[player]++;
    scoreRedEl.textContent = scores[HUMAN];
    scoreYellowEl.textContent = scores[AI];
    highlightWin(line);
    setStatus(`${NAMES[player]} wins!`);
  } else if (isDraw()) {
    gameOver = true;
    setStatus("It's a draw!");
  } else {
    current = current === HUMAN ? AI : HUMAN;
    setStatus(`${NAMES[current]}'s turn`);
    if (current === AI) aiMove();
  }
  refreshBoardState();
}

function onColumnClick(c) {
  if (gameOver || aiThinking || current !== HUMAN || columnFull(c)) return;
  const r = dropRow(c);
  placeDisc(r, c, HUMAN);
  const line = checkWin(r, c, HUMAN);
  endTurn(HUMAN, line);
}

function refreshBoardState() {
  for (let c = 0; c < COLS; c++) {
    cellAt(0, c).disabled = gameOver || aiThinking || current !== HUMAN || columnFull(c);
  }
  scoreBoxRed.classList.toggle("active", !gameOver && current === HUMAN);
  scoreBoxYellow.classList.toggle("active", !gameOver && current === AI);
}

/* ------------------- AI (minimax with alpha-beta pruning) ------------------- */

function evaluate(grid) {
  // Score the board from the AI's perspective by sliding a 4-window across it.
  const CENTER = 3;
  let score = 0;
  const windows = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of DIRECTIONS) {
        const er = r + dr * 3, ec = c + dc * 3;
        if (er < 0 || er >= ROWS || ec < 0 || ec >= COLS) continue;
        const win = [
          [r, c],
          [r + dr, c + dc],
          [r + dr * 2, c + dc * 2],
          [er, ec],
        ];
        windows.push(win);
      }
    }
  }
  for (const win of windows) {
    const vals = win.map(([r, c]) => grid[r][c]);
    const aiCount = vals.filter((v) => v === AI).length;
    const huCount = vals.filter((v) => v === HUMAN).length;
    const emptyCount = vals.filter((v) => v === 0).length;
    if (aiCount === 4) score += 100000;
    else if (huCount === 4) score -= 100000;
    else if (aiCount === 3 && emptyCount === 1) score += 100;
    else if (huCount === 3 && emptyCount === 1) score -= 100;
    else if (aiCount === 2 && emptyCount === 2) score += 10;
    else if (huCount === 2 && emptyCount === 2) score -= 10;
    // slight bias toward the center column
    for (const [r, c] of win) {
      if (grid[r][c] === AI) score += c === CENTER ? 6 : 0;
      if (grid[r][c] === HUMAN) score -= c === CENTER ? 6 : 0;
    }
  }
  return score;
}

function validMoves(grid) {
  const moves = [];
  for (let c = 0; c < COLS; c++) {
    if (grid[0][c] === 0) moves.push(c);
  }
  return moves;
}

function simulate(grid, c, player) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (grid[r][c] === 0) {
      grid[r][c] = player;
      return r;
    }
  }
  return -1;
}

function minimax(grid, depth, alpha, beta, maximizing) {
  // Terminal: check the board for any four-in-a-row.
  const score = evaluate(grid);
  if (score >= 100000 || score <= -100000) return score;
  if (depth === 0) return score;

  const moves = validMoves(grid);
  if (moves.length === 0) return 0;

  if (maximizing) {
    let best = -Infinity;
    // play center-ish moves first for better pruning
    const ordered = moves.sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));
    for (const c of ordered) {
      const r = simulate(grid, c, AI);
      const value = minimax(grid, depth - 1, alpha, beta, false);
      grid[r][c] = 0;
      best = Math.max(best, value);
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return best;
  } else {
    let best = Infinity;
    const ordered = moves.sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));
    for (const c of ordered) {
      const r = simulate(grid, c, HUMAN);
      const value = minimax(grid, depth - 1, alpha, beta, true);
      grid[r][c] = 0;
      best = Math.min(best, value);
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return best;
  }
}

function bestMove(grid) {
  const moves = validMoves(grid);
  if (moves.length === 0) return -1;
  if (moves.length === COLS) return 3; // first move: just take the center

  // Immediate win?
  for (const c of moves) {
    const r = simulate(grid, c, AI);
    if (r >= 0 && checkWinOn(grid, r, c, AI)) {
      grid[r][c] = 0;
      return c;
    }
    grid[r][c] = 0;
  }
  // Block an immediate loss?
  for (const c of moves) {
    const r = simulate(grid, c, HUMAN);
    if (r >= 0 && checkWinOn(grid, r, c, HUMAN)) {
      grid[r][c] = 0;
      return c;
    }
    grid[r][c] = 0;
  }

  let best = -Infinity;
  let choice = moves[0];
  const ordered = moves.sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));
  for (const c of ordered) {
    const r = simulate(grid, c, AI);
    const value = minimax(grid, 5, -Infinity, Infinity, false);
    grid[r][c] = 0;
    if (value > best) {
      best = value;
      choice = c;
    }
  }
  return choice;
}

// Win check against an arbitrary grid (used on the AI's copy).
function checkWinOn(g, r, c, player) {
  for (const [dr, dc] of DIRECTIONS) {
    let count = 1;
    for (const sign of [1, -1]) {
      for (let i = 1; i < WIN_IN_A_ROW; i++) {
        const nr = r + dr * i * sign, nc = c + dc * i * sign;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || g[nr][nc] !== player) break;
        count++;
      }
    }
    if (count >= WIN_IN_A_ROW) return true;
  }
  return false;
}

function aiMove() {
  aiThinking = true;
  const token = ++aiToken;
  refreshBoardState();
  // Defer so the human's disc animation can start first.
  setTimeout(() => {
    if (token !== aiToken) return; // a new game started meanwhile
    const c = bestMove(grid);
    if (c < 0) {
      aiThinking = false;
      return;
    }
    const r = dropRow(c);
    placeDisc(r, c, AI);
    aiThinking = false;
    const line = checkWin(r, c, AI);
    endTurn(AI, line);
  }, 350);
}

function newGame() {
  gameOver = false;
  aiThinking = false;
  aiToken++; // cancel any pending AI move
  current = Math.random() < 0.5 ? HUMAN : AI;
  createBoard();
  setStatus(`${NAMES[current]}'s turn`);
  if (current === AI) aiMove();
}

newGameBtn.addEventListener("click", newGame);
resetScoresBtn.addEventListener("click", () => {
  scores = { [HUMAN]: 0, [AI]: 0 };
  scoreRedEl.textContent = "0";
  scoreYellowEl.textContent = "0";
});

createBoard();
setStatus("Click a column to drop a disc. Player 1 (red) goes first.");
