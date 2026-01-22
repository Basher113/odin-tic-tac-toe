function MinimaxAI(difficulty = 'hard') {
    const findBestMove = (board, aiMarker, humanMarker) => {
        // Easy: Make random moves most of the time
        if (difficulty === 'easy') {
            if (Math.random() < 0.7) {
                return getRandomMove(board);
            }
        }
        
        // Medium: Mix of random and optimal moves
        if (difficulty === 'medium') {
            if (Math.random() < 0.4) {
                return getRandomMove(board);
            }
        }
        
        // Hard: Always use minimax (optimal play)
        let bestScore = -Infinity;
        let bestMove = null;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === "") {
                    board[i][j] = aiMarker;
                    let score = minimax(board, 0, false, aiMarker, humanMarker);
                    board[i][j] = "";
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { row: i, column: j };
                    }
                }
            }
        }
        return bestMove;
    };

    const getRandomMove = (board) => {
        const availableMoves = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === "") {
                    availableMoves.push({ row: i, column: j });
                }
            }
        }
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    };

    const minimax = (board, depth, isMaximizing, aiMarker, humanMarker) => {
        const result = checkGameState(board, aiMarker, humanMarker);
        
        if (result !== null) {
            return result;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[i][j] === "") {
                        board[i][j] = aiMarker;
                        let score = minimax(board, depth + 1, false, aiMarker, humanMarker);
                        board[i][j] = "";
                        bestScore = Math.max(score, bestScore);
                    }
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[i][j] === "") {
                        board[i][j] = humanMarker;
                        let score = minimax(board, depth + 1, true, aiMarker, humanMarker);
                        board[i][j] = "";
                        bestScore = Math.min(score, bestScore);
                    }
                }
            }
            return bestScore;
        }
    };

    const checkGameState = (board, aiMarker, humanMarker) => {
        // Check winner
        const winner = checkWinnerForMinimax(board);
        if (winner === aiMarker) return 10;
        if (winner === humanMarker) return -10;
        
        // Check draw
        let isFull = true;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === "") {
                    isFull = false;
                    break;
                }
            }
            if (!isFull) break;
        }
        if (isFull) return 0;
        
        return null;
    };

    const checkWinnerForMinimax = (board) => {
        // Check rows
        for (let i = 0; i < 3; i++) {
            if (board[i][0] !== "" && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
                return board[i][0];
            }
        }
        
        // Check columns
        for (let j = 0; j < 3; j++) {
            if (board[0][j] !== "" && board[0][j] === board[1][j] && board[1][j] === board[2][j]) {
                return board[0][j];
            }
        }
        
        // Check diagonals
        if (board[1][1] !== "") {
            if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
                return board[1][1];
            }
            if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
                return board[1][1];
            }
        }
        
        return null;
    };

    return { findBestMove };
}
// END ADDED

function GameBoard() {
    let board = [];
    const rows = 3;
    
    const initialize = () => {
        board = [];
        for (let i = 0; i < rows; i++) {
            board[i] = [];
            for (let j = 0; j < rows; j++) {
                board[i][j] = "";
            }
        }
    };

    initialize();

    const getBoard = () => board;
    let cellMarkedCount = 0;
    
    const cellAllMarked = () => cellMarkedCount === 9;
    
    const pickCell = (row, column, player) => {
        if (board[row][column] !== "") {
            return false;
        }
        cellMarkedCount++;
        board[row][column] = player.marker;
        return true;
    };

    const reset = () => {
        cellMarkedCount = 0;
        initialize();
    };

    return { getBoard, pickCell, cellAllMarked, reset };
}

