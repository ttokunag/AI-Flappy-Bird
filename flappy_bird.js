/*
* This flappy_bird.js file contains all codes related to the
* gaming User Interface.
*/

/* game functionalities are below */
const TOTAL = 500; // the number of samples
let w = 45; let h = Math.floor(w * 0.7036);
let playerBird;
let birds = [];
let savedBirds = []; // arrays to store hit bird neurons
let pipes = [];
let closest;
let nnCanvas;
let playMode = false;
let playerPaused = true;
let gameIsOver = false;
let loopPaused = true;
let analysisMode = false;
/* images are below */
let birdImg;
let pipeImg; let pipeTopImg;
let bgImg;
/* dynamic html elements are below */
let siteTitle;
let playModeButton;
let aiModeButton;
let pauseButton;
let analysisButton;
let counter = 0; // counts drawing phase
let currentGameScore = 0;
let highestGameScore = -Infinity;
let currentNeuron = 0; // measures a current neuron performance
let highestNeuron = -Infinity; // highest neuron performance
let slider;
/* 
* slider determines how many operations done every drawing phase 
* the larger the faster drawn movement looks
*/
let isSmartPhone = false;

function preload() {
  birdImg = loadImage('images/flappy_bird.png');
  bgImg = loadImage('images/red_sky_bg.jpg');
  pipeImg = loadImage('images/pipe.png');
  pipeTopImg = loadImage('images/pipes_top.png');
}

function setup() {
  // the following checks if user device is a smartphone
  if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i)
  || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) 
  || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i)
  || navigator.userAgent.match(/Windows Phone/i)) {
    nnCanvas = createCanvas(windowWidth, windowHeight / 1.6);
    isSmartPhone = true;
  } 
  else {
    nnCanvas = createCanvas(windowWidth / 1.5, windowHeight / 1.6);
  }
  nnCanvas.mousePressed(canvasPressed);
  nnCanvas.parent('nn-sketch');
  /* initialize birds */
  for (let i = 0; i < TOTAL; i++) {
    birds[i] = new Bird();
  }
  objectInit();
}

function objectInit() {
  siteTitle = createElement('p', 'AI Flappy Bird');
  siteTitle.parent('site-title');

  aiModeButton = createButton('AI Mode');
  aiModeButton.mousePressed(toggleAiMode);
  aiModeButton.parent('scores');
  aiModeButton.class('selected-button');

  playModeButton = createButton('Player Mode');
  playModeButton.mousePressed(togglePlayMode);
  playModeButton.parent('scores');
  playModeButton.class('button');

  slider = createSlider(1, 20, 5);
  slider.parent('speed-slider');
  slider.class('slider');
  if (isSmartPhone) {
    slider.style('width', '55%')
  }

  pauseButton = createButton('Start AI');
  pauseButton.mousePressed(toggleLoop);
  pauseButton.parent('control-buttons');
  pauseButton.class('button');

  analysisButton = createButton('Turn On Analysis');
  analysisButton.mousePressed(analyze);
  analysisButton.parent('control-buttons');
  analysisButton.class('button');
}

