/* eslint-disable no-restricted-globals */
import React, { Component } from 'react';
import Utils from './utils';
import chessLogo from './chess_logo.png';
const { firebase } = window;

class Home extends Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.updatePlayerRecord = this.updatePlayerRecord.bind(this);
        this.state = {
            createNewGame: false,
            activeTab: props.activeTab || 1,
            viewGameRoom: false,
            p2_email: '',
            p1_email: ''
        };
    }

    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    clickCreateGame = () => {
        const loggedInUser = localStorage.getItem('userID');
        this.setState({createGame: true});
        this.setState({p1_email: loggedInUser});
    };

    visitGameRoom = () => {
        const loggedInUser = localStorage.getItem('userID');
        window.location.hash = `#/room/${loggedInUser}`;
        location.reload();
    };

     createGame = () => {
        const newGame = {
            p1_token: Utils.token(),
            p2_token: Utils.token()
        };
        /*,
        * Step 1: Assign logged in user email as Player 1 and put it as p1_userID in newGame const
        * Step 2: Display a text box to enter Player 2 email ID
        * Step 3: Call createGame()
        * */
        const game = firebase.database().ref("games").push();
        game
            .set(newGame)
            .then(() => {
                window.location.hash = `#/home/${newGame.p1_token}`;
                location.reload();
            }, (err) => {
                throw err;
            });

         const playerRecord = firebase.database().ref("player").push();
         const playerRecord2 = firebase.database().ref("player").push();
        const p1Game = {
            p1_email: this.state.p1_email,
            p2_email: this.state.p2_email,
            token: newGame.p1_token
        };

         const p2Game = {
             p1_email: this.state.p2_email,
             p2_email: this.state.p1_email,
             token: newGame.p2_token
         };
         this.updatePlayerRecord(playerRecord, p1Game);
         this.updatePlayerRecord(playerRecord2, p2Game);
     };

      updatePlayerRecord(playerRecord, player) {
         playerRecord
             .set(player)
             .then(() => {}, (err) => {
                 throw err;
             });
     };

    render() {
        console.log(localStorage.getItem('userID'));
        let textBox;
        let disclaimer;
        let button;
        if (this.state.createGame) {
            disclaimer = <div className="row">
                <div className="col-md-12">
                    Please enter Email address for player 2
                </div>
            </div>;
            textBox = <div className="row">
                <div className="col-md-6"> <input value={this.state.email} onChange={this.handleChange} name="p2_email" /></div></div>;

            button = <div className="col-md-6"><button onClick={this.createGame}>Go</button> </div>
        } else {
            textBox = null;
        }
        return (
            <div className='row' style={{margin: 10}}>
                <div className="col-md-3">
                    <img src={chessLogo} style={{width: 400, height: 320}} alt="Chess-Logo" />
                </div>
                <div className='col-md-4'>

                        <h3>&nbsp;</h3>
                        <button onClick={this.clickCreateGame}>Create a New Game</button>
                    {disclaimer}
                    {textBox}
                    {button}
                </div>
                <div className='col-md-1'>
                    &nbsp;
                </div>
                <div className="col-md-4">
                    <h3>&nbsp;</h3>
                    <button onClick={this.visitGameRoom}>Game Room</button>
                </div>
            </div>
        );
    }
}
export default Home;

