const FPS = 30;
const DIM_X = 9;
const DIM_Y = 16;
const RATIO = DIM_X / DIM_Y;

const BRICK_ROWS = 9;

const DEBUG = false;

let cnv;
let tileW;
let tileH;
let pixel;

let paddleX;
let paddleY;
let paddleW;
let paddleH;
let paddleVx = 4;

let ballX;
let ballY;
let ballW;
let ballH;
let ballVx = 0;
let ballVy = 3;

let brickness;
let bricks = [];


let bufferX;

let score;

let lives;

let paused;

function setup() {
    frameRate(FPS);
    rectMode(CORNER);
    ellipseMode(RADIUS);

    let w = windowHeight * RATIO;
    let h = windowHeight;
    let max = Math.max(windowHeight, windowWidth);
    if (max == windowHeight) {
        w = windowWidth;
        h = windowWidth / RATIO;
    }
    w = Math.floor(w - (w % DIM_X));
    h = Math.floor(h - (h % DIM_Y));
    cnv = createCanvas(w, h);
    cnv.parent('game');
    tileW = Math.floor(width / DIM_X);
    tileH = Math.floor(height / DIM_Y);
    pixel = Math.floor((tileW / 16 + tileH / 16) / 2);

    // Set up paddle
    paddleX = tileW * DIM_X / 2;
    paddleY = height - tileH;
    paddleW = tileW * 2;
    paddleH = pixel * 4
    paddleVx = 8 * tileW / FPS;

    // Set up ball
    ballX = paddleX;
    ballY = height / 2 ;
    ballW = tileW / 2;
    ballH = tileH / 2;
    ballVx = 0;
    ballVy = 5 * tileH / FPS;

    // Set up bricks
    brickness = pixel * 6;
    for (let y = 0; y < BRICK_ROWS; y++) {
        for (let x = 0; x < DIM_X; x++) {
            let a = x * tileW;
            let b = y * brickness + tileH;
            bricks.push([a, b]);
            console.log(a, b);
        }
    }
    
    // Misc
    bufferX = tileW / 6;
    score = 0;
    lives = 3;
    paused = false;

    // Controls
    cnv.touchStarted(movePaddleForTouch);
    cnv.touchMoved(movePaddleForTouch);
}

function draw() {
    background(0);


    // Update paddle
    //paddleX += paddleVx;
    if (keyIsDown(LEFT_ARROW) && paddleX >= (paddleW / 2) + paddleVx) {
        paddleX -= paddleVx;
    } else if (keyIsDown(RIGHT_ARROW) && paddleX <= width - (paddleW / 2) - paddleVx) {
        paddleX += paddleVx;
    } 


    // Update ball
    ballX += ballVx;
    ballY += ballVy;

    // Update bricks
    for (let i = 0; i < bricks.length; i++) {
        if (bricks[i] === false) {
            continue;
        }
        let x = bricks[i][0];
        let y = bricks[i][1];

        // let collide = rectIntersectRect(ballX - ballH / 2, ballY - ballY / 2, ballW, ballH, x, y, tileW, tileH);
        // if (collide) {
        //     ballVx = collide[0] * Math.abs(ballVx);
        //     ballVy = collide[1] * Math.abs(ballVy);
        // }

        // let collide = circleIntersectRect(ballX, ballY, ballW / 2, x, y, tileH, brickness);
        // if (collide !== false) {
        //     let collX, collY;

        //     ballVx = collide[1] * Math.abs(ballVx);
        //     ballVy = collide[0] * Math.abs(ballVy);
        //     bricks[i] = false;
        //     score++;
        // }

        if (ballX > x && ballX < x + tileW) {
            if (ballY >= y && ballY < y + brickness + (ballH / 2)) {
                ballVy = -1 * ballVy;
                bricks[i] = false;
                score++;
            }
        }
        if (ballX >= x - ballW / 2 && ballX <= x + tileW + ballH / 2) {
            if (ballY >= y && ballY <= y + brickness) {
                ballVx = -1 * ballVx;
                bricks[i] = false;
                score++;
            }
        }
    }

    // Check collisions
    //paddleCollide();
    ballCollide();
    ballCollideWithPaddle();

    drawPaddle(paddleX, paddleY);
    drawBall(ballX, ballY);
    stroke(255);
    strokeWeight(pixel / 2);
    for (let i = 0; i < bricks.length; i++) {
        if (bricks[i] !== false) {
            drawBrick(bricks[i][0], bricks[i][1]);
        }
    }
    
    // Debug
    if (DEBUG === true) {
        drawIndicators();
    }

    // Draw score
    noStroke();
    fill(255);
    textSize(pixel * 6);
    text("Score: " + score, pixel * 4, pixel * 6, width - tileW, textSize())
    //let ang = frameRate().toFixed(2);
    //text(ang, width / 2 - tileW / 2 - textWidth(ang) / 2, tileH / 6, textWidth(ang), tileH);

    // Draw lives
    for (let i = 0; i < lives; i++) {
        drawBall(width - (tileW / 2) - i * (tileW * 2 / 3), tileH / 2);
    }

    // Pause game
    if (paused === true) {
        drawPaused();
    }

    // Finish game
    if (lives < 0) {
        gameOver();
    }
}