function draw() {
  /* background image of the game canvas */
  image(bgImg, 0, 0, width, height);


  /* When the AI mode is ON */
  if (!playMode) {
    if (!loopPaused) {
      // this for-loop speeds up the drawing 
      // (it doesn't affect the NN-learning process)
      for (let t = 0; t < slider.value(); t++) {
        if (counter % 75 == 0) { // every 75 drawings add a new pipe
          pipes.push(new Pipe());
          if (closest == null) {
            closest = pipes[0];
          }
        }
        counter++;
        currentGameScore = floor(counter / 75);
    
        for (let i = pipes.length - 1; i >= 0; i--) {
          pipes[i].update();
    
          // check if each bird hits pipes. if so delete it
          for (let j = birds.length - 1; j >= 0; j--) {
            if (pipes[i].hits(birds[j])) {
              savedBirds.push(birds.splice(j, 1)[0]);
            }
          }
          // if pipes are off the screen, delete it.
          if (pipes[i].offscreen()) {
            pipes.splice(i, 1);
          }
        }
    
        // checks if birds are off the screen
        for (let i = birds.length - 1; i >= 0; i--) {
          if (birds[i].offScreen()) {
            savedBirds.push(birds.splice(i, 1)[0]);
          }
        }
    
        // lets birds neurons think of the next movement
        for (let bird of birds) {
          bird.think(pipes);
          bird.update();
          currentNeuron = bird.score;
        }
        // if all birds hit pipes, starts the next learning phase
        if (birds.length === 0) {
          counter = 0;
          currentGameScore = 0;
          nextGeneration();
          pipes = [];
        }
      }

      /* draw triangles (KEEP THIS POSITION)*/
      for (let i = 0; i < birds.length; i++) {
        // birds[i].show();
        if (analysisMode) {
          if (birds[i].x < closest.x) {
            if (birds[i].velocity < 0) {
              stroke(255, 0, 0, 50); fill(255, 0, 0, 50);
            } else {
              stroke(0, 0, 255, 50); fill(0, 0, 255, 50);
            }
            triangle(
              birds[i].x, birds[i].y, 
              closest.x + closest.w/2, closest.top, 
              closest.x + closest.w/2, height - closest.bottom);
          }
        }
      }
    }
    /* shows the birds */
    for (let bird of birds) {
      bird.show();
    }
  }
  else if (playMode) {
    if (playerPaused) {
      if (!gameIsOver) {
        textSize(15); noStroke();
        text('Hit SPACE to fly', width / 2.05, height/7 + 30);
      } 
    } else {
      if (counter % 75 == 0) {
        pipes.push(new Pipe());
      }
      counter++;
      currentGameScore = floor(counter / 75);
      
      playerBird.update();
      // playerBird.show();

      /* when the game is over for getting off-screen */
      if (playerBird.offScreen()) {
        gameIsOver = true;
        playerPaused = true;
      }

      // pipes updates
      for (let i = pipes.length-1; i >= 0; i--) {
        pipes[i].update();
        /* when the game is over for hitting */
        if (pipes[i].hits(playerBird)) {
          gameIsOver = true;
          playerPaused = true;
        }

        if (pipes[i].offscreen()) {
          pipes.splice(i, 1);
        }
      }
    }
    playerBird.show();
  }

  /* shows the pipes */
  for (let pipe of pipes) {
    pipe.show();
  }

  /* shows the game mode */
  fill(255); noStroke();
  textSize(15); textAlign(LEFT); textStyle(BOLD);
  text(playMode ? 'Player Mode' : 'AI Mode', width/35, height/18);

  /* displays game scores */
  stroke(0); strokeWeight(4);
  textSize(28); textAlign(CENTER);
  text(currentGameScore, width / 2.05, height / 7);

  /* game over "front" ground */
  if (gameIsOver) {
    playerBird.update();
    background(60, alpha=150);
    textSize(32); strokeWeight(1);
    text('GAME OVER', width/2, height/2);
    textSize(15); textStyle(NORMAL);
    text('Hit ENTER to restart', width/2, height/2 + 30);
  }
}

function keyPressed() {
  if (gameIsOver && keyCode === ENTER) {
    gameIsOver = false;
    resetGame();
  }
  else if (!gameIsOver && playMode && key == ' ') {
    if (playerPaused) {
      playerPaused = false;
    }
    playerBird.up();
  }
}

function canvasPressed() {
  if (gameIsOver) {
    gameIsOver = false;
    resetGame();
  }
  else if (!gameIsOver && playMode) {
    if (playerPaused) {
      playerPaused = false;
    }
    playerBird.up();
  }
}

function togglePlayMode() {
  if (!playMode) {
    /* toggle button appearances */
    playModeButton.removeClass('button');
    playModeButton.class('selected-button');
    aiModeButton.removeClass('selected-button');
    aiModeButton.class('button');

    /* initialize the player mode state */
    resetGame();
  }
}

function toggleAiMode() {
  if (playMode) {
    /* toggle button appearances */
    playModeButton.removeClass('selected-button');
    playModeButton.class('button');
    aiModeButton.removeClass('button');
    aiModeButton.class('selected-button');
    
    /* initializes the AI mode state */
    resetAI();
  }
}

function resetGame() {
  /* reset game functionalities */
  pipes = [];
  playerBird = new Bird();
  currentGameScore = 0;
  counter = 0;
  playMode = true;
  playerPaused = true;
  /* reset elements appearances */
  pauseButton.removeClass('button');
  pauseButton.class('disabled-button');
  analysisButton.removeClass('button');
  analysisButton.class('disabled-button');
  slider.removeClass('slider');
  slider.class('disabled-slider');
}

function resetAI() {
  /* reset game functionalities */
  pipes = [];
  for (let i = 0; i < TOTAL; i++) { // initializes birds
    birds[i] = new Bird();
  }
  counter = 0; currentGameScore = 0;
  loopPaused = true;
  playMode = false;
  gameIsOver = false;
  /* reset elements appearances */
  pauseButton.html('Start AI')
  pauseButton.removeClass('disabled-button');
  pauseButton.class('button');
  analysisButton.removeClass('disabled-button');
  analysisButton.class('button');
  slider.removeClass('disabled-slider');
  slider.class('slider');
}

function toggleLoop() {
  if (loopPaused) {
    pauseButton.html('PAUSE');
  } else {
    pauseButton.html('RESUME');
  }
  loopPaused = !loopPaused;
}

function analyze() {
  if (analysisMode) {
    analysisMode = false;
    analysisButton.html('Turn On Analysis');
  } else {
    analysisMode = true;
    analysisButton.html('Turn Off Analysis');
  }
}