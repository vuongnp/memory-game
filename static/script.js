document.addEventListener('DOMContentLoaded', function() {
    let currentIndex = 0;
    let score = 0;
    let previousImage = null;
    let timer = null;
    let timeLeft = 10;
    let isAnswering = false;
    let gameEnded = false;
    let canShowEndGame = true; // Add this line to track whether endGame should be shown
    
    // Get DOM elements
    const imageElement = document.getElementById('current-image');
    const questionText = document.getElementById('question-text');
    const optionButtons = document.querySelectorAll('.option-btn');
    const optionA = document.getElementById('option-a');
    const optionB = document.getElementById('option-b');
    const optionC = document.getElementById('option-c');
    const optionD = document.getElementById('option-d');
    const feedbackContainer = document.getElementById('feedback-container');
    const scoreElement = document.getElementById('score');
    const timerBar = document.getElementById('timer-bar');
    const timerText = document.getElementById('time-left');
    const gameContainer = document.getElementById('game-container');
    const gameOverContainer = document.getElementById('game-over');
    const gameOverReason = document.getElementById('game-over-reason');
    const finalScoreElement = document.getElementById('final-score');
    const playerRankElement = document.getElementById('player-rank');
    const rankDescriptionElement = document.getElementById('rank-description');
    const rankBadges = document.querySelectorAll('.rank-badge');
    const restartButton = document.getElementById('restart-btn');
    
    // Descriptions for each rank
    const rankDescriptions = {
        "Gà mờ": "Bạn cần luyện tập thêm để cải thiện trí nhớ.",
        "Tiềm năng": "Bạn có tiềm năng, hãy tiếp tục luyện tập để phát triển.",
        "Tài năng": "Bạn có trí nhớ tốt, rất ấn tượng!",
        "Eureka": "Trí nhớ của bạn thật phi thường! Bạn là thiên tài!"
    };
    
    // Effect for loading images
    function applyImageEffect(img) {
        img.style.opacity = '0';
        img.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            img.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
        }, 100);
    }
    
    // Start the game
    startGame();
    
    // Handle when the player selects an answer
    optionButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (isAnswering) return; // Prevent multiple clicks
            isAnswering = true;
            
            // Click effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            const selectedOption = this.getAttribute('data-option');
            checkAnswer(selectedOption);
        });
    });
    
    // Handle the "Restart" button
    restartButton.addEventListener('click', function () {
        // Reset both flags
        gameEnded = false;
        canShowEndGame = true; // Reset this flag too

        // Add click effect
        this.style.transform = 'scale(0.95)';

        console.log('Restart clicked, gameOverContainer state:', {
            display: gameOverContainer.style.display,
            opacity: gameOverContainer.style.opacity 
        });

        setTimeout(() => {
            this.style.transform = '';

            // Reset game state
            currentIndex = 0;
            score = 0;
            previousImage = null;
            isAnswering = false;
            clearInterval(timer); // Clear any running timer
            timeLeft = 10; // Reset the timer
            scoreElement.textContent = '0';

            // Completely reset game over container styles
            gameOverContainer.removeAttribute('style');
            gameOverContainer.style.display = 'none';

            // Reset feedback and options
            feedbackContainer.innerHTML = '';
            feedbackContainer.className = '';
            optionButtons.forEach(button => {
                button.classList.remove('correct', 'incorrect');
                button.disabled = false;
            });

            // Show the game container
            gameContainer.style.display = 'block';

            // Add transition effect for the game container
            setTimeout(() => {
                gameContainer.style.opacity = '1';
                gameContainer.style.transform = 'translateY(0)';
                gameContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

                // Start a new game
                startGame();
            }, 50);
        }, 150);
    });
    
    function startGame() {
        loadQuestion();
    }
    
    function startTimer() {
        // Reset timer
        clearInterval(timer);
        timeLeft = 10;
        timerBar.style.width = '100%';
        timerText.textContent = timeLeft;
        timerBar.className = '';
        timerText.parentElement.className = '';
        
        // Start countdown
        timer = setInterval(function() {
            timeLeft--;
            timerBar.style.width = (timeLeft / 10 * 100) + '%';
            timerText.textContent = timeLeft;
            
            // Add warning effect when time is running out
            if (timeLeft <= 3) {
                timerBar.className = 'danger';
                timerText.parentElement.className = 'pulse';
            } else if (timeLeft <= 6) {
                timerBar.className = 'warning';
            }
            
            // Time's up
            if (timeLeft <= 0) {
                clearInterval(timer);
                timeOut();
            }
        }, 1000);
    }
    
    function timeOut() {
        feedbackContainer.textContent = 'Hết giờ!';
        feedbackContainer.className = 'timeout-feedback';

        // Add shake animation for feedback
        feedbackContainer.style.animation = 'none';
        setTimeout(() => {
            feedbackContainer.style.animation = 'shake 0.5s ease';
        }, 10);

        // Disable all option buttons
        optionButtons.forEach(button => {
            button.disabled = true;
        });

        // Fetch the correct answer and end the game
        const formData = new FormData();
        formData.append('current_index', currentIndex);
        formData.append('score', score);

        fetch('/get_correct_answer', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                // Highlight the correct answer button
                document.querySelector(`[data-option="${data.correct_answer}"]`).classList.add('correct');

                // End the game after a short delay
                setTimeout(() => {
                    // Use the canShowEndGame flag
                    if (canShowEndGame) {
                        canShowEndGame = false; // Prevent multiple calls
                        endGame(score, data.rank || 'Gà mờ', 'Bạn đã hết giờ!');
                    }
                }, 2000); // Wait 2 seconds to let the user see the correct answer
            })
            .catch(error => {
                console.error('Error:', error);
                // Fallback to ensure the game ends even if the fetch fails
                endGame(score, 'Gà mờ', 'Bạn đã hết giờ!');
            });
    }
    
    function moveToNextQuestion() {
        currentIndex++;
        
        // Transition effect for the next question
        gameContainer.style.opacity = '0';
        gameContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            loadQuestion();
            feedbackContainer.innerHTML = '';
            feedbackContainer.className = '';
            isAnswering = false;
            
            // Remove CSS classes from buttons
            optionButtons.forEach(button => {
                button.classList.remove('correct', 'incorrect');
                button.disabled = false;
            });
            
            // Transition effect for the new question
            gameContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            gameContainer.style.opacity = '1';
            gameContainer.style.transform = 'translateY(0)';
        }, 500);
    }
    
    function loadQuestion() {
        const formData = new FormData();
        formData.append('current_index', currentIndex);
        formData.append('score', score);
        
        fetch('/get_question', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.game_over) {
                endGame(data.score, data.rank, 'Bạn đã hoàn thành tất cả các câu hỏi!');
                return;
            }
            
            // Save the current image before changing
            if (imageElement.src) {
                previousImage = imageElement.src.split('/').pop();
            }
            
            // Update image and question
            imageElement.src = `/static/images/${data.image}`;
            
            // Apply effect for the new image
            imageElement.onload = function() {
                applyImageEffect(this);
            };
            
            // Typing effect for the question
            const fullQuestion = data.question;
            questionText.textContent = '';
            let i = 0;
            
            // Fast typing effect
            const typeInterval = setInterval(() => {
                if (i < fullQuestion.length) {
                    questionText.textContent += fullQuestion.charAt(i);
                    i++;
                } else {
                    clearInterval(typeInterval);
                }
            }, 20);
            
            // Update options with appearance effect
            optionButtons.forEach(button => {
                button.style.opacity = '0';
                button.style.transform = 'translateY(10px)';
            });
            
            optionA.textContent = data.options[0];
            optionB.textContent = data.options[1];
            optionC.textContent = data.options[2];
            optionD.textContent = data.options[3];
            
            // Appearance effect for options sequentially
            setTimeout(() => {
                optionButtons.forEach((button, index) => {
                    setTimeout(() => {
                        button.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        button.style.opacity = '1';
                        button.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }, 300);
            
            // Start countdown
            startTimer();
        })
        .catch(error => console.error('Error:', error));
    }
    
    function checkAnswer(selectedOption) {
        // Stop countdown
        clearInterval(timer);
        
        const formData = new FormData();
        formData.append('current_index', currentIndex);
        formData.append('answer', selectedOption);
        formData.append('score', score);
        
        fetch('/check_answer', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Disable all buttons
            optionButtons.forEach(button => {
                button.disabled = true;
            });
            
            // Show feedback with effect
            if (data.correct) {
                feedbackContainer.textContent = 'Chính xác! +1 điểm';
                feedbackContainer.className = 'correct-feedback';
                feedbackContainer.style.animation = 'fadeIn 0.5s ease';
                
                // Score increment effect
                const oldScore = score;
                score++;
                animateScore(oldScore, score);
                
                // Mark the selected button as correct
                const correctButton = document.querySelector(`[data-option="${selectedOption}"]`);
                correctButton.classList.add('correct');
                
                // Add sparkle effect
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle-effect';
                correctButton.appendChild(sparkle);
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 1000);
                
                // Automatically move to the next question after 1.5 seconds
                setTimeout(moveToNextQuestion, 1500);
            } else {
                feedbackContainer.textContent = `Sai rồi! Đáp án đúng là ${data.correct_answer}`;
                feedbackContainer.className = 'incorrect-feedback';
                feedbackContainer.style.animation = 'fadeIn 0.5s ease';

                // Mark the selected and correct buttons
                document.querySelector(`[data-option="${selectedOption}"]`).classList.add('incorrect');
                document.querySelector(`[data-option="${data.correct_answer}"]`).classList.add('correct');

                // End the game if it's over
                if (data.game_over) {
                    setTimeout(() => {
                        // Use the canShowEndGame flag
                        if (canShowEndGame) {
                            canShowEndGame = false; // Prevent multiple calls
                            endGame(data.final_score, data.rank, 'Bạn đã trả lời sai!');
                        }
                    }, 2000); // Wait 2 seconds to let the user see the correct answer
                }
            }
        })
        .catch(error => console.error('Error:', error));
    }
    
    function animateScore(oldScore, newScore) {
        // Jumping number effect
        const duration = 1000;
        const frameRate = 20;
        const frames = duration / frameRate;
        let frame = 0;
        
        const animate = () => {
            frame++;
            const progress = frame / frames;
            const currentValue = Math.floor(oldScore + (newScore - oldScore) * progress);
            
            scoreElement.textContent = currentValue;
            
            if (frame < frames) {
                requestAnimationFrame(animate);
            } else {
                scoreElement.textContent = newScore;
                // Add pulse effect when completed
                scoreElement.style.animation = 'none';
                setTimeout(() => {
                    scoreElement.style.animation = 'pulse 0.5s ease';
                }, 10);
            }
        };
        
        animate();
    }
    
    function endGame(finalScore, rank, reason) {
        gameEnded = true;

        console.log('End game triggered:', { finalScore, rank, reason });

        // Stop countdown if running
        clearInterval(timer);

        // Transition effect for the screen
        gameContainer.style.opacity = '0';
        gameContainer.style.transform = 'translateY(20px)';

        setTimeout(() => {
            // Hide the game screen
            gameContainer.style.display = 'none';

            // Update the Game Over header dynamically
            const gameOverHeader = document.querySelector('.game-over-header');
            const trophyIcon = gameOverHeader.querySelector('i');
            const headerText = gameOverHeader.querySelector('h2');

            if (reason === 'Bạn đã hoàn thành tất cả các câu hỏi!') {
                // Show trophy icon and "Win" text
                trophyIcon.style.display = 'inline-block';
                headerText.textContent = 'Chiến Thắng!';
                headerText.className = 'win-text';
                gameOverReason.style.backgroundColor = '#d4edda'; // Green background for win
            } else {
                // Hide trophy icon and show "Game Over" text
                trophyIcon.style.display = 'none';
                headerText.textContent = 'Kết Thúc Trò Chơi!';
                headerText.className = 'game-over-text';
                gameOverReason.style.backgroundColor = '#f8d7da'; // Red background for game over
            }

            // Show the Game Over screen
            gameOverContainer.style.display = 'flex';
            gameOverContainer.style.opacity = '1';

            // Update content
            gameOverReason.textContent = reason;
            finalScoreElement.textContent = finalScore;
            playerRankElement.textContent = rank;
            rankDescriptionElement.textContent = rankDescriptions[rank];

            // Add corresponding CSS class for the rank
            playerRankElement.className = 'result-value rank ' + rank.toLowerCase();

            // Highlight the current rank badge
            rankBadges.forEach(badge => {
                badge.classList.remove('active');
                if (badge.classList.contains(rank.toLowerCase())) {
                    badge.classList.add('active');
                }
            });

            // Ensure the restart button is displayed and styled correctly
            restartButton.style.display = 'inline-flex';

            // Check screen size and adjust if necessary
            adjustGameOverForScreenSize();
        }, 500);
    }
    
    // Add a new function to adjust the Game Over screen based on screen size
    function adjustGameOverForScreenSize() {
        const gameOverContent = document.querySelector('.game-over-content');
        const windowHeight = window.innerHeight;
        const contentHeight = gameOverContent.scrollHeight;
        
        console.log(`Window height: ${windowHeight}px, Content height: ${contentHeight}px`);
        
        // If content is taller than the screen, adjust for better display
        if (contentHeight > windowHeight * 0.9) {
            console.log("Content too tall, adjusting...");
            
            // Hide badges if the screen is too small
            if (windowHeight < 600) {
                document.querySelector('.rank-badges').style.display = 'none';
            } else {
                document.querySelector('.rank-badges').style.display = 'flex';
            }
            
            // Reduce font size if necessary
            if (windowHeight < 700) {
                gameOverContent.style.fontSize = '0.9rem';
            }
            
            // Ensure the Restart button is always visible
            restartButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            console.log("Content fits well in screen");
            // Reset default values if content fits the screen
            document.querySelector('.rank-badges').style.display = 'flex';
            gameOverContent.style.fontSize = '';
        }
    }
    
    // Add resize event to adjust when screen size changes
    window.addEventListener('resize', function() {
        if (gameOverContainer.style.display !== 'none') {
            adjustGameOverForScreenSize();
        }
    });
    
    // Add CSS effects for animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .sparkle-effect {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
            border-radius: 12px;
            opacity: 0;
            animation: sparkle 1s ease;
            pointer-events: none;
        }
        
        @keyframes sparkle {
            0% { transform: scale(0.5); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
