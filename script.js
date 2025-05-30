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
        
        const picked = board.pickCell(row, column,activePlayer);

        // stop if the cell is not available
        if (!picked) return;
        switchPlayer();
        board.printBoard();
    }

    return {playRound, getActivePlayer, board};
}

function ScreenController() {
    const boxDiv = document.querySelector(".box");
    const game = GameController();

    const updateScreen = () => {
        const board = game.board.getBoard();
        
        boxDiv.textContent = "";
        console.log(board, "change?")
        board.forEach((row, rowIndex )=> {
            row.forEach((cell, columnIndex) => {
                const cellDiv = document.createElement("div");
                cellDiv.classList.add("cell");
                cellDiv.textContent = cell;

                cellDiv.setAttribute("data-row-index", rowIndex);
                cellDiv.setAttribute("data-column-index", columnIndex);
                boxDiv.appendChild(cellDiv);
            })
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

