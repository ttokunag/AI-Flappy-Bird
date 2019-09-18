/*
 * Bird class is responsible for how a bird object behaves
 * @param brain: Neural Network which knows the optimal decision to survive
 */
class Bird {
  constructor(brain) {
    // position of a bird
    this.y = height/2;
    this.x = width/4;

    // up & down speed of a bird
    this.gravity = 0.8;
    this.velocity = 0;
    this.lift = 12;

    // measurement of how well a bird movement is
    this.score = 0;
    this.fitness = 0;

    // a bird brain initialization
    if (brain) {
      this.brain = brain.copy();
    } else {
      this.brain = new NeuralNetwork(5, 8, 2);
    }
  }

  /* the appearance of a bird */
  show() {
    // stroke(255, 0, 0);
    // line(this.x - w/2, this.y - h/2, this.x + w/2, this.y - h/2);
    // line(this.x - w/2, this.y + h/2, this.x + w/2, this.y + h/2);
    // line(this.x - w/2, this.y - h/2, this.x - w/2, this.y + h/2);
    // line(this.x + w/2, this.y - h/2, this.x + w/2, this.y + h/2);
    // stroke(0);
    image(birdImg, this.x - w/2, this.y - h/2, w, h);
  }

  /* lifts up a bird */
  up() {
    this.velocity -= this.lift;
  }

  /* this mutates a neuron with a given probability */
  mutate() {
    this.brain.mutate(0.1);
  }

  /*
   * is responsible for how a neuron makes a decision to rise
   * @param pipes: for birds to detect the location of pipes
   */
  think(pipes) {
    // Find the closest pipe
    // closest = null;
    let closestD = Infinity;
    for (let i = 0; i < pipes.length; i++) {
      // distance of a bird and the CENTER of a pipe
      let d = (pipes[i].x + pipes[i].w) - this.x;
      if (d < closestD && d > 0) {
        closest = pipes[i];
        closestD = d;
      }
    }

    /*
     * inputs for the neural network
     * 0: the y-coordinate of a bird
     * 1: the y-velocity of the bird
     * 2: the y-coordinate of the bottom of the upper pipe
     * 3: the y-coordinate of the top of the lower pipe
     * 4: the x-coordinate of the pipe
     */
    let inputs = [];
    inputs[0] = this.y / height;
    inputs[1] = this.velocity / 10;
    inputs[2] = closest.top / height;
    inputs[3] = closest.bottom / height;
    inputs[4] = closest.x / width;
    let output = this.brain.predict(inputs);

    /* whenever the neuron network outputs a valid value, raise it */
    if (output[0] > output[1]) {
      this.up();
    }
  }

  /* detects if a bird is out of the screen */
  offScreen() {
    return (this.y > height || this.y < 0);
  }

  /* updates birds score & its velocity */
  update() {
    this.score++;
    this.velocity += this.gravity;
    this.y += this.velocity;
  }

}