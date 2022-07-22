const BOARD_SIZE = 9;
const FREE_CELL = 0;
const GERMANY_BALL = -1;
const NETHERLANDS_BALL = -2;
const SPAIN_BALL = -3;
const SWEDEN_BALL = -4;
const VIETNAM_BALL = -5;
const VISITED_CELL = -6;
const X = 0;
const Y = 1;

let ballFirstLoc = [];
let ballTargetLoc = [];
let modeBalls = [];
let ballId = "";
let arrValue = "";
let scoreValue = 0;

const IMAGES = {
  [FREE_CELL]: "images/1x1.png",
  [GERMANY_BALL]: "images/germany.png",
  [NETHERLANDS_BALL]: "images/netherlands.png",
  [SPAIN_BALL]: "images/spain.png",
  [SWEDEN_BALL]: "images/sweden.png",
  [VIETNAM_BALL]: "images/vietnam.png",
  [VISITED_CELL]: "images/ballpng.png",
};

const ballsList = [
  GERMANY_BALL,
  NETHERLANDS_BALL,
  SPAIN_BALL,
  SWEDEN_BALL,
  VIETNAM_BALL,
];

const createMatrix = () => {
  const gameArray = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    gameArray[i] = [];
    for (let j = 0; j < BOARD_SIZE; j++) {
      gameArray[i][j] = FREE_CELL;
    }
  }
  return gameArray;
};

const getRandomLocationFromMatrix = (gameArray) => {
  const rawIndex = Math.floor(Math.random() * gameArray.length);
  const colIndex = Math.floor(Math.random() * gameArray.length);
  if (gameArray[rawIndex][colIndex] === FREE_CELL) {
    return [rawIndex, colIndex];
  } else {
    return getRandomLocationFromMatrix(gameArray);
  }
};

const setEachBallLocation = (gameArray, ballId) => {
  const [x, y] = getRandomLocationFromMatrix(gameArray);
  gameArray[x][y] = ballId;
};

const getNewArrFromBallsArr = () => {
  const shuffledArray = ballsList.sort((a, b) => 0.5 - Math.random());
  modeBalls = shuffledArray.slice(0, -2);
  return modeBalls;
};

const setBallsLocInMatrix = (gameArray) => {
  const ballsArr = getNewArrFromBallsArr();
  ballsArr.map((ball) => {
    setEachBallLocation(gameArray, ball);
  });
  return gameArray;
};

const deleteAllChildElements = (idName) => {
  const board = document.getElementById(idName);
  while (board.lastElementChild) {
    board.removeChild(board.lastElementChild);
  }
};
const getImage = (ballFlag) => {
  const ball = document.createElement("img");
  ball.src = IMAGES[ballFlag];
  return ball;
};

const setClassToCertainDiv = (element) => {
  const divs = document.querySelectorAll("#gameBoard > div");
  divs.forEach((div) => div.classList.remove("clickedDiv"));
  element.classList.add("clickedDiv");
};

const calculateDistance = (location1) => (location2) => {
  if (location1 !== undefined && location1 !== undefined) {
    return Math.sqrt(
      Math.pow(location1[X] - location2[X], 2) +
        Math.pow(location1[Y] - location2[Y], 2)
    );
  }
};
const getNearCellsOf = ([x, y]) => {
  return [
    [x - 1, y],
    [x + 1, y],
    [x, y + 1],
    [x, y - 1],
  ];
};

const sendWaveStarttoTarget = (gameArray) => {
  if (ballFirstLoc.length === 0) {
    return;
  } else {
    let loopCount = 0;
    while (loopCount < 18) {
      for (let i = 0; i < gameArray.length; i++) {
        for (let j = 0; j < gameArray.length; j++) {
          if (
            gameArray[i][j] !== FREE_CELL &&
            i === ballTargetLoc[X] &&
            j === ballTargetLoc[Y]
          ) {
            return gameArray;
          }
          if (gameArray[i][j] === arrValue) {
            const validSteps = findPointSteps(gameArray, [i, j], FREE_CELL);

            validSteps.forEach((validStep) => {
              gameArray[validStep[X]][validStep[Y]] = arrValue + 1;
            });
          }
        }
      }
      arrValue++;
      loopCount++;
    }
  }
};

