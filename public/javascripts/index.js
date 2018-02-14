
const $grid = document.querySelector('.js-grid');
const $btn = document.querySelector('.js-btn');
const $btnStop = document.querySelector('.js-btn-stop');
const $log = document.querySelector('.js-log');
const gridFragment = document.createDocumentFragment();
let interval;
let randomCellSeed;
let nextGen;

const GameOfLifeAPI = Object.freeze({
  /*
    This is the configuration of the Game.
    The script will get access to the different values of the 'defaultOptions' object.
  */
  defaultOptions: {
    cell: {
      CELL_ON: 'on',
      CELL_OFF: 'off',
    },
    grid: {
      ROWS_MAX: 20,
      COLS_MAX: 80,
    },
    DELAY: 500,
  },
  init,
  start,
  stop,
});

window.addEventListener('load', GameOfLifeAPI.init);
$btn.addEventListener('click', GameOfLifeAPI.start);
$btnStop.addEventListener('click', GameOfLifeAPI.stop);


/**
 * initializes the App.
 * @param {object} config configuration options
 */
function init(config = {}) {
  const options = {
    ...GameOfLifeAPI.defaultOptions,
    ...config,
  };
  randomCellSeed = randomizeCellSeed(options);
  const firstGen = createCellGenerationFrom(randomCellSeed, options);
  $grid.appendChild(createDocumentFragmentFrom(firstGen, options));
  nextGen = firstGen;
}


/**
 * Starts the App.
 * @param {object} config configuration options
 */
function start(config = {}) {
  const options = {
    ...GameOfLifeAPI.defaultOptions,
    ...config
  };
  interval = setInterval(() => {
    nextGen = createCellGenerationFrom(nextGen, options);
    $grid.innerHTML = '';
    $grid.appendChild(createDocumentFragmentFrom(nextGen, options));
  },
  options.DELAY);
}


/**
 * Stops the App's infinite loop.
 */
function stop() {
  clearInterval(interval);
}


/**
 * Creates and Populates a documentFragment context-free container as from a given multidimensional array.
 *   Docs at developer.mozilla.org/en-US/docs/Web/API/DocumentFragment
 * @param {array} stateArr a multi-dimensional array
 * @param {object} options configuration options
 * @returns {object} a DocumentFragment object
 */
function createDocumentFragmentFrom(stateArr, options) {
  const cellOptions = options.cell;
  const documentFragment = document.createDocumentFragment();
  stateArr.forEach((row, indexRow) => {
    row.forEach((cellStatus, indexCol) => {
      const $cellElement = createCellElement(indexRow, indexCol, cellStatus, cellOptions);
      documentFragment.appendChild($cellElement);
    });
  });
  return documentFragment;
}


/**
 * Creates a div node with a given status and gridRow/gridColumn position.
 * @param {number} indexRow  position of row index in the array
 * @param {number} indexCol  position of col index in the array
 * @param {string} cellStatus the current cell status
 * @param {object} cellOptions cell options configuration
 * @returns {object} a DOM Element Node object
 */
function createCellElement(indexRow, indexCol, cellStatus, cellOptions) {
  const { CELL_ON, CELL_OFF } = cellOptions;
  const gridRowIndex = indexRow + 1;
  const gridColIndex = indexCol + 1;
  const $cellNode = document.createElement('div');
  const classModifier = cellStatus === CELL_ON ? 'Cell--live' : 'Cell--dead';
  const jsSelector = `js-cell-${gridRowIndex}-${gridColIndex}`;
  $cellNode.setAttribute('class', `Cell ${classModifier} ${jsSelector}`);
  $cellNode.style.gridRow = `row ${gridRowIndex}`;
  $cellNode.style.gridColumn = `col ${gridColIndex}`;
  return $cellNode;
}


/**
 * Generates a random binary value 'on'|'off'
 * @param {object} options configuration options
 * @returns {string} a 'on'|'off' value
 */
function randomizeCellState({ cell }) {
  return Math.floor(Math.random() * 2) > 0 ? cell.CELL_ON : cell.CELL_OFF;
}


/**
 * Populates a multidimensional Array with random 'on'|'off' values
 * @param {object} options configuration options
 * @returns {array} a multi-dimensional array
 */
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


/**
 * Creates a new multi-dimensional array of cells from a previous multi-dimensional array.
 * @param {number} prevState a multi-dimensional Array
 * @param {object} options configuration options
 * @returns {array} newState a multi-dimensional Array
 */
function createCellGenerationFrom(prevState, options) {
  let newState = [];
  let newStateRow;

  prevState.forEach((prevStateRow, indexRow) => {
    newStateRow = [];
    prevStateRow.forEach((currentCell, indexCol) => {
      const filteredNeighbours = getNeighbours(indexRow, indexCol, prevState);
      const updatedCellState = updateCurrentCellState(currentCell, filteredNeighbours, options);
      newStateRow.push(updatedCellState);
    });
    newState = [...newState, newStateRow];
  });
  return newState;
}


/**
 * Creates a 3x3 multi-dimensional array of neighbours with any value, that surounds a given cell.
 * @param {number} indexRow current row index
 * @param {number} indexCol current col index
 * @param {array} prevState a multi-dimensional Array
 * @returns {array} cellNeighbours
 */
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

/**
 * Updates a Cell's value according to rules applied to its neighbours.
 * @param {string} currentCell a cell's value 'on' | 'off'
 * @param {array} neighbours a single array of neighbours that surrounds a given cell.
 * @param {object} options configuration options
 * @returns {string} a binary result either 'on' | 'off'
 */
function updateCurrentCellState(currentCellValue, neighbours, options) {
  const { cell: { CELL_ON, CELL_OFF } } = options;
  const filteredNeighbours = neighbours.filter(neighbour => neighbour === CELL_ON);

  switch (currentCellValue) {
    case CELL_ON:
    if(filteredNeighbours.length < 2 || filteredNeighbours.length > 3) {
      // - Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
      // - Any live cell with more than three live neighbours dies, as if by overpopulation.
      return CELL_OFF;
    } else if(filteredNeighbours.length === 2 || filteredNeighbours.length === 3) {
      // - Any live cell with two or three live neighbours lives on to the next generation.
      return CELL_ON;
    } else {
      return currentCellValue;
    }
    break;
    case CELL_OFF:
    // - Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    if(filteredNeighbours.length === 3) {
      return CELL_ON
    } else {
      return currentCellValue;
    }
    break;
    default:
    return currentCellValue;
  }
}
