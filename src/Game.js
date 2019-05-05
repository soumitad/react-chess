import React from 'react';

const { firebase, Chess, ChessBoard, metro_board_theme, symbol_piece_theme, wikipedia_board_theme, $ } = window;

const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

class Game extends React.Component {
  constructor(props) {
    super(props);
   this.state = { token: this.props.token, squares: [] };
    this.engine = new Chess();
  }

  render() {
    return (
      <div className='view row'>
        <div className='column column-50'>
          <div id='game-board' />
        </div>
        <div className='column column-50'>
          <blockquote>
            <h5 className='turn'>{ this.state.turnText }</h5>
            <h5 className='status'>{ this.state.statusText }</h5>
          </blockquote>
          <p className='history'>{ history(this.state.moves) }</p>
        </div>
      </div>
    );
  }

  componentDidMount() {
    listenForUpdates(this.state.token, (id, game) => {
      this._updateBoard(id, game);
      this._updateInfo(game, id);
    });
  }

  _updateInfo(game, id) {
    const engine = this.engine;
    const playerNum = figurePlayer(this.state.token, game);
    this.setState({
      moves: game.moves ? game.moves.split(",") : [],
      p1_token: game.p1_token,
      p2_token: game.p2_token,
      turnText: turnText(playerNum, isMyTurn(playerNum, engine.turn())),
      statusText: statusText(engine.turn(), engine.in_checkmate(), engine.in_draw(), engine.in_check())
    });
  }

  _updateBoard(id, game) {
    const playerNum = figurePlayer(this.state.token, game);
    this.engine.load(game.fen || INITIAL_FEN);

    if (!this.board) {
      this.board = this._initBoard(id, game);
      this.board.position(this.engine.fen());
    } else if (isMyTurn(playerNum, this.engine.turn())) {
      this.board.position(this.engine.fen());
    }
  }

  _initBoard(id, game) {
    const token = this.state.token;
    const engine = this.engine;
    const playerNum = figurePlayer(token, game);
    const config = {
      draggable: true,
      pieceTheme: symbol_piece_theme,
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd,
      boardTheme: metro_board_theme,
      onMouseoutSquare: onMouseoutSquare,
      onMouseoverSquare: onMouseoverSquare,
    };

    function onMouseoutSquare(square, piece) {
      removeGreySquares();
    }

    function removeGreySquares() {
      const arr = JSON.parse(localStorage.getItem('squares'));
      const arrString = Array.from(arr);
      for(let i=0; i<arrString.length; i++) {
        let squareEl = $('#game-board .square-' + arrString[i]);
        let background = '#EFEFEF';
        if (squareEl.hasClass('black-3c85d') === true) {
          background = '#FFFFFF';
        }
        squareEl.css('background', background);
      }
      /*$('#game-board .square-55d63').css('background', '');*/
    }

    function greySquare (square) {
      let squareEl = $('#game-board .square-' + square);
      let background = '#a9a9a9';
      if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
      }
      squareEl.css('background', background);
    }

    function onMouseoverSquare(square, piece) {
     let squareArray = [];
      // get list of possible moves for this square
      const moves = engine.moves({
        square: square,
        verbose: true
      });
      // exit if there are no moves available for this square
      if (moves.length === 0) return;
      // highlight the square they moused over
      squareArray.push(square);
      greySquare(square);

      // highlight the possible squares for this piece
      for (var i = 0; i < moves.length; i++) {
        squareArray.push(moves[i].to);
        greySquare(moves[i].to);
      }
      localStorage.setItem('squares',JSON.stringify(squareArray));
    }

    const board = ChessBoard('game-board', config);
    if (playerNum === 2) {
      board.orientation('black');
    }
    return board;

    function onDragStart(source, piece) {
      return !engine.game_over() &&
        isMyTurn(playerNum, engine.turn()) &&
        allowMove(engine.turn(), piece);
    }

    function onDrop(source, target) {
      const m = engine.move({
        from: source,
        to: target,
        promotion: 'q'
      });
      if (m === null) return "snapback";

      game.fen = engine.fen();
      game.moves = pushMove(game.moves, `${m['from']}-${m['to']}`);

      games(id).set(game);
    }

    function onSnapEnd() {
      return board.position(engine.fen());
    }
  }
}
export default Game;

function history(moves = []) {
  return moves.map((m, idx) => <span key={m}>{idx + 1}) {m}</span>);
}

function listenForUpdates(token, cb) {
  const db = firebase.database().ref("/games");
  ["p1_token", "p2_token"].forEach((name) => {
    const ref = db.orderByChild(name).equalTo(token);
    ref.on('value', (ref) => {
      const [id, game] = parse(ref.val());
      if (!id) return;
      cb(id, game);
    });
  });
}

function parse(tree) {
  if (!tree) return [];
  const keys = Object.keys(tree);
  const id = keys[0];
  const game = tree[id];
  return [id, game];
}

function games(id) {
  return firebase
    .database()
    .ref(`/games/${id}`);
}

function domain() {
  const { hostname, port } = window.location;
  if (port) {
    return `http://${hostname}:${port}`;
  } else {
    return `http://${hostname}`;
  }
}

function pushMove(moves, move) {
  if (!moves) {
    return [move].join(",");
  } else {
    const arr = moves.split(",");
    return [...arr, move].join(",");
  }
}

function isMyTurn(playerNum, turn) {
  return (playerNum === 1 && turn === 'w') || (playerNum === 2 && turn === 'b');
}

function allowMove(turn, piece) {
  return !(turn === 'w' && piece.search(/^b/) !== -1) || (turn === 'b' && piece.search(/^w/) !== -1);
}

function figurePlayer(token, { p1_token, p2_token }) {
  if (token === p1_token) {
    return 1;
  } else if (token === p2_token) {
    return 2;
  } else {
    return 0;
  }
}

function turnText(playerNum, isMyTurn) {
  if (playerNum > 0) {
    if (isMyTurn) {
      return "Your Turn";
    } else {
      return "Waiting for opponent's move...";
    }
  } else {
    return "View Only";
  }

}

function statusText(turn, in_mate, in_draw, in_check) {
  const moveColor = turn === 'b' ? "Black" : "White";
  if (in_mate)
    return `Game Over, ${moveColor} is in checkmate`;
  else if (in_draw)
    return 'Game over, drawn position';
  else if (in_check)
    return `${moveColor} is in check!`;
  else
    return "";
}
