function newElement(tagName, className) {
  const elem = document.createElement(tagName);
  elem.className = className;
  return elem;
}

function Barrier(reverse = false) {
  this.element = newElement('div', 'barreira');

  const border = newElement('div', 'borda');
  const body = newElement('div', 'corpo');
  this.element.appendChild(reverse ? body : border);
  this.element.appendChild(reverse ? border : body);

  this.setHeight = height => body.style.height = `${height}px`;
}

function DoubleBarrier(height, gap, x) {
  this.element = newElement('div', 'par-de-barreiras');

  this.higher = new Barrier(true);
  this.bottom = new Barrier(false);

  this.element.appendChild(this.higher.element);
  this.element.appendChild(this.bottom.element);

  this.randomGap = () => {
    const heightHigher = Math.random() * (height - gap);
    const heightBottom = height - gap - heightHigher;
    this.higher.setHeight(heightHigher);
    this.bottom.setHeight(heightBottom);
  }

  this.getX = () => parseInt(this.element.style.left.split('px')[0]);
  this.setX = x => this.element.style.left = `${x}px`;
  this.getWidth = () => this.element.clientWidth;

  this.randomGap();
  this.setX(x);
}

function Barriers(height, width, gap, space, notifyScore) {
  this.doubles = [
    new DoubleBarrier(height, gap, width),
    new DoubleBarrier(height, gap, width + space),
    new DoubleBarrier(height, gap, width + space * 2),
    new DoubleBarrier(height, gap, width + space * 3)
  ];

  const moviment = 3;
  this.animate = () => {
    this.doubles.forEach(double => {
      double.setX(double.getX() - moviment);

      if(double.getX() < -double.getWidth()) {
        double.setX(double.getX() + space * this.doubles.length);
        double.randomGap();
      }

      const middle = width / 2;
      const crossMiddle = double.getX() + moviment >= middle && double.getX() < middle;
      if(crossMiddle) notifyScore();
    });
  }
}

function Bird(gameHeight) {
  let flying = false;

  this.element = newElement('img', 'passaro');
  this.element.src = 'imgs/passaro.png';

  this.getY = () => parseInt(this.element.style.bottom.split('px')[0]);
  this.setY = y => this.element.style.bottom = `${y}px`;

  window.onkeydown = e => flying = true;
  window.onkeyup = e => flying = false;

  this.animate = () => {
    const newY = this.getY() + (flying ? 8 : -5);
    const maxHeight = gameHeight - this.element.clientHeight;

    if(newY <= 0) {
      this.setY(0);
    } else if (newY >= maxHeight) {
      this.setY(maxHeight);
    } else {
      this.setY(newY);
    }
  }

  this.setY(gameHeight / 2);
}

function Progress() {
  this.element = newElement('span', 'progresso');
  this.updateScore = score => {
    this.element.innerHTML = score;
  }
  this.updateScore(0);
}

function overlapping(elementA, elementB) {
  const a = elementA.getBoundingClientRect();
  const b = elementB.getBoundingClientRect();

  const horizontal = a.left + a.width >= b.left
    && b.left + b.width >= a.left;
  const vertical = a.top + a.height >= b.top
    && b.top + b.height >= a.top;
  return horizontal && vertical;
}

function crash(bird, barriers) {
  let crash = false;

  barriers.doubles.forEach(doubleBarriers => {
    if(!crash) {
      const higher = doubleBarriers.higher.element;
      const bottom = doubleBarriers.bottom.element;
      crash = overlapping(bird.element, higher)
        || overlapping(bird.element, bottom);
    }
  });
  return crash;
}

function FlappyBird() {
  let score = 0;

  const gameArea = document.querySelector('[wm-flappy]');
  const height = gameArea.clientHeight;
  const width = gameArea.clientWidth;

  const progress = new Progress();
  const barriers = new Barriers(height, width, 200, 400,
    () => progress.updateScore(++score));
  const bird = new Bird(height);

  gameArea.appendChild(progress.element)
  gameArea.appendChild(bird.element);
  barriers.doubles.forEach(double => gameArea.appendChild(double.element));

  this.start = () => {
    const timer = setInterval(() => {
      barriers.animate();
      bird.animate(); 

      if(crash(bird, barriers)) {
        clearInterval(timer);
      }
    }, 20);
  }
}

new FlappyBird().start();