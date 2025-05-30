function GameBoard() {
    const board = [];
    const rows = 3;
    const getBoard = () => board;

    // Create a 2D array 
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < rows; j++) {
            board[i][j] = 0;
        }
    } 

    const pickCell = (row, column, player) => {

        const availableCell = board[row][column] === 0;
        
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
    const player1 = Player("Papu");
    const player2 = Player("Basko");  
    
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
        
        const picked = board.pickCell(row, column, getActivePlayer());

        // stop if the cell is not available
        if (!picked) return;

        switchPlayer();
        board.printBoard();
    }

    return {playRound};
}

const game = GameController();
game.playRound(1, 1);
game.playRound(1, 1);
game.playRound(1, 2)