const setStepsArray = (gameArray) => {
  const roadArr = [ballTargetLoc];
  for (let i = 0; i < 18; i++) {
    const [x, y] = roadArr[i];
    if (gameArray === undefined) {
      return;
    } else {
      const value = gameArray[x][y] - 1;
      if (gameArray[x][y] === 2) {
        return roadArr.reverse();
      } else {
        const nearSteps = findPointSteps(gameArray, [x, y], value);
        if (nearSteps.lenght === 0) {
          return;
        } else {
          roadArr.push(nearSteps[0]);
        }
      }
    }
  }
};

const findPointSteps = (gameArray, location, value) => {
  const [x, y] = location;
  const allNeighbourDirections = getNearCellsOf([x, y]);
  const isInRange = ([x, y]) =>
    x >= 0 && x < gameArray.length && y >= 0 && y < gameArray.length;
  const steps = allNeighbourDirections.filter(isInRange);

  const validSteps = steps.filter(
    (step) => gameArray[step[X]][step[Y]] === value
  );
  return validSteps;
};

const resetFreeCells = (gameArray) => {
  for (let i = 0; i < gameArray.length; i++) {
    for (let j = 0; j < gameArray.length; j++) {
      if (gameArray[i][j] > 0) {
        gameArray[i][j] = FREE_CELL;
      }
    }
  }
};

const moveBall = (gameArray, stepsArr) => {
  resetFreeCells(gameArray);
  if (stepsArr === undefined) {
    gameArray[ballFirstLoc[X]][ballFirstLoc[Y]] = ballId;
    return;
  } else {
    let delay = 0;
    const step = stepsArr[stepsArr.length - 1];
    gameArray[step[X]][step[Y]] = ballId;

    for (let i = 0; i < stepsArr.length - 1; i++) {
      const step = stepsArr[i];
      gameArray[step[X]][step[Y]] = VISITED_CELL;
      setTimeout(() => {
        gameArray[step[X]][step[Y]] = FREE_CELL;
        createPlayGround(gameArray);
      }, (delay += 45));
    }
  }
};

const setRowsSameBallsArray = (gameArray) => {
  const [x, y] = ballTargetLoc;
  let sameBallIdIndexes = [[x, y]];
  let i = x;
  for (let j = y - 1; j >= 0; j--) {
    if (gameArray[i][j] !== ballId) {
      j = -1;
    } else {
      sameBallIdIndexes.push([i, j]);
    }
  }
  for (let j = y + 1; j < gameArray.length; j++) {
    if (gameArray[i][j] !== ballId) {
      j = gameArray.length;
    } else {
      sameBallIdIndexes.push([i, j]);
    }
  }
  return sameBallIdIndexes;
};

const setColsSameBallsArray = (gameArray) => {
  const [x, y] = ballTargetLoc;
  let sameBallIdIndexes = [[x, y]];
  let j = y;
  for (let i = x - 1; i >= 0; i--) {
    if (gameArray[i][j] !== ballId) {
      i = -1;
    } else {
      sameBallIdIndexes.push([i, j]);
    }
  }
  for (let i = x + 1; i < gameArray.length; i++) {
    if (gameArray[i][j] !== ballId) {
      i = gameArray.length;
    } else {
      sameBallIdIndexes.push([i, j]);
    }
  }
  return sameBallIdIndexes;
};

const setUpToDownDiagonalSameBallsArray = (gameArray) => {
  let [x, y] = ballTargetLoc;
  let sameBallIdIndexes = [[x, y]];

  for (let i = x - 1, j = y - 1; i >= 0 && j >= 0; i--, j--) {
    if (gameArray[i][j] !== ballId) {
      i = -1;
    } else {
      sameBallIdIndexes.push([i, j]);
    }
  }

  for (
    let i = x + 1, j = y + 1;
    i < gameArray.length && j < gameArray.length;
    i++, j++
  ) {
    if (gameArray[i][j] !== ballId) {
      i = gameArray.length;
    } else {
      sameBallIdIndexes.push([i, j]);
    }
  }
  return sameBallIdIndexes;
};

