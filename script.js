const board = document.getElementById('board');
const difficultySelect = document.getElementById('difficulty');
const startButton = document.getElementById('startButton');
const timerText = document.getElementById('timer');
const message = document.getElementById('message');
const puzzleImagePath = 'assets/bottle.jpg';

let gridSize = 3;
let pieces = [];
let selectedPiece = null;
let timerInterval = null;
let startAt = null;
let firstMoveMade = false;
let imageLoaded = false;

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
}

function updateMessage(text) {
  message.textContent = text;
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

  for (let index = 0; index < totalPieces; index += 1) {
    const piece = document.createElement('div');
    piece.className = 'piece';
    piece.draggable = true;
    piece.dataset.correctIndex = index;
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

  if (order.every((value, idx) => value === idx)) {
    return shufflePieces();
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
  if (isSolved()) {
    clearInterval(timerInterval);
    timerInterval = null;
    const elapsed = Math.floor((Date.now() - startAt) / 1000);
    const finalMessage = elapsed <= 120 ? 'Bravo ! Saveur exclusive débloquée 🎉' : 'Bravo ! Puzzle reconstitué.';
    updateMessage(finalMessage);
    return true;
  }
  return false;
}

let draggedPiece = null;

function onDragStart(event) {
  draggedPiece = event.currentTarget;
  event.dataTransfer.effectAllowed = 'move';
  event.target.classList.add('dragging');
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

function startGame() {
  gridSize = Number(difficultySelect.value);
  resetTimer();
  preloadImage();
  createPieces();
  shufflePieces();
  updateMessage('Puzzle mélangé. À vous de jouer !');
}

startButton.addEventListener('click', startGame);
window.addEventListener('load', () => {
  preloadImage();
  createPieces();
  updateMessage('Choisissez une difficulté et démarrez.');
});
