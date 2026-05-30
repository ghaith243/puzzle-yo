const board = document.getElementById('board');
const difficultySelect = document.getElementById('difficulty');
const startButton = document.getElementById('startButton');
const timerText = document.getElementById('timer');
const message = document.getElementById('message');
const gridLabel = document.getElementById('gridLabel');

const rulesModal = document.getElementById('rulesModal');
const openRulesButton = document.getElementById('openRules');
const closeRulesButton = document.getElementById('closeRules');
const closeRulesFooter = document.getElementById('closeRulesFooter');

const winModal = document.getElementById('winModal');
const closeWinButton = document.getElementById('closeWin');
const playAgainButton = document.getElementById('playAgain');
const winText = document.getElementById('winText');
const finalTime = document.getElementById('finalTime');
const finalGrid = document.getElementById('finalGrid');

const puzzleImagePath = 'assets/bottle.jpg';

let gridSize = 3;
let pieces = [];
let selectedPiece = null;
let timerInterval = null;
let startAt = null;
let firstMoveMade = false;
let imageLoaded = false;
let draggedPiece = null;

function formatTime(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, '0');
  const sec = String(seconds % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

function startTimer() {
  if (timerInterval) return;

  startAt = Date.now();

  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startAt) / 1000);
    timerText.textContent = formatTime(elapsed);
  }, 250);
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerText.textContent = '00:00';
  firstMoveMade = false;
  startAt = null;
}

function updateMessage(text) {
  message.textContent = text;
}

function openModal(modal) {
  modal.classList.remove('hidden');
}

function closeModal(modal) {
  modal.classList.add('hidden');
}

function preloadImage() {
  const img = new Image();

  img.onload = () => {
    imageLoaded = true;
    board.classList.remove('missing-image');
  };

  img.onerror = () => {
    imageLoaded = false;
    board.classList.add('missing-image');
    updateMessage('Image manquante : ajoutez assets/bottle.jpg pour voir le puzzle.');
  };

  img.src = puzzleImagePath;
}

function createPieces() {
  board.innerHTML = '';
  pieces = [];

  const totalPieces = gridSize * gridSize;

  board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
  gridLabel.textContent = `${gridSize}×${gridSize}`;
  finalGrid.textContent = `${gridSize}×${gridSize}`;

  for (let index = 0; index < totalPieces; index += 1) {
    const piece = document.createElement('div');

    piece.className = 'piece';
    piece.draggable = true;
    piece.dataset.correctIndex = index;
    piece.setAttribute('role', 'button');
    piece.setAttribute('aria-label', `Pièce ${index + 1}`);

    piece.style.backgroundImage = `url(${puzzleImagePath})`;
    piece.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;

    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    piece.style.backgroundPosition = `${col * (100 / (gridSize - 1))}% ${row * (100 / (gridSize - 1))}%`;

    piece.addEventListener('dragstart', onDragStart);
    piece.addEventListener('dragover', onDragOver);
    piece.addEventListener('drop', onDrop);
    piece.addEventListener('dragend', onDragEnd);
    piece.addEventListener('click', onPieceClick);

    pieces.push(piece);
    board.appendChild(piece);
  }
}

function shufflePieces() {
  const order = pieces.map((_, index) => index);

  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  if (order.every((value, index) => value === index)) {
    shufflePieces();
    return;
  }

  order.forEach((pieceIndex) => {
    board.appendChild(pieces[pieceIndex]);
  });
}

function isSolved() {
  const currentOrder = Array.from(board.children).map((piece) => Number(piece.dataset.correctIndex));
  return currentOrder.every((value, index) => value === index);
}

function swapPieces(first, second) {
  const parent = first.parentNode;
  const firstNext = first.nextSibling === second ? first : first.nextSibling;
  const secondNext = second.nextSibling === first ? second : second.nextSibling;

  parent.insertBefore(first, secondNext);
  parent.insertBefore(second, firstNext);
}

