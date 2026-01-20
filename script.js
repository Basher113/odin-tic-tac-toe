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

function GameController(player1Name, player2Name) {
    const players = [
        { marker: "O", name: player1Name || "Player 1", score: 0 },
        { marker: "X", name: player2Name || "Player 2", score: 0 }
    ];

    let activePlayerIndex = 0;
    let winner = null;
    let winningCells = [];
    const board = GameBoard();

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
        resetScores
    };
}

function ScreenController() {
    let game = null;
    
    const setupScreen = document.getElementById('setupScreen');
    const gameScreen = document.getElementById('gameScreen');
    const startBtn = document.getElementById('startBtn');
    const player1NameInput = document.getElementById('player1Name');
    const player2NameInput = document.getElementById('player2Name');
    const boardDiv = document.getElementById('board');
    const player1Turn = document.getElementById('player1Turn');
    const player2Turn = document.getElementById('player2Turn');
    const newGameBtn = document.getElementById('newGameBtn');
    const resetScoresBtn = document.getElementById('resetScoresBtn');

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

    function startGame() {
        const name1 = player1NameInput.value.trim() || 'Player 1';
        const name2 = player2NameInput.value.trim() || 'Player 2';
        
        game = GameController(name1, name2);
        
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
        }
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