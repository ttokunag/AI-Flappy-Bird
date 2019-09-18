/*
* Pipe class is responsible for how a pipe behaves
* @param: none
*/
class Pipe {
  constructor() {
    this.spacing = 130;
    // the y-coordinate of the upper pipe BOTTOM
    this.top = random(height / 6, 3 / 4 * height);
    // the y-coordinate of the lower pipe TOP
    this.bottom = height - (this.top + this.spacing);
    this.x = width;
    this.w = 60;
    this.speed = 4;
  }

  /*
  * detects if a pipe hits birds
  * @param bird: Bird object
  */
  hits(bird) {
    /* 
    * if the center coordinate of the bird is in the pipe area,
    * this returns true.
    */
    let rightIsCovered = bird.x + w/2 > this.x && bird.x + w/2 < this.x + this.w;
    let leftIsCovered = bird.x - w/2 > this.x && bird.x - w/2 < this.x + this.w;
    if (leftIsCovered || rightIsCovered) {
      if (bird.y - h/2 < this.top || bird.y + h/2 > height - this.bottom) {
        return true;
      }
    }
    return false;
  }

  passes(bird) {
    return (bird.x > this.x);
  }

  /* appears a pipe object */
  show() {
    let pipeW = this.w + 5;
    image(pipeImg, this.x, 0, this.w, this.top);
    image(pipeImg, this.x, height - this.bottom, this.w, this.bottom);
    image(pipeTopImg, this.x-2.5, this.top-(pipeW)*0.4879, pipeW, (pipeW)*0.4879);
    image(pipeTopImg, this.x-2.5, height - this.bottom, pipeW, (pipeW)*0.4879);
  }

  /* updates the x-coordinate of a pipe */
  update() {
    this.x -= this.speed;
  }

  /* detects if a pipe is off screen */
  offscreen() {
    return (this.x < -this.w);
  }
}
