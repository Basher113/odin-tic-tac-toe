function GameBoard() {
    const board = [];
    const rows = 3;
    const getBoard = () => board;


    // Create a 2D array 
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < rows; j++) {
            board[i][j] = "";
        }
    } 
   
    let cellMarkedCount = 0;
    const cellAllMarked = () => cellMarkedCount === 9;
    const pickCell = (row, column, player) => {

        const availableCell = board[row][column] === "";
        
        if (!availableCell) {
            console.log("This cell is not available, Please pick again.")
            return;
        }
        cellMarkedCount++;
        // Change the cell value to player marker
        return board[row][column] = player.marker;
    }

    const printBoard = () => {
        console.log(board);
    }

    return {getBoard, pickCell, printBoard, cellAllMarked};
}

function Player(name) {
    return {name};
}

function GameController() {
    const player1 = Player("Player1");
    const player2 = Player("Player2");  

    const players = [
        {
            marker: "O",
            name: player1.name,
        },
        {
            marker: "X",
            name: player2.name,
        },
    ]

    let activePlayer = players[0];
    const switchPlayer = () => activePlayer === players[0] ? activePlayer = players[1] : activePlayer = players[0];
    const getActivePlayer = () => activePlayer;
    const board = GameBoard();
    const board2d = board.getBoard();
    board.printBoard();

    const playRound = (row, column) => {
        
        const picked = board.pickCell(row, column, activePlayer);

        // stop if the cell is not available
        if (!picked) return;
        
        // Check if there is already a winner
        winner = checkWinner(row, column);
        if (winner)  {
            console.log("we have our winner!", activePlayer.name);
        } else if (board.cellAllMarked()) {
            // Check if all cell is marked and if there is no winner yet.
            console.log("Draw!")
        } else {
            switchPlayer();
            board.printBoard();
        }
    }

    let winner;
    const getWinner = () => winner;
    
    const checkWinner = (row, column) => {
        
        // Check the row of the last picked cell and check if the active player wins by that row
        const rowWinner = board2d[row].every(val => val === activePlayer.marker);
        if (rowWinner) return activePlayer; // return the winner

        // Check the column of the last picked cell and check if the active player wins by that column
        const columnWinner = board2d.every(row => row[column] === activePlayer.marker);
        if (columnWinner) return activePlayer;

        // Check for diagonal winner
        // Check if the active player have a marker in the middle cell
        if (board2d[1][1] === activePlayer.marker) {
            // Check for first diagonal
            if (board2d[0][0] === activePlayer.marker && board2d[2][2] === activePlayer.marker) return activePlayer;

            // check for second diagonal
            if (board2d[0][2] === activePlayer.marker  && board2d[2][0] === activePlayer.marker) return activePlayer;
        }
    } 

    return {playRound, getActivePlayer, board, getWinner};
}

function ScreenController() {
    const boxDiv = document.querySelector(".box");
    const playerEl = document.querySelectorAll(".player");
    const game = GameController();
    

    const updateScreen = () => {
        const winner = game.getWinner();
        const board = game.board.getBoard();
        const activePlayer = game.getActivePlayer();
        
        // Add class active-player for the active player in html
        activePlayer.marker === "O" ? playerEl[0].classList.add("active-player") : playerEl[0].classList.remove("active-player");
        activePlayer.marker === "X" ? playerEl[1].classList.add("active-player") : playerEl[1].classList.remove("active-player");

        boxDiv.textContent = "";
        // Render the boxes
        board.forEach((row, rowIndex )=> {
            row.forEach((cell, columnIndex) => {
                const cellDiv = document.createElement("button");
                cellDiv.classList.add("cell");
                cellDiv.textContent = cell;

                cellDiv.setAttribute("data-row-index", rowIndex);
                cellDiv.setAttribute("data-column-index", columnIndex);
                boxDiv.appendChild(cellDiv);

                if (winner) {
                    cellDiv.disabled = true;
                }

            })
        })

        if (winner) {
           displayWinner(winner)
        } else if (game.board.cellAllMarked()) {
            // Check if all cell is marked if true then display Draw
            displayWinner()
        } 

    }

     // Render the winner and the play again button;
    const displayWinner = (winner=null) => {
        const winnerContainerEl = document.createElement("div");
        winnerContainerEl.classList.add("winner-container")

        const winnerEl = document.createElement("h3")
        if (winner) {
            winnerEl.textContent = winner.name + " Wins!"
        } else {
            winnerEl.textContent = "Draw!"
        }

        const playAgainButton = document.createElement("button");
        playAgainButton.classList.add("play-again");
        playAgainButton.textContent = "Play Again";

        winnerContainerEl.appendChild(winnerEl);
        winnerContainerEl.appendChild(playAgainButton);
        boxDiv.appendChild(winnerContainerEl);

        // reset the game when play again button is clicked
        playAgainButton.addEventListener("click", () => {     
            ScreenController();
        })
    }
    


        


    
    boxDiv.addEventListener("click", (e) => {
        const row = e.target.dataset.rowIndex;
        const column = e.target.dataset.columnIndex;

        if (!row || !column) return;

        game.playRound(row, column);
        updateScreen();
    })
   
    // initilize updating screen
    updateScreen();
}

ScreenController();

