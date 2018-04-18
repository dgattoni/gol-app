const compose = R.compose;
const curry = R.curry;
const $grid = document.querySelector('.js-grid');
const $btnStart = document.querySelector('.js-btnStart');
const trace = curry((tag, x) => {
  console.log(tag, x);
  return x;
});

const options = Object.freeze({
  grid: {
    ROWS_MAX: 20,
    COLS_MAX: 80,
  },
  DELAY: 100,
});

const utilsDOM = Object.freeze({
  composeGrid: compose(
    appendCellsToGrid,
    createCellsFragment
  )
});

const originCellStorage = {
  snapshot: []
};

function init() {
  compose(
    utilsDOM.composeGrid,
    snapshotGeneration(originCellStorage),
    createCellGeneration,
    randomizeCellSeed
  )(options);
}

function start() {
  let interval;
  const cellStorage = Object.assign({}, originCellStorage);
  const composeStart = compose(
    utilsDOM.composeGrid,
    snapshotGeneration(cellStorage),
    createCellGeneration,
  );

  interval = setInterval(
    () => composeStart(cellStorage.snapshot),
    options.DELAY
  );
}

function snapshotGeneration(cells) {
  return (nextGeneration) => {
    cells.snapshot = nextGeneration;
    return [...nextGeneration];
  }
}

function appendCellsToGrid(nodeFragment) {
  return $grid.appendChild(nodeFragment);
}

function createCellsFragment(cellsGeneration) {
  $grid.innerHTML = null;
  const cellsFragment = document.createDocumentFragment();
  cellsGeneration.forEach((row, posX) => {
    row.forEach((cellStatus, posY) => {
      const $cellElement = createCellElement(posX, posY, cellStatus);
      cellsFragment.appendChild($cellElement);
    });
  });
  return cellsFragment;
}

function createCellElement(posX, posY, cellStatus) {
  const positionX = posX + 1;
  const positionY = posY + 1;
  const $cell = document.createElement('div');
  const classModifier = cellStatus === 'on' ? 'Cell--live' : 'Cell--dead';
  const jsSelector = `js-cell-${positionX}-${positionY}`;
  $cell.setAttribute('class', `Cell ${classModifier} ${jsSelector}`);
  $cell.style.gridRow = `row ${positionX}`;
  $cell.style.gridColumn = `col ${positionY}`;
  return $cell;
}

function randomizeCellState() {
  return Math.floor(Math.random() * 2) > 0 ? 'on' : 'off';
}

function randomizeCellSeed(options) {
  const { grid: { COLS_MAX, ROWS_MAX } } = options;
  let seedGrid = [];
  let cellRow;
  for(let row = 0; row < ROWS_MAX; row++) {
    cellRow = [];
    for(let col = 0; col < COLS_MAX; col++) {
      const cellState = randomizeCellState(options);
      cellRow.push(cellState);
    }
    seedGrid = [...seedGrid, cellRow];
  }
  return seedGrid;
}

//wip
function createCellGeneration(prevState) {
  let newState = [];
  let newStateRow;

  prevState.forEach((prevStateRow, indexRow) => {
    newStateRow = [];
    prevStateRow.forEach((currentCell, indexCol) => {
      const neighbours = getNeighbours(indexRow, indexCol, prevState);
      const updatedCellState = updateCurrentCellState(currentCell, neighbours);
      newStateRow.push(updatedCellState);
    });
    newState = [...newState, newStateRow];
  });
  return newState;
}

//wip
function getNeighbours(indexRow, indexCol, prevState) {
  let cellNeighbours = [];
  for(let i = (indexRow - 1); i <= (indexRow + 1); i++) {
    for(let j = (indexCol - 1); j <= (indexCol + 1); j++) {
      if(prevState[i] && prevState[i][j]) {
        if(indexRow !== i || indexCol !== j) {
          cellNeighbours.push(prevState[i][j]);
        }
      }
    } //for cols
  } //for rows
  return cellNeighbours;
}

//wip
function updateCurrentCellState(currentCellValue, neighbours) {
  const liveNeighbours = neighbours.filter(neighbour => neighbour === 'on');

  switch (currentCellValue) {
    case 'on':
    if(liveNeighbours.length < 2 || liveNeighbours.length > 3) {
      // - Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
      // - Any live cell with more than three live neighbours dies, as if by overpopulation.
      return 'off';
    } else if(liveNeighbours.length === 2 || liveNeighbours.length === 3) {
      // - Any live cell with two or three live neighbours lives on to the next generation.
      return 'on';
    } else {
      return currentCellValue;
    }
    break;
    case 'off':
    // - Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    if(liveNeighbours.length === 3) {
      return 'on'
    } else {
      return currentCellValue;
    }
    break;
    default:
    return currentCellValue;
  }
}

window.addEventListener('load', init);
$btnStart.addEventListener('click', start);
