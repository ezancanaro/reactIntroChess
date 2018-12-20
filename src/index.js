import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Piece from './piece.js';


class Square extends React.Component {


    render() {

        return (/*<Piece></Piece>*/
            <button className={this.props.class ? "square-highlight" : "square"}
                id={this.props.id}
                onClick={() => this.props.onClick(this.props.id)}
            //style={this.props.class ? highlightedSquare : null}
            >
                <Piece value={this.props.value} />
            </button>
        );
    }


}

class ChessGame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            boardState: [
                ['Br', 'Bn', 'Bb', 'Bq', 'Bk', 'Bb', 'Bn', 'Br'],
                ['Bp', 'Bp', 'Bp', 'Bp', 'Bp', 'Bp', 'Bp', 'Bp'],
                ['o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'],
                ['o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'],
                ['o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'],
                ['o', 'o', 'o', 'o', 'o', 'o', 'o', 'o'],
                ['Wp', 'Wp', 'Wp', 'Wp', 'Wp', 'Wp', 'Wp', 'Wp'],
                ['Wr', 'Wn', 'Wb', 'Wq', 'Wk', 'Wb', 'Wn', 'Wr'],
            ],
            highLighted: [],
            selectedPiece: 'z',
            //selectedSquare: -1,
            stepNumber: 0,
            whitePlays: true,
            hasToClickHighlighted: false,
            //Stores the coordenates of pawn that moved 2 squares and can be captured en passant.
            enPassantElligible: [],
            selectedPiecePosition: -1,
            colorCheck: '', //Stores color of King put in check
            attackingPositions: [], //Stores coordenates for pieces attacking the king in a Check state
        }

    }

    render() {
        return (
            <div className="game">
                <div className="game-board">
                    <ChessBoard onClick={(squareId) => this.handleClick(squareId)}
                        highLighted={this.state.highLighted}
                        boardState={this.state.boardState} />
                </div>
                <div className="game-info">
                    Playing now: <b>{this.state.whitePlays ? "White" : "Black"}</b>
                    <br/>
                    Check: <b>{this.state.colorCheck==='' ? 'No' : this.state.colorCheck }</b>
                       
                </div>
            </div>
        );
    }

    handleClick(squareId) {
        //  j + (8*i);
        // alert('square: ' + squareId); 
        var i = (squareId / 8) | 0;
        var j = squareId % 8;
        var boardNow = this.state.boardState;
        // alert('i: ' + i + ' j: ' + j );
        const selPiece = boardNow[i][j];
        const selSquare = i * 8 + j;
        var hasToClickHighlighted = this.state.hasToClickHighlighted;
        const blackPlays = !this.state.whitePlays;
        var possibleMoves = this.state.highLighted;
        var piecePosition = this.state.selectedPiecePosition;
        var check = null;
        var attackingPositions = [];
        //Piece selected, player needs to move it.
        if (hasToClickHighlighted) {
            if (possibleMoves.includes(selSquare)) {
                boardNow = this.movePiece(boardNow, piecePosition, selSquare);
                check = this.isKingPutInCheck(this.state.whitePlays,selSquare, selPiece);
                attackingPositions = check[1];
                check = check[0];
                this.setState({
                    whitePlays: blackPlays,
                    highLighted: [],
                    selectedPiece: 'o',
                    selectedPiecePosition: -1,
                    hasToClickHighlighted: false,
                    boardState: boardNow,
                    colorCheck: check ? (blackPlays ? 'white' : 'black') : '',
                    attackingPositions: attackingPositions,
                });
            }
        } else { //No piece selected, player can click anywhere on the board.
            //Only proceed if player selected a piece he owns
            if (selPiece.includes(blackPlays ? 'B' : 'W')) {
                this.setState(
                    {
                        //,
                        selectedPiece: selPiece.substring(1),
                        selectedPiecePosition: selSquare,
                        //attackingPositions: attackingPositions,//Set attacking pieces back to empty
                    },
                    () => this.highlightMoves(i, j)                    
                );
            }
        }

    }

    isKingPutInCheck(whitePlays, piecePosition, selPiece){
        var i = (piecePosition / 8) | 0;
        var j = piecePosition % 8;
        //Calculate piece's next move
        var attackLines=  this.validMoves(i,j);
        const board = this.state.boardState;
        var pieceAt = 'o';
        var check = false;
        var attackingPositions = [];
        for(let position of attackLines){
            i = position[0];
            j = position[1];
            pieceAt = board[i][j];
            console.log('CanAttack: ',pieceAt);
            if(pieceAt.includes('Wk')){
                check = !whitePlays;
                attackingPositions.push(attackLines);
                break;
            }else if (pieceAt.includes('Bk')){
                check = whitePlays;
                attackingPositions.push(attackLines);
                break;
            }
        }
        return [check,attackingPositions];
    }

    getMovementLines(selPiece,moves,i,j){
        
        var movementLines=[];
        if (selPiece === 'r' || selPiece === 'q') { //Rook and Queen move straight
            movementLines.push(moves.filter(([a, b]) => this.lineUp(i, j, [a, b])).sort(this.lesserLast));
            movementLines.push(moves.filter(([a, b]) => this.lineDown(i, j, [a, b])).sort(this.greaterLast));
            movementLines.push(moves.filter(([a, b]) => this.lineLeft(i, j, [a, b])).sort(this.lesserLastJ));
            movementLines.push(moves.filter(([a, b]) => this.lineRight(i, j, [a, b])).sort(this.greaterLastJ));
        }
        if (selPiece === 'b' || selPiece === 'q') { //Bishop and queen move diagonnally
            movementLines.push(moves.filter(([a, b]) => this.lineDiagonal(i, j, [a, b], 1)).sort(this.lesserLast));
            movementLines.push(moves.filter(([a, b]) => this.lineDiagonal(i, j, [a, b], 2)).sort(this.greaterLast));
            movementLines.push(moves.filter(([a, b]) => this.lineDiagonal(i, j, [a, b], 3)).sort(this.lesserLast));
            movementLines.push(moves.filter(([a, b]) => this.lineDiagonal(i, j, [a, b], 4)).sort(this.greaterLast));
        }
        return movementLines;
    }


    movePiece(boardState, origin, destination) {
        console.log('origin: ', origin, ' destination', destination);
        var i = (origin / 8) | 0;
        var j = origin % 8;
        var k = (destination / 8) | 0;
        var l = destination % 8;
        var board = boardState;
        console.log('FROM: ', i, ' ', j, ': ', board[i][j]);
        console.log('TO: ', k, ' ', l, ': ', board[k][l]);
        board[k][l] = board[i][j];
        board[i][j] = 'o';
        return board;
    }

    highlightMoves(i, j) {
        console.log('selectedPiece:', this.state.selectedPiece, ' on square:', this.state.selectedPiecePosition);
        var moves = this.validMoves(i, j);
        const highlight = moves.map(([i, j]) => (i * 8) + j);
        this.setState(
            {
                highLighted: highlight,
                hasToClickHighlighted: highlight.length > 0,
            }
        )
    }

    validMoves(i, j) {
        var moves = null;
        switch (this.state.selectedPiece) {
            case 'k': moves = this.kingMoves(i, j);
                break;
            case 'q': moves = this.queenMoves(i, j);
                break;
            case 'b': moves = this.bishopMoves(i, j);
                break;
            case 'r': moves = this.rookMoves(i, j);
                break;
            case 'n': moves = this.knightMoves(i, j);
                break;
            case 'p': moves = this.pawnMoves(i, j, this.state.whitePlays);
                break;
            default: moves = [-1, -1];
                break;
        }
        //Se o jogador usa as peças brancas, inverte a coordenada vertical(importante somente para o peao?)
        console.log('moves: ', moves);
        moves = moves.filter(
            ([i, j]) => {
                if (i < 0 || i > 7 || j < 0 || j > 7)
                    return false
                else return true
            }
        );//.sort(this.comparator);
        moves = this.validMovesFromBoardState(i, j, moves, this.state.whitePlays, this.state.selectedPiece);
        console.log('valid: ', moves)
        moves = moves.filter(Boolean);
        return (
            moves
        )
    }

    //Sorter functions. Sorts bigger elements to the back of the array
    greaterLast(a, b) {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[1]) return 1;
        return 0;
    }
    //Sorts smaller elements to the back of the array
    lesserLast(a, b) {
        if (a[0] < b[0]) return 1;
        if (a[0] > b[1]) return -1;
        return 0;
    }
    greaterLastJ(a, b) {
        if (a[1] < b[1]) return -1;
        if (a[1] > b[1]) return 1;
        return 0;
    }
    //Sorts smaller elements to the back of the array
    lesserLastJ(a, b) {
        if (a[1] < b[1]) return 1;
        if (a[1] > b[1]) return -1;
        return 0;
    }


    trimBlockedMovementLines(movementLines,validMoves,i,j,whitePlays,selectedPiece){
        
        for (let line of movementLines) {
            for (let move of line) {
                const valid = this.validMoveFromBoardState(i, j, move, whitePlays, selectedPiece);
                if (valid) {
                    validMoves.push(move);
                }
                //If the square on this move has a piece, cannot advance past it ignore the rest of the line.
                if (this.moveSquareOccuppied(move[0], move[1])) {
                    break;
                }
            }
        }
        return validMoves;
    }

    validMovesFromBoardState(i, j, moves, whitePlays, selPiece) {

        var validMoves = [];
        //var invalidMoves = [];
        var movementLines = [];
        //Lines:  considering moves[[a,b]]
        // up: a < i; down: a > i, right: b > j, left: b < j, 
        //diagonal1: up && left, diag2: down && right, diag3: up && right, diag4: down && left
        //Knight and Pawn are only blocked by pieces residing in their aimed square. Calculate those and return. 
        //TODO: implement King's special movement rules instead of bundling him up with these.
        if (selPiece === 'n' || selPiece === 'p' || selPiece === 'k') {
            for (let move of moves) {
                const valid = this.validMoveFromBoardState(i, j, move, whitePlays, selPiece);
                if (valid) { validMoves.push(move); }
            }
            return validMoves;
        }
        //Other pieces may be blocked by pieces between them and their aimed square, so we draw these lines
        movementLines = this.getMovementLines(selPiece,moves,i,j);
        //We have an array of arrays, each of them sorted so the closest square to the piece comes first
        validMoves = this.trimBlockedMovementLines(movementLines,validMoves,i,j,whitePlays,selPiece);
        //If player is in Check, only allow moves that get him out of this situation
        if(this.state.colorCheck !== ''){
            validMoves = this.trimMovesThatLeavesMeOnCheck(validMoves,this.state.attackingPositions);
        }
        
        console.log('validMovesOnFunc',validMoves);
        return validMoves;
    }

    trimMovesThatLeavesMeOnCheck(validMoves,attackingPositions){

    }

    lineUp(i, j, [a, b]) {
        return a < i && j === b;
    };
    lineDown(i, j, [a, b]) {
        return a > i && j === b;
    };
    lineLeft(i, j, [a, b]) {
        return b < j && i === a;
    };
    lineRight(i, j, [a, b]) {
        return b > j && i === a;
    };
    lineDiagonal(i, j, [a, b], diag) {
        switch (diag) {
            //Replace coordinate to check only single axis per call
            case 1: return this.lineUp(i, j, [a, j]) && this.lineLeft(i, j, [i, b]);
            case 2: return this.lineDown(i, j, [a, j]) && this.lineRight(i, j, [i, b]);
            case 3: return this.lineUp(i, j, [a, j]) && this.lineRight(i, j, [i, b]);
            case 4: return this.lineDown(i, j, [a, j]) && this.lineLeft(i, j, [i, b]);
            default: return false;
        }
    };

    moveSquareOccuppied(i, j) {
        return this.state.boardState[i][j] !== 'o';
    }

    validMoveFromBoardState(i, j, move, whitePlays, selPiece) {
        const boardState = this.state.boardState;

        var moveI, moveJ;
        moveI = move[0];
        moveJ = move[1];
        const blackPlays = !whitePlays;
        //Any piece is blocked if another piece of the same color occupies the square
        if (boardState[moveI][moveJ].includes('W') && whitePlays) {
            return false;
        } else if (boardState[moveI][moveJ].includes('B') && blackPlays) {
            return false;
        }

        //Pawns move forward only if squares are empty. May move diagonally if they can capture a piece
        if (selPiece === 'p') {
            if (moveJ === j) {
                return boardState[moveI][moveJ] === 'o';
            } else {
                if (boardState[moveI][moveJ].includes('W') && blackPlays) {
                    return true;
                }
                if (boardState[moveI][moveJ].includes('B') && whitePlays) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }
    //Need to implement King's special movement rules for not getting into check positions.


    kingMoves(i, j) {
        return (
            [
                [i + 1, j], [i + 1, j + 1], [i + 1, j - 1],
                [i, j + 1], [i, j - 1],
                [i - 1, j], [i - 1, j + 1], [i - 1, j - 1]
            ]
        )
    };
    queenMoves(i, j) {

        return (this.bishopMoves(i, j).concat(this.rookMoves(i, j)));
    }
    bishopMoves(i, j) {
        var base = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 9]];
        var diagonal1 = base.map(([a, b]) => [a + i, a + j]).concat(base.map(([a, b]) => [i - a, j - a]));
        var diagonal2 = base.map(([a, b]) => [a + i, j - a]).concat(base.map(([a, b]) => [i - a, a + j]));
        console.log('diagonal1: ', diagonal1, 'diagonal2: ', diagonal2);
        return diagonal1.concat(diagonal2);
    }

    rookMoves(i, j) {
        var base = [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0]];
        var upDown = base.map(([a, b]) => [a + i, j]).concat(base.map(([a, b]) => [i - a, j]));
        var leftRight = base.map(([a, b]) => [i, a + j]).concat(base.map(([a, b]) => [b + i, j - a]));
        //console.log('upDown: ',upDown, ' leftRight: ', leftRight);
        return upDown.concat(leftRight);
    }
    knightMoves(i, j) {
        return (
            [
                [i + 1, j + 2], [i + 1, j - 2],
                [i - 1, j + 2], [i - 1, j - 2],
                [i + 2, j + 1], [i - 2, j + 1],
                [i + 2, j - 1], [i - 2, j - 1],
            ]
        )
    }
    pawnMoves(i, j, whitePlays) {
        const moveDirection = whitePlays ? -1 : 1;
        const moves = this.pawnAtStartingPosition(i,moveDirection) ?
            [[i + moveDirection, j], [i + moveDirection*2, j], [i + moveDirection, j + 1], [i + moveDirection, j - 1],]
            : [[i + moveDirection, j], [i + moveDirection, j + 1], [i + moveDirection, j - 1]];
        //console.log(moves);
        return moves;
    }
    //Returns true if pawn at starting position (1 for black, 6 for white)
    pawnAtStartingPosition(i,moveDirection){
        return moveDirection===i ? true : i===6; 
    }
}


class ChessBoard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    renderSquare(piece, id) {
        const highlighted = this.props.highLighted.includes(id);

        return <Square value={piece} key={id} id={id} class={highlighted}
            onClick={(squareId) => this.props.onClick(squareId)} />;
    }



    getChessBoard() {

        let columns = []
        const board = this.props.boardState;
        for (let i = 0; i < 8; i++) {
            let row = [];
            for (let j = 0; j < 8; j++) {
                row.push(this.renderSquare(board[i][j], j + (8 * i)));
            }
            columns.push(<div className="board-row" key={i}>{row}&nbsp;{i}</div>);
        }
        return columns;
    }


    render() {
        return (
            <div>
                {this.getChessBoard()}
            </div>
        );
    }
}






// ========================================


ReactDOM.render(
    //<Game />,
    <ChessGame />,
    //<Piece />,
    document.getElementById('root')
);