function drawPaddle(x, y) {
    noStroke();
    fill(255);
    rect(x - (paddleW / 2), y - paddleH, paddleW, paddleH, paddleH);
}

function drawBall(x, y) {
    noStroke();
    fill(color("#EB471f"))
    ellipse(x, y, ballW / 2, ballH / 2);
}


function drawIndicators() {
    strokeWeight(4);
    stroke(color(0, 255, 0));
    point(paddleX, paddleY);
    stroke(color(0, 255, 255));
    point(ballX, ballY);
    strokeWeight(pixel);
    stroke(255);
    line(0, tileH, width, tileH);
    line(bufferX, 0, bufferX, height);
    line(width - bufferX, 0, width - bufferX, height);


    // Ball vector
    stroke(255);
    let vec;
    let useLine = true;
    if (useLine === true) {
        strokeWeight(pixel);
        vec = calculateBallVector(ballX, ballY, ballVx, ballVy, Math.sqrt(ballVx * ballVx + ballVy * ballVy) * tileH / 8);
        line(ballX, ballY, vec[0], vec[1]);
    } else {
        strokeWeight(4 * pixel);
        vec = calculateBallVector(ballX, ballY, ballVx, ballVy, ballW / 2);
        point(vec[0], vec[1]);
    }
    fill(255);
    noStroke();
    let debugString = "v: (" + ballVx.toFixed(1) + ", " + ballVy.toFixed(1) + ")";
    debugString += "\npt: (" + vec[0].toFixed(1) + ", " + vec[1].toFixed(1) + ")";
    debugString += "\ntheta: " + vec[2].toFixed(3);
    text(debugString, tileW / 5, height - tileH * 2);
}

function calculateBallVector(x, y, vx, vy, r) {
    let vMag = vx * vy;
    let theta = Math.atan2(vy, vx);
    let rx = r * Math.cos(theta);
    let ry = r * Math.sin(theta);
    let ptx = x + rx;
    let pty = y + ry;
    return [ptx, pty, theta];
}

function paddleCollide() {
    if (paddleX < paddleW / 2) {
        paddleX = paddleW / 2;
    }
    if (paddleX > width - (paddleW / 2)) {
        paddleX = width - (paddleW / 2);
    }
    
}

function ballCollide() {
    if (ballX <= (ballW / 2)) {
        ballVx = Math.abs(ballVx);
    }
    if (ballX >= width - (ballW / 2)) {
        ballVx = -1 * Math.abs(ballVx);
    }
    if (ballY <= (ballH / 2) + tileH) {
        ballVy = Math.abs(ballVy);
    }
    if (ballY >= height + (ballH / 2) - (tileH / 3)) {
        ballVx = 0;
        ballVy = Math.abs(ballVy);
        ballX = width / 2;
        ballY = height * 2 / 3;
        lives--;
    }
}