function checkSolved() {
  if (!isSolved()) return false;

  clearInterval(timerInterval);
  timerInterval = null;

  const elapsed = startAt ? Math.floor((Date.now() - startAt) / 1000) : 0;
  const formatted = formatTime(elapsed);

  timerText.textContent = formatted;
  finalTime.textContent = formatted;

  const finalMessage = elapsed <= 120
    ? 'Bravo ! Puzzle reconstitué rapidement. Saveur exclusive débloquée 🎉'
    : 'Bravo ! Puzzle reconstitué avec succès.';

  updateMessage(finalMessage);

  winText.innerHTML = `
    Tu as reconstitué la bouteille YOYO en <strong>${formatted}</strong>.
    <br>Tu entres dans le tirage au sort YOYO pour tenter de gagner une <strong>PS5</strong>.
  `;

  setTimeout(() => {
    openModal(winModal);
  }, 280);

  return true;
}

function onDragStart(event) {
  draggedPiece = event.currentTarget;
  event.dataTransfer.effectAllowed = 'move';
  event.currentTarget.classList.add('dragging');
}

function onDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

function onDrop(event) {
  event.preventDefault();

  const target = event.currentTarget;

  if (!draggedPiece || draggedPiece === target) return;

  swapPieces(draggedPiece, target);
  handleMove();
}

function onDragEnd(event) {
  event.currentTarget.classList.remove('dragging');
  draggedPiece = null;
}

function onPieceClick(event) {
  const clicked = event.currentTarget;

  if (!selectedPiece) {
    selectedPiece = clicked;
    clicked.classList.add('selected');
    return;
  }

  if (selectedPiece !== clicked) {
    swapPieces(selectedPiece, clicked);
    handleMove();
  }

  selectedPiece.classList.remove('selected');
  selectedPiece = null;
}

function resetSelection() {
  if (selectedPiece) {
    selectedPiece.classList.remove('selected');
  }

  selectedPiece = null;
}

function handleMove() {
  if (!firstMoveMade) {
    startTimer();
    firstMoveMade = true;
  }

  resetSelection();
  updateMessage('Puzzle en cours...');
  checkSolved();
}

function updateBoardSize() {
  const appHeight = document.querySelector('.app').clientHeight;
  const topbarHeight = document.querySelector('.topbar').offsetHeight;
  const controlsHeight = document.querySelector('.control-bar').offsetHeight;
  const messageHeight = document.querySelector('.message-bar').offsetHeight;
  const available = appHeight - topbarHeight - controlsHeight - messageHeight - 92;

  const size = Math.max(320, Math.min(560, available));

  document.documentElement.style.setProperty('--board-size', `${size}px`);
}

function startGame() {
  gridSize = Number(difficultySelect.value);

  resetTimer();
  resetSelection();
  closeModal(winModal);

  preloadImage();
  createPieces();
  shufflePieces();
  updateBoardSize();

  updateMessage('Puzzle mélangé. À vous de jouer !');
}

openRulesButton.addEventListener('click', () => openModal(rulesModal));
closeRulesButton.addEventListener('click', () => closeModal(rulesModal));
closeRulesFooter.addEventListener('click', () => closeModal(rulesModal));

closeWinButton.addEventListener('click', () => closeModal(winModal));
playAgainButton.addEventListener('click', startGame);

rulesModal.addEventListener('click', (event) => {
  if (event.target === rulesModal) closeModal(rulesModal);
});

winModal.addEventListener('click', (event) => {
  if (event.target === winModal) closeModal(winModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal(rulesModal);
    closeModal(winModal);
  }
});

difficultySelect.addEventListener('change', () => {
  gridSize = Number(difficultySelect.value);
  gridLabel.textContent = `${gridSize}×${gridSize}`;
  finalGrid.textContent = `${gridSize}×${gridSize}`;
});

startButton.addEventListener('click', startGame);

window.addEventListener('resize', updateBoardSize);

window.addEventListener('load', () => {
  preloadImage();
  createPieces();
  updateBoardSize();
  updateMessage('Choisissez une difficulté et démarrez.');
});