// this generates new birds when all birds died
function nextGeneration() {
    calculateFitness();

    for (let i = 0; i < TOTAL; i++) {
        birds[i] = pickOne();
    }
    savedBirds = [];
}

// returns one bird with a neuron based on its fitness
function pickOne() {
    let index = 0;
    let r = random(1);
  
    while (r > 0) {
      r = r - savedBirds[index].fitness;
      index++;
    }
    index--;
    let savedBird = savedBirds[index];
    let child = new Bird(savedBird.brain); // "crossover"
    child.mutate();
    return child;
}


// this calculates how good each bird is
function calculateFitness() {
    let sum = 0;
    for (let bird of savedBirds) {
        sum += bird.score;
    }
    for (let bird of savedBirds) {
        bird.fitness = bird.score / sum;
    }
}

// mutate: mutate a child DNA with a given probability
// crossover: 2 parents => mix up DNAs