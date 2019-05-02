import React, { Component } from 'react';
import { HashRouter, Redirect, Route } from 'react-router-dom';

import './App.css';
import Login from './Login';
import Game from './Game';
import app from "./base";
import Home from "./Home";
import GameRoom from "./GameRoom";

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = ({
            loading: true,
            authenticated: false,
            currentUser: null });
        this.authListener = this.authListener.bind(this);
    }


    authListener() {
        app.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setState({ currentUser: user,
                authenticated: true});
            } else {
                this.setState({ currentUser: null,
                authenticated: false});
            }
        });
    }

    componentDidMount() {
        this.authListener();
    }

  render() {
      const { authenticated, loading } = this.state;
      return (
      <HashRouter>
        <div>
          <Route exact path="/" component={Login} />
            <Route exact path="/home" component={Home} />
          <Route exact path="/home/:token" render={(props) => ( this.state.currentUser ? <Game token={props.match.params.token}/> : <Login />)}/>
            <Route exact path="/room/:email" component={GameRoom} />
        </div>
      </HashRouter>
    );
  }
}
