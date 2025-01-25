class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            size: 10,
            dx: 5,
            dy: 5,
            speed: 5
        };
        
        this.paddleHeight = 100;
        this.paddleWidth = 10;
        this.paddleSpeed = 8;
        
        this.leftPaddle = {
            x: 50,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            score: 0
        };
        
        this.rightPaddle = {
            x: this.canvas.width - 50 - this.paddleWidth,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            score: 0
        };
        
        this.keys = {};
        this.setupInputs();
        
        this.isSinglePlayer = true;
        this.aiDifficulty = 0.8;
        
        // Add AI target position
        this.aiTargetY = this.rightPaddle.y;
        
        this.setupMenu();
        this.gameLoop();
    }
    
    setupInputs() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    setupMenu() {
        const singlePlayerBtn = document.getElementById('singlePlayerBtn');
        const multiPlayerBtn = document.getElementById('multiPlayerBtn');
        
        singlePlayerBtn.addEventListener('click', () => {
            this.isSinglePlayer = true;
            singlePlayerBtn.classList.add('active');
            multiPlayerBtn.classList.remove('active');
            this.resetGame();
        });
        
        multiPlayerBtn.addEventListener('click', () => {
            this.isSinglePlayer = false;
            multiPlayerBtn.classList.add('active');
            singlePlayerBtn.classList.remove('active');
            this.resetGame();
        });
    }
    
    resetGame() {
        this.leftPaddle.score = 0;
        this.rightPaddle.score = 0;
        this.resetBall();
    }
    
    update() {
        // Move left paddle (player 1)
        if (this.keys['w'] && this.leftPaddle.y > 0) {
            this.leftPaddle.y -= this.paddleSpeed;
        }
        if (this.keys['s'] && this.leftPaddle.y < this.canvas.height - this.paddleHeight) {
            this.leftPaddle.y += this.paddleSpeed;
        }
        
        // Handle right paddle movement
        if (this.isSinglePlayer) {
            this.updateAI();
        } else {
            // Existing player 2 controls
            if (this.keys['ArrowUp'] && this.rightPaddle.y > 0) {
                this.rightPaddle.y -= this.paddleSpeed;
            }
            if (this.keys['ArrowDown'] && this.rightPaddle.y < this.canvas.height - this.paddleHeight) {
                this.rightPaddle.y += this.paddleSpeed;
            }
        }
        
        // Move ball
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Ball collision with top and bottom walls
        if (this.ball.y <= 0 || this.ball.y >= this.canvas.height) {
            this.ball.dy *= -1;
        }
        
        // Ball collision with paddles
        this.checkPaddleCollision();
        
        // Score points
        this.checkScoring();
    }
    
    updateAI() {
        // Predict where the ball will intersect with AI paddle's x position
        if (this.ball.dx > 0) { // Only track ball when it's moving towards AI
            const slope = this.ball.dy / this.ball.dx;
            const intersectY = this.ball.y + slope * (this.rightPaddle.x - this.ball.x);
            
            // Account for bounces
            let targetY = intersectY;
            const courtHeight = this.canvas.height;
            
            // Adjust for bounces off top and bottom
            while (targetY < 0 || targetY > courtHeight) {
                if (targetY < 0) {
                    targetY = -targetY;
                }
                if (targetY > courtHeight) {
                    targetY = 2 * courtHeight - targetY;
                }
            }
            
            // Set AI target with some randomization for difficulty
            this.aiTargetY = targetY - this.paddleHeight / 2;
            this.aiTargetY += (Math.random() - 0.5) * this.paddleHeight * (1 - this.aiDifficulty);
        }
        
        // Move towards target position
        const moveSpeed = this.paddleSpeed * this.aiDifficulty;
        if (this.rightPaddle.y + this.paddleHeight / 2 < this.aiTargetY) {
            this.rightPaddle.y += moveSpeed;
        } else if (this.rightPaddle.y + this.paddleHeight / 2 > this.aiTargetY) {
            this.rightPaddle.y -= moveSpeed;
        }
        
        // Keep paddle within bounds
        if (this.rightPaddle.y < 0) {
            this.rightPaddle.y = 0;
        }
        if (this.rightPaddle.y > this.canvas.height - this.paddleHeight) {
            this.rightPaddle.y = this.canvas.height - this.paddleHeight;
        }
    }
    
    checkPaddleCollision() {
        // Left paddle collision
        if (this.ball.x <= this.leftPaddle.x + this.paddleWidth &&
            this.ball.y >= this.leftPaddle.y &&
            this.ball.y <= this.leftPaddle.y + this.paddleHeight) {
            this.ball.dx *= -1;
            this.adjustBallAngle(this.leftPaddle);
        }
        
        // Right paddle collision
        if (this.ball.x >= this.rightPaddle.x - this.ball.size &&
            this.ball.y >= this.rightPaddle.y &&
            this.ball.y <= this.rightPaddle.y + this.paddleHeight) {
            this.ball.dx *= -1;
            this.adjustBallAngle(this.rightPaddle);
        }
    }
    
    adjustBallAngle(paddle) {
        const impact = (this.ball.y - paddle.y) / this.paddleHeight;
        this.ball.dy = this.ball.speed * (impact - 0.5) * 2;
    }
    
    checkScoring() {
        if (this.ball.x <= 0) {
            this.rightPaddle.score++;
            this.resetBall();
        } else if (this.ball.x >= this.canvas.width) {
            this.leftPaddle.score++;
            this.resetBall();
        }
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = this.ball.speed * (Math.random() < 0.5 ? 1 : -1);
        this.ball.dy = this.ball.speed * (Math.random() * 2 - 1);
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw center line
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.strokeStyle = '#fff';
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw paddles
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.leftPaddle.x, this.leftPaddle.y, this.paddleWidth, this.paddleHeight);
        this.ctx.fillRect(this.rightPaddle.x, this.rightPaddle.y, this.paddleWidth, this.paddleHeight);
        
        // Draw ball
        this.ctx.fillRect(this.ball.x - this.ball.size / 2, this.ball.y - this.ball.size / 2, this.ball.size, this.ball.size);
        
        // Draw scores
        this.ctx.font = '48px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.leftPaddle.score, this.canvas.width / 4, 60);
        this.ctx.fillText(this.rightPaddle.score, this.canvas.width * 3 / 4, 60);
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
};