const setDownToUpDiagonalSameBallsArray = (gameArray) => {
  let [x, y] = ballTargetLoc;
  let sameBallIdIndexes = [[x, y]];

  for (let i = x + 1, j = y - 1; i < gameArray.length && j >= 0; i++, j--) {
    if (gameArray[i][j] !== ballId) {
      i = gameArray.length;
    } else {
      sameBallIdIndexes.push([i, j]);
    }
  }

  for (let i = x - 1, j = y + 1; i >= 0 && j < gameArray.length; i--, j++) {
    if (gameArray[i][j] !== ballId) {
      i = -1;
    } else {
      sameBallIdIndexes.push([i, j]);
    }
  }
  return sameBallIdIndexes;
};

const checkThaNearBallsCount = (gameArray, array) => {
  if (array.length >= 5 && array.length <= 9) {
    array.forEach((index) => (gameArray[index[X]][index[Y]] = FREE_CELL));
    array = [];
    scoreValue += 5;
    setScore();
  }
};

const deleteCheckedBalls = (gameArray) => {
  let rowsSameBallIdIndexes = setRowsSameBallsArray(gameArray);
  checkThaNearBallsCount(gameArray, rowsSameBallIdIndexes);

  let colsSameBallIdIndexes = setColsSameBallsArray(gameArray);
  checkThaNearBallsCount(gameArray, colsSameBallIdIndexes);

  let upToDownDiagonalSameBallIdIndexes =
    setUpToDownDiagonalSameBallsArray(gameArray);
  checkThaNearBallsCount(gameArray, upToDownDiagonalSameBallIdIndexes);

  let downToUpDiagonalSameBallIdIndexes =
    setDownToUpDiagonalSameBallsArray(gameArray);
  checkThaNearBallsCount(gameArray, downToUpDiagonalSameBallIdIndexes);
};

const gameOver = (gameArray) => {
  let ballsCount = 0;
  for (let i = 0; i < gameArray.length; i++) {
    for (let j = 0; j < gameArray.length; j++) {
      if (gameArray[i][j] < 0) {
        ballsCount++;
      }
      if (ballsCount >= 79 && ballsCount <= 81) {
        createPlayGround(gameArray);
        setTimeout(() => {
          alert("GAME OVER !!! Your score is " + scoreValue);
          deleteAllChildElements("gameBoard");
        }, 200);
      }
    }
  }
};

const createPlayGround = (gameArray) => {
  deleteAllChildElements("gameBoard");
  const board = document.getElementById("gameBoard");

  for (let i = 0; i < gameArray.length; i++) {
    for (let j = 0; j < gameArray.length; j++) {
      let div = document.createElement("div");
      board.appendChild(div);
      const cellValue = gameArray[i][j];
      div.appendChild(getImage(cellValue));
      div.addEventListener("click", function () {
        if (cellValue !== 0) {
          setClassToCertainDiv(div);
          ballFirstLoc = [i, j];
        } else {
          ballTargetLoc = [i, j];
          if (ballFirstLoc.length !== 0) {
            const [x, y] = ballFirstLoc;
            ballId = gameArray[x][y];
            gameArray[x][y] = 1;
            arrValue = gameArray[x][y];
            const wavedArr = sendWaveStarttoTarget(gameArray);
            const stepsArr = setStepsArray(wavedArr);
            moveBall(gameArray, stepsArr);
            modeBalls.forEach((ball) => {
              setEachBallLocation(gameArray, ball);
            });
            createMode();
            createPlayGround(gameArray);
            deleteCheckedBalls(gameArray);
            gameOver(gameArray);
          }
          ballFirstLoc = [];
        }
      });
    }
  }
};

const createMode = () => {
  deleteAllChildElements("mode");
  const newRandomBalls = getNewArrFromBallsArr();
  const mode = document.getElementById("mode");
  newRandomBalls.map((newball) => {
    mode.appendChild(getImage(newball));
  });
};

const addNewGameBtnEvent = () => {
  const btn = document.getElementById("newGame");
  btn.addEventListener("click", function () {
    const gameArray = createMatrix();
    const newArray = setBallsLocInMatrix(gameArray);
    createPlayGround(newArray);
    createMode();
  });
};

const setScore = () => {
  const score = document.getElementById("score");
  score.innerHTML = "SCORE " + scoreValue;
};
addNewGameBtnEvent();
setScore();
