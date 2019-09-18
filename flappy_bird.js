/*
* This flappy_bird.js file contains all codes related to the
* gaming User Interface.
*/

const TOTAL = 500; // the number of samples
let w = 45; let h = Math.floor(w * 0.7036);
let playMode = false;
let playerBird;
let birds = [];
let savedBirds = []; // arrays to store hit bird neurons
let pipes = [];
let closest;
let nnCanvas;
let playerPaused = true;
let gameIsOver = false;
let loopPaused = false;
let analysisMode = false;

let siteTitle;
let birdImg;
let pipeImg; let pipeTopImg;
let bgImg;
let playModeButton;
let aiModeButton;
let pauseButton;
let analysisButton;
let counter = 0; // counts drawing phase
let currentGameScore = 0;
let highestGameScore = -Infinity;
let currentNeuron = 0; // measures a current neuron performance
let currentNeuronP;
let highestNeuron = -Infinity; // highest neuron performance
let highestNeuronP;
let slider;
/* 
* slider determines how many operations done every drawing phase 
* the larger the faster drawn movement looks
*/

function preload() {
  birdImg = loadImage('images/flappy_bird.png');
  bgImg = loadImage('images/red_sky_bg.jpg');
  pipeImg = loadImage('images/pipe.png');
  pipeTopImg = loadImage('images/pipes_top.png');
}

function setup() {
  nnCanvas = createCanvas(windowWidth / 1.5, windowHeight / 1.6);
  nnCanvas.parent('nn-sketch');
  // playerBird = new Bird();
  for (let i = 0; i < TOTAL; i++) { // initializes birds
    birds[i] = new Bird();
  }
  objectInit();
  loopPaused = true;
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

  // currentNeuronP = createP(`Current Score: ${floor(currentNeuron / 75)} (${currentNeuron} neuron)`);
  // currentNeuronP.parent('scores');

  // highestNeuronP = createP(`Highest Score: ${highestNeuron / 75} (${highestNeuron} neuron)`);
  // highestNeuronP.parent('scores');

  slider = createSlider(1, 20, 5);
  slider.parent('speed-slider');
  slider.class('slider');

  pauseButton = createButton('Start AI');
  pauseButton.mousePressed(toggleLoop);
  pauseButton.parent('control-buttons');
  pauseButton.class('button');

  analysisButton = createButton('Turn On Analysis');
  analysisButton.mousePressed(analyze);
  analysisButton.parent('control-buttons');
  analysisButton.class('button');
}

function togglePlayMode() {
  if (!playMode) {
    playModeButton.removeClass('button');
    playModeButton.class('selected-button');
    aiModeButton.removeClass('selected-button');
    aiModeButton.class('button');
    playerBird = new Bird();
    pipes = []
    // the following leads to the initial phase
    resetGame();
  }
}

function toggleAiMode() {
  if (playMode) {
    playModeButton.removeClass('selected-button');
    playModeButton.class('button');
    aiModeButton.removeClass('button');
    aiModeButton.class('selected-button');
    counter = 0;
    
    resetAI();
  }
}

