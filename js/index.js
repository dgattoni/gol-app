/*
Assume a fixed size board, eg 80 columns by 20 rows
To start the game, randomly set each cell on the board either ON or OFF
Print the status of the board to the screen
Enter an infinite loop:
Wait half a second
Produce a new "tick" of the board
Print the status of the board to the screen
The wikipedia article linked above describes the rules for each "tick":
*/

const $grid = document.querySelector('.js-grid');
const $btn = document.querySelector('.js-btn');
const $btnStop = document.querySelector('.js-btn-stop');
const $log = document.querySelector('.js-log');
const gridFragment = document.createDocumentFragment();
const config = Object.freeze({
  cell: {
    on: 'on',
    off: 'off',
    liveColor: 'green',
    deadColor: 'white',
  },
  grid: {
    rowsMax: 20,
    colsMax: 80,
  },
  delay: 500,
});
let interval;

window.addEventListener('load', init);
$btn.addEventListener('click', startLoop);
$btnStop.addEventListener('click', stopAnalize);

let matrix;
let newGen;

function init() {
  matrix = initializeBoard($grid);
  const firstGen = createCellGeneration($grid, matrix);
  $grid.innerHTML = '';
  $grid.appendChild(printBoard(firstGen));
  newGen = firstGen;
}

function startLoop() {
  interval = setInterval(() => {
    newGen = createCellGeneration($grid, newGen);
    $grid.innerHTML = '';
    $grid.appendChild(printBoard(newGen));
  }, config.delay);
}

function stopAnalize() {
  clearInterval(interval);
}

function initializeBoard($grid) {
  let board = [];
  let cellRow;
  for(let row = 1; row <= config.grid.rowsMax; row++) {
    cellRow = [];
    for(let col = 1; col <= config.grid.colsMax; col++) {
      const cellStatus = Math.floor(Math.random() * 2) > 0 ? 'on' : 'off';
      cellRow.push(cellStatus);
      gridFragment.appendChild(createCellNode(row, col, cellStatus));
    }
    board = [...board, cellRow];
  }
  $grid.appendChild(gridFragment);
  return board;
}

function createCellNode(row, col, status) {
  const { cell: { liveColor, deadColor } } = config;
  const $cell = document.createElement('div');
  $cell.setAttribute('class', `js-cell-${row}-${col}`);
  $cell.style.gridColumn = `col ${col}`;
  $cell.style.gridRow = `row ${row}`;
  $cell.style.backgroundColor = status === 'on' ? liveColor : deadColor;
  return $cell;
}

function printBoard(matrix) {
  const fragment = document.createDocumentFragment();
  matrix.forEach((matrixRow, rowIndex) => {
    matrixRow.forEach((cell, colIndex) => {
      const $celula = document.createElement('div');
      $celula.style.backgroundColor =  matrix[rowIndex][colIndex] === 'on' ? config.cell.liveColor : config.cell.deadColor;
      fragment.appendChild($celula);
    });
  });
  return fragment;
}

function createCellGeneration($grid, board) {
  let newBoard = [];
  let newRow;
  board.forEach((row, rowIndex) => {
    newRow = [];
    row.forEach((cell, colIndex) => {
      const allNeighbours = [];
      for(let i = (rowIndex - 1); i <= (rowIndex + 1); i++) {
        for(let j = (colIndex - 1); j <= (colIndex + 1); j++) {
          if(board[i] && board[i][j]) {
            if(rowIndex !== i || colIndex !== j) {
              allNeighbours.push(board[i][j]);
            }
          }
        } //for cols
      } //for rows
      const liveNeighbours = allNeighbours.filter(neighbour => neighbour === 'on');
      const cellOnEvaluation = board[rowIndex][colIndex];
      switch (cellOnEvaluation) {
        case config.cell.on:
        if(liveNeighbours.length < 2 || liveNeighbours.length > 3) {
          // - Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
          // - Any live cell with more than three live neighbours dies, as if by overpopulation.
          return newRow.push('off');
        } else if(liveNeighbours.length === 2 || liveNeighbours.length === 3) {
          // - Any live cell with two or three live neighbours lives on to the next generation.
          newRow.push('on');
        } else {
          newRow.push(cell);
        }
        break;
        case config.cell.off:
        // - Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
        if(liveNeighbours.length === 3) {
          newRow.push('on');
        } else {
          newRow.push(cell);
        }
        break;
        default:
        throw Error('cell status doesnt\' match with existing ones.');
      }
    });
    newBoard = [...newBoard, newRow];
  });
  return newBoard;
}

function evaluateCell(cell, neighbours) {
  const newRow = [];
  switch (cell) {
    case 'on':
    if(neighbours.length < 2 || neighbours.length > 3) {
      // - Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
      // - Any live cell with more than three live neighbours dies, as if by overpopulation.
      return newRow.push('off');
    } else if(neighbours.length === 2 || neighbours.length === 3) {
      // - Any live cell with two or three live neighbours lives on to the next generation.
      return newRow.push('on');
    } else {
      return newRow.push(cell);
    }
    break;
    case 'off':
    // - Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    if(neighbours.length === 3) {
      return newRow.push('on');
    } else {
      return newRow.push(cell);
    }
    break;
    default:
    throw Error('cell status doesnt\' match with existing ones.');
  }
}
