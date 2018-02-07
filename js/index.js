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
    live: 'live',
    dead: 'dead',
    liveColor: 'green',
    deadColor: 'white',
  },
  grid: {
    rowsMax: 20,
    colsMax: 80
  },
  delay: 500,
});
let interval;

window.addEventListener('load', init);
$btn.addEventListener('click', startAnalize);
$btnStop.addEventListener('click', stopAnalize);

function init() {
  printCellsOnBoard($grid);
  analizeNeighbours($grid);
}

function stopAnalize() {
  clearInterval(interval);
}

function startAnalize() {
  interval = setInterval(() => {
    try {
      analizeNeighbours($grid);
    }
    catch(e) {
      stopAnalize(interval);
      $log.textContent = `Oops! Something went wrong, error: ${e.message}`;
    }
  }, config.delay);
}

function analizeNeighbours($grid) {
  const { cell } = config;
  $grid.childNodes.forEach(($node, index) => {
    const $currentRow = parseInt($node.dataset.row);
    const $currentCol = parseInt($node.dataset.col);
    const initRow = $currentRow - 1;
    const lastRow = $currentRow + 1;
    const initCol = $currentCol - 1;
    const lastCol = $currentCol + 1;
    const neighboursCollection = [];
    for(let row = initRow; row <= lastRow; row++) {
      for(let col = initCol; col <= lastCol; col++) {
        if(row !== $currentRow || col !== $currentCol) {
          const $neighbourCell = document.querySelector(`.js-cell-${row}-${col}`);
          if($neighbourCell) {
            neighboursCollection.push($neighbourCell);
          }
        }
      }
    }
    const liveNeighbours = neighboursCollection.filter($node => $node.dataset.status === cell.live);
    evaluateCellStatus($node, cell, liveNeighbours);
  });
}

function evaluateCellStatus($node, cell, neighbours) {
  switch ($node.dataset.status) {
    case cell.live:
    // - Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
    if(neighbours.length < 2) {
      $node.dataset.status = cell.dead;
      $node.style.backgroundColor = cell.deadColor;
    }
    // - Any live cell with two or three live neighbours lives on to the next generation.
    if(neighbours.length === 2 || neighbours.length === 3) {
      $node.dataset.status = cell.live;
      $node.style.backgroundColor = cell.liveColor;
    }
    // - Any live cell with more than three live neighbours dies, as if by overpopulation.
    if(neighbours.length > 3) {
      $node.dataset.status = cell.dead;
      $node.style.backgroundColor = cell.deadColor;
    }
    break;
    case cell.dead:
    // - Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    if(neighbours.length === 3) {
      $node.dataset.status = cell.live;
      $node.style.backgroundColor = cell.liveColor;
    }
    break;
    default:
      throw Error('cell status doesnt\' match with existing ones.');
  }
}

function createCellNode(row, col) {
  const { cell } = config;
  const $cell = document.createElement('div');
  const cellStatus = (Math.floor(Math.random() * 2)) > 0 ? cell.live : cell.dead;
  $cell.setAttribute('class', `js-cell-${row}-${col}`);
  $cell.setAttribute('data-row', row);
  $cell.setAttribute('data-col', col);
  $cell.setAttribute('data-status', cellStatus);
  $cell.style.gridColumn = `col ${col}`;
  $cell.style.gridRow = `row ${row}`;
  $cell.style.backgroundColor = cellStatus === cell.live ? cell.liveColor : cell.deadColor;
  return $cell;
}

function printCellsOnBoard($grid) {
  const { grid } = config;
  for(let row = 1; row <= grid.rowsMax; row++) {
    for(let col = 1; col <= grid.colsMax; col++) {
      gridFragment.appendChild(createCellNode(row, col));
    }
  }
  $grid.appendChild(gridFragment);
}
