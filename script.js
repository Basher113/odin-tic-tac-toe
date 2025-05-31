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

    const pickCell = (row, column, player) => {

        const availableCell = board[row][column] === "";
        
        if (!availableCell) {
            console.log("This cell is not available, Please pick again.")
            return;
        }
        // Change the cell value to player marker
        return board[row][column] = player.marker;
    }

    const printBoard = () => {
        console.log(board);
    }

    return {getBoard, pickCell, printBoard};
}


function Player(name) {
    const score = 0;
    return {score, name};
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

    board.printBoard();


    const playRound = (row, column) => {
        
        const picked = board.pickCell(row, column, activePlayer);

        // stop if the cell is not available
        if (!picked) return;
        
        // Check if there is already a winner
        winner = checkWinner(row, column);
        if (winner)  {
            console.log("we have our winner!", activePlayer.name);
        } else {
            switchPlayer();
            board.printBoard();
        }   
    }

    let winner;
    const getWinner = () => winner;
    
    const checkWinner = (row, column) => {
        // Check the row of the last picked cell and check if the active player wins by that row
        const rowWinner = board.getBoard()[row].every(val => val === activePlayer.marker);
        if (rowWinner) return activePlayer; // return the winner

        // Check the column of the last picked cell and check if the active player wins by that column
        const columnWinner = board.getBoard().every(row => row[column] === activePlayer.marker);
        if (columnWinner) return activePlayer;
    }   

    return {playRound, getActivePlayer, board, getWinner};
}

function ScreenController() {
    const boxDiv = document.querySelector(".box");
    const turnDiv = document.querySelector(".turn");
    const titleEl = document.querySelector(".title")
    const game = GameController();

    const updateScreen = () => {
        const board = game.board.getBoard();
        const activePlayer = game.getActivePlayer();
        const winner = game.getWinner();

        turnDiv.textContent = `${activePlayer.name} turn`
        boxDiv.textContent = "";
  
        board.forEach((row, rowIndex )=> {
            row.forEach((cell, columnIndex) => {
                const cellDiv = document.createElement("button");
                cellDiv.classList.add("cell");
                cellDiv.textContent = cell;

                cellDiv.setAttribute("data-row-index", rowIndex);
                cellDiv.setAttribute("data-column-index", columnIndex);
                boxDiv.appendChild(cellDiv);
            })
        })

        if (winner) {
            titleEl.textContent = activePlayer.name + " Wins!"
        }
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