// MODIFIED: Added difficulty parameter for GameController
function GameController(player1Name, player2Name, isAIMode = false, aiDifficulty = 'medium') {
    const players = [
        { marker: "O", name: player1Name || "Player 1", score: 0, isAI: false },
        { marker: "X", name: player2Name || (isAIMode ? "AI" : "Player 2"), score: 0, isAI: isAIMode }
    ];

    let activePlayerIndex = 0;
    let winner = null;
    let winningCells = [];
    const board = GameBoard();
    const ai = MinimaxAI(aiDifficulty); // MODIFIED: Pass difficulty to AI

    const getActivePlayer = () => players[activePlayerIndex];
    const getPlayers = () => players;
    const getWinner = () => winner;
    const getWinningCells = () => winningCells;

    const playRound = (row, column) => {
        if (winner) return false;

        const picked = board.pickCell(row, column, getActivePlayer());
        if (!picked) return false;

        const result = checkWinner(row, column);
        
        if (result) {
            winner = getActivePlayer();
            winningCells = result.cells;
            winner.score++;
        } else if (board.cellAllMarked()) {
            winner = "draw";
        } else {
            activePlayerIndex = 1 - activePlayerIndex;
        }

        return true;
    };

    // ADDED: AI move method
    const makeAIMove = () => {
        if (winner || !getActivePlayer().isAI) return null;
        
        const currentBoard = board.getBoard();
        const aiMarker = getActivePlayer().marker;
        const humanMarker = players[0].marker;
        
        const move = ai.findBestMove(currentBoard, aiMarker, humanMarker);
        return move;
    };
    // END ADDED

    const checkWinner = (row, column) => {
        const board2d = board.getBoard();
        const marker = getActivePlayer().marker;

        // Check row
        if (board2d[row].every(val => val === marker)) {
            return { cells: [[row, 0], [row, 1], [row, 2]] };
        }

        // Check column
        if (board2d.every(r => r[column] === marker)) {
            return { cells: [[0, column], [1, column], [2, column]] };
        }

        // Check diagonals
        if (board2d[1][1] === marker) {
            if (board2d[0][0] === marker && board2d[2][2] === marker) {
                return { cells: [[0, 0], [1, 1], [2, 2]] };
            }
            if (board2d[0][2] === marker && board2d[2][0] === marker) {
                return { cells: [[0, 2], [1, 1], [2, 0]] };
            }
        }

        return null;
    };

    const resetGame = () => {
        board.reset();
        activePlayerIndex = 0;
        winner = null;
        winningCells = [];
    };

    const resetScores = () => {
        players[0].score = 0;
        players[1].score = 0;
    };

    return {
        playRound,
        getActivePlayer,
        getPlayers,
        getWinner,
        getWinningCells,
        board,
        resetGame,
        resetScores,
        makeAIMove  // ADDED: Export AI move method
    };
}