function draw() {
  if (!playMode) {
    if (loopPaused) {
      image(bgImg, 0, 0, width, height);
      stroke(0); fill(255);
      textSize(27); textStyle(BOLD);
      text(currentGameScore, width / 2.05, height / 7);

      for (let bird of birds) {
        bird.show();
      }
      for (let pipe of pipes) {
        pipe.show();
      }
    }
    else {
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
        // currentNeuronP.html(`Current Score: ${floor(currentNeuron / 75)} (${currentNeuron} neuron)`);
    
        // if all birds hit pipes, starts the next learning phase
        if (birds.length === 0) {
          counter = 0;
    
          // the following updates the displayed scores
          highestNeuron = Math.max(highestNeuron, currentNeuron);
          // highestNeuronP.html(`Highest Score: ${floor(highestNeuron / 75)} (${highestNeuron} neuron)`);
          currentNeuron = 0;
          // currentNeuronP.html(`Current Score: ${floor(currentNeuron / 75)} (${currentNeuron} neuron)`);
    
          nextGeneration();
          pipes = [];
        }
      }
    }
    /* 
    * drawing operations don't affect the neural network
    * process at all, so do it outside the for-loop
    */
    image(bgImg, 0, 0, width, height);
    fill(255); noStroke();
    textSize(15); textAlign(LEFT)
    text('AI Mode', width/35, height/18);
    for (let i = 0; i < birds.length; i++) {
      birds[i].show();
      if (analysisMode) {
        if (birds[i].x < closest.x) {
          if (birds[i].velocity < 0) {
            stroke(255, 0, 0, 50);
            fill(255, 0, 0, 50);
          } else {
            stroke(0, 0, 255, 50);
            fill(0, 0, 255, 50);
          }
          triangle(
            birds[i].x, birds[i].y, 
            closest.x + closest.w/2, closest.top, 
            closest.x + closest.w/2, height - closest.bottom);
        }
      }
    }
    noStroke();
    for (let pipe of pipes) {
      pipe.show();
    }
    stroke(0); fill(255);
    textSize(28); textStyle(BOLD);
    strokeWeight(4);
    textAlign(CENTER);
    text(currentGameScore, width / 2, height / 7);
  }
  // the initial phase of the player mode
  else if (playMode && playerPaused) {
    image(bgImg, 0, 0, width, height);
    stroke(0); fill(255);
    textSize(27); textStyle(BOLD); textAlign(CENTER);
    text(currentGameScore, width / 2.05, height / 7);
    if (!gameIsOver) {
      textSize(15); noStroke();
      text('Hit SPACE to fly', width / 2.05, height/7 + 30);
    }
    fill(255); noStroke();
    textSize(15); textAlign(LEFT)
    text('Player Mode', width/35, height/18);

    playerBird.show();
    for (let pipe of pipes) {
      pipe.show();
    }

    if (gameIsOver) {
      playerBird.update();
      background(60, 60, 60, 150);
      textSize(32);
      textAlign(CENTER);
      text('GAME OVER', width/2, height/2);
      textSize(15);
      textStyle(NORMAL);
      text('Hit ENTER to restart', width/2, height/2 + 30);
    }
  }
  else if (playMode && !playerPaused) {
    image(bgImg, 0, 0, width, height);
    stroke(0); fill(255);
    textSize(27); textStyle(BOLD);
    text(currentGameScore, width / 2.05, height / 7);
    fill(255); noStroke();
    textSize(15); textAlign(LEFT)
    text('Player Mode', width/35, height/18);
    
    playerBird.update();
    playerBird.show();
    if (playerBird.offScreen()) {
      gameIsOver = true;
      playerPaused = true;
    }

    // pipes updates
    for (let i = pipes.length-1; i >= 0; i--) {
      pipes[i].show();
      pipes[i].update();

      if (pipes[i].hits(playerBird)) {
        //TODO: game over phase
        gameIsOver = true;
        playerPaused = true;
      }

      if (pipes[i].offscreen()) {
        pipes.splice(i, 1);
      }
    }

    if (frameCount % 75 == 0) {
      pipes.push(new Pipe());
    }
    counter++;
    currentGameScore = floor(counter / 75);
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

function resetGame() {
  pipes = [];
  playerBird = new Bird();
  currentGameScore = 0;
  counter = 0;
  playMode = true;
  playerPaused = true;
  pauseButton.removeClass('button');
  pauseButton.class('disabled-button');
  analysisButton.removeClass('button');
  analysisButton.class('disabled-button');
  slider.removeClass('slider');
  slider.class('disabled-slider');
}

function resetAI() {
  pipes = [];
  for (let i = 0; i < TOTAL; i++) { // initializes birds
    birds[i] = new Bird();
  }
  counter = 0; currentGameScore = 0;
  loopPaused = true;
  playMode = false;
  gameIsOver = false;
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