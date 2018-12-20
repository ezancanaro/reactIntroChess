import React from 'react';
import blackKing from './images/blackKing.png';
import blackQueen from './images/blackQueen.png';
import blackBishop from './images/blackBishop.png';
import blackRook from './images/blackRook.png';
import blackKnight from './images/blackKnight.png';
import blackPawn from './images/blackPawn.png';
import whiteKing from './images/whiteKing.png';
import whiteQueen from './images/whiteQueen.png';
import whiteBishop from './images/whiteBishop.png';
import whiteRook from './images/whiteRook.png';
import whiteKnight from './images/whiteKnight.png';
import whitePawn from './images/whitePawn.png';


class Piece extends React.Component {

    render() {
        switch (this.props.value) {
            case 'Bk': return <img src={blackKing} alt='BK' />;
            case 'Bq': return <img src={blackQueen} alt='BQ' />;
            case 'Bb': return <img src={blackBishop} alt='BB' />;
            case 'Br': return <img src={blackRook} alt='BR' />;
            case 'Bn': return <img src={blackKnight} alt='BN' />;
            case 'Bp': return <img src={blackPawn} alt='BP' />;
            case 'Wk': return <img src={whiteKing} alt='WK' />;
            case 'Wq': return <img src={whiteQueen} alt='WQ' />;
            case 'Wb': return <img src={whiteBishop} alt='WB' />;
            case 'Wr': return <img src={whiteRook} alt='WR' />;
            case 'Wn': return <img src={whiteKnight} alt='WN' />;
            case 'Wp': return <img src={whitePawn} alt='WP' />;
            default: return <img alt='' />
        }
        //require('C:/brame/react-tuto/src/images/blackQueen.png')
    }

    
}


export default Piece;