function ScreenController() {
    let game = null;
    let isAIMode = false; // ADDED: Track game mode
    let aiDifficulty = 'medium'; // ADDED: Track AI difficulty
    
    const setupScreen = document.getElementById('setupScreen');
    const gameScreen = document.getElementById('gameScreen');
    const startBtn = document.getElementById('startBtn');
    const player1NameInput = document.getElementById('player1Name');
    const player2NameInput = document.getElementById('player2Name');
    const player2NameGroup = document.getElementById('player2NameGroup'); // ADDED
    const difficultySelection = document.getElementById('difficultySelection'); // ADDED
    const boardDiv = document.getElementById('board');
    const player1Turn = document.getElementById('player1Turn');
    const player2Turn = document.getElementById('player2Turn');
    const newGameBtn = document.getElementById('newGameBtn');
    const resetScoresBtn = document.getElementById('resetScoresBtn');
    const goBackBtn = document.getElementById('goBackBtn'); // ADDED
    const modeButtons = document.querySelectorAll('.mode-btn'); // ADDED
    const difficultyButtons = document.querySelectorAll('.difficulty-btn'); // ADDED

    // ADDED: Mode selection handling
    modeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default behavior
            modeButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            isAIMode = btn.dataset.mode === 'ai';
            
            // Hide/show player 2 name input and difficulty based on mode
            if (isAIMode) {
                player2NameGroup.style.display = 'none';
                difficultySelection.classList.add('active');
            } else {
                player2NameGroup.style.display = 'flex';
                difficultySelection.classList.remove('active');
            }
        });
    });
    // END ADDED

    // ADDED: Difficulty selection handling
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            difficultyButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            aiDifficulty = btn.dataset.difficulty;
        });
    });
    // END ADDED

    startBtn.addEventListener('click', startGame);
    
    newGameBtn.addEventListener('click', () => {
        game.resetGame();
        updateScreen();
    });
    
    resetScoresBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all scores?')) {
            game.resetScores();
            game.resetGame();
            updateScreen();
        }
    });

    // ADDED: Go back button handler
    goBackBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to go back to setup? This will reset all scores.')) {
            gameScreen.classList.remove('active');
            setupScreen.classList.add('active');
            game = null;
            
            // Reset form
            player1NameInput.value = '';
            player2NameInput.value = '';
            isAIMode = false;
            aiDifficulty = 'medium'; // ADDED: Reset difficulty
            modeButtons.forEach(b => b.classList.remove('selected'));
            modeButtons[0].classList.add('selected');
            difficultyButtons.forEach(b => b.classList.remove('selected')); // ADDED: Reset difficulty buttons
            difficultyButtons[1].classList.add('selected'); // ADDED: Select medium by default
            player2NameGroup.style.display = 'flex';
            difficultySelection.classList.remove('active'); // ADDED: Hide difficulty selection
        }
    });
    // END ADDED

    function startGame() {
        const name1 = player1NameInput.value.trim() || 'Player 1';
        const name2 = isAIMode ? 'AI' : (player2NameInput.value.trim() || 'Player 2'); // MODIFIED
        
        game = GameController(name1, name2, isAIMode, aiDifficulty); // MODIFIED: Pass AI difficulty
        
        document.getElementById('player1NameDisplay').textContent = name1;
        document.getElementById('player2NameDisplay').textContent = name2;
        player1Turn.textContent = `${name1} (O)`;
        player2Turn.textContent = `${name2} (X)`;
        
        setupScreen.classList.remove('active');
        gameScreen.classList.add('active');
        
        updateScreen();
    }

    function updateScreen() {
        if (!game) return;

        const board = game.board.getBoard();
        const activePlayer = game.getActivePlayer();
        const winner = game.getWinner();
        const players = game.getPlayers();
        const winningCells = game.getWinningCells();

        // Update scores
        document.getElementById('score1').textContent = players[0].score;
        document.getElementById('score2').textContent = players[1].score;

        // Update active player indicator
        player1Turn.classList.toggle('active-player', !winner && activePlayer.marker === 'O');
        player2Turn.classList.toggle('active-player', !winner && activePlayer.marker === 'X');

        // Render board
        boardDiv.innerHTML = '';
        board.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                const cellBtn = document.createElement('button');
                cellBtn.classList.add('cell');
                cellBtn.textContent = cell;
                cellBtn.dataset.row = rowIndex;
                cellBtn.dataset.column = columnIndex;

                // Check if this cell is part of winning combination
                const isWinningCell = winningCells.some(
                    ([r, c]) => r === rowIndex && c === columnIndex
                );
                if (isWinningCell) {
                    cellBtn.classList.add('winning-cell');
                }

                if (winner || cell !== '') {
                    cellBtn.disabled = true;
                }

                boardDiv.appendChild(cellBtn);
            });
        });

        // Show winner message
        if (winner) {
            displayWinner(winner);
        } else if (activePlayer.isAI && !winner) {
            // ADDED: Trigger AI move after a short delay
            setTimeout(() => {
                const aiMove = game.makeAIMove();
                if (aiMove) {
                    game.playRound(aiMove.row, aiMove.column);
                    updateScreen();
                }
            }, 500);
        }
        // END ADDED
    }

    const displayWinner = (winner) => {
        const winnerContainerEl = document.createElement("div");
        winnerContainerEl.classList.add("winner-container");

        const winnerEl = document.createElement("h3");
        if (winner === 'draw') {
            winnerEl.textContent = "Draw!";
        } else {
            winnerEl.textContent = winner.name + " Wins!";
        }

        const playAgainButton = document.createElement("button");
        playAgainButton.textContent = "Play Again";

        winnerContainerEl.appendChild(winnerEl);
        winnerContainerEl.appendChild(playAgainButton);
        boardDiv.appendChild(winnerContainerEl);

        playAgainButton.addEventListener("click", () => {
            game.resetGame();
            updateScreen();
        });
    }

    boardDiv.addEventListener('click', (e) => {
        if (!e.target.classList.contains('cell')) return;
        
        const row = Number(e.target.dataset.row);
        const column = Number(e.target.dataset.column);

        if (game.playRound(row, column)) {
            updateScreen();
        }
    });
}

ScreenController();