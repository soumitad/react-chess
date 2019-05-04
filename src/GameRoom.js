import React, { Component } from 'react';
const { firebase } = window;
class GameRoom extends Component {

    constructor(props) {
        super(props);
        this.fetchGames = this.fetchGames.bind(this);
        this.play = this.play.bind(this);
        this.state = {
            userName: this.props.email,
            stateExistingGame: []
        };
        this.existingGames = [{}];
    }

    componentDidMount() {
        this.fetchGames();
        this.setState({
            stateExistingGame: this.existingGames
        });
    }

    fetchGames() {
        const db = firebase.database().ref("/player");
        ["p1_email"].forEach((name) => {
            const ref = db.orderByChild(name).equalTo(this.state.userName);
            ref.on('value', (ref) => {
                const key = Object.keys(ref.val());
                    const value = Object.values(ref.val());
                    value.map((val) => {
                        this.existingGames.push(val);
                        this.setState({
                            stateExistingGame: [...this.state.stateExistingGame, val]
                        })
                    });
                    /*const [id, game] = parse(ref.val());
                if (!id) return;*/
            });
        });
    }

  play(e) {
  // console.log(e.target.name);
  }

    render() {

        return (
            <ul>
                {this.existingGames.map(function (value, index) {
                    return <li key={index}>Against player {value.p2_email} <a target="_blank" href={domain() + "/#/home/" + value.token}>Click to Play</a></li>;
                })}
            </ul>
        )
    }

}
function play (token)  {
    console.log(token);
}
function parse(tree) {
    if (!tree) return [];
    const keys = Object.keys(tree);
    const id = keys[0];
    const game = tree[id];
    return [id, game];
}
function domain() {
    const { hostname, port } = window.location;
    if (port) {
        return `http://${hostname}:${port}`;
    } else {
        return `http://${hostname}`;
    }
}
export default GameRoom;