function gameOver() {
    fill(color(128, 128));
    rect(0, 0, width, height);
    textSize(tileW);

    let over = "Game Over";
    let textX = width / 2 - textWidth(over) / 2;
    let textY = height / 2;
    fill(0);
    rect(textX - tileW / 2, textY - tileH * 4 / 3, textWidth(over) + tileW, textSize() + tileH);
    
    fill(color(255, 64, 64));
    text(over, textX, textY);
    noLoop();
}

function ballCollideWithPaddle() {
    let diffX = -1 * (paddleX - ballX)
    let halfPaddle = paddleW / 2;
    let halfBallW = ballW / 2;
    let halfBallH = ballH / 2;
    if (ballY + halfBallH + ballVy >= paddleY - paddleH && ballY - halfBallH + ballVy <= paddleY - paddleH / 2) {
        if (ballX + halfBallW + ballVx >= paddleX - halfPaddle && ballX - halfBallW + ballVx <= paddleX + halfPaddle) {
            ballVy = -1 * Math.abs(ballVy);
            ballVx = (5 * tileW * (diffX / halfPaddle)) / FPS;
        }
    }
}

function drawBrick(x, y) {
    stroke(255);
    fill(color(128, 255 * (x / width), 255 * (y / (6 * tileH))));
    rect(x, y, tileW, brickness);
}

function circleIntersectRect(x1, y1, r, x2, y2, w, h) {
    let tx = x1;
    let ty = y1;

    let a = 1;
    let b = 1;

    if (x1 < x2) {
        tx = x2;
        a = -1;
    } else if (x1 > x2 + w) {
        tx = x2 + w;
        a = 1;
    }
    if (y1 < y2) {
        ty = y2;
        b = -1;
    } else if (y1 > y2 + h) {
        ty = y2 + h;
        b = 1;
    }

    let x = x1 - tx;
    let y = y1 - ty;
    let R = Math.sqrt(x * x + y * y);
    if (R <= r) {
        return [a, b];
    }
    return false;
}

function calculateAngle(vX, vY) {
    let angle;
    if (vX === 0) {
        angle = Math.PI / 2;
    } else {
        angle = Math.tan(vY / vX);
    }
    return angle.toFixed(3);
}

function rectIntersectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
    let a = 1;
    let b = 1;
    
    if (x1 + w1 >= x2) {
        a = -1;
    } else if (x1 <= x2 + w2) {
        a = 1;
    }

    if (y1 + h1 >= y2) {
        b = -1;
    } else if (y1 <= y2 + h2) {
        b = 1;
    }

    return [a, b];
}

function drawPaused() {
    fill(200, 128);
    noStroke();
    rect(0, 0, width, height);

    let boxX = width / 2 - tileW * 1.5;
    let boxY = height / 2 - tileH * 1.5;
    fill(0);
    rect(boxX, boxY, tileW * 3, tileH * 3);

    let w = pixel * 2;
    let barX = boxX + tileW - w;
    let barY = boxY + tileH - w;
    fill(255);
    rect(barX, barY, w, tileH + 2 * w);
    rect(barX + tileW + w, barY, w, tileH + 2 * w);
}

function keyTyped() {
    if (key == ' ') {
        paused = !paused;
    }

    if (paused === true) {
        noLoop();
    } else if (!paused) {
        loop();
    }
}

function movePaddleForTouch() {
    let x, y;
    for (let t = 0; t < touches.length; t++) {
        x = touches[t].x;
        y = touches[t].y;

        if (y > paddleY - tileH && y < paddleY + tileH) {
            if (x > paddleX - paddleW / 2 && x < paddleX + paddleW / 2) {
                paddleX = x;
            }
        }
    }
    paddleCollide();
}

function movePaddleForMouse() {
    let x = mouseX;
    let y = mouseY;

    if (y > paddleY - tileH && y < paddleY + tileH) {
        if (x > paddleX - paddleW / 2 && x < paddleX + paddleW / 2) {
            paddleX = x;
        }
    }
    paddleCollide();
}

function mousePressed() {
    movePaddleForMouse();
}

function mouseDragged() {
    movePaddleForMouse();
}