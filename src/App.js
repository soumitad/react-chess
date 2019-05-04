import React, { Component } from 'react';
import { HashRouter, Redirect, Route } from 'react-router-dom';

import './App.css';
import Login from './Login';
import Game from './Game';
import app from "./base";
import Home from "./Home";
import GameRoom from "./GameRoom";
import Navigation from "./Navigation";
import Footer from "./Footer";
import Register from "./Register";

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = ({
            loading: true,
            authenticated: false,
            currentUser: null });
        this.authListener = this.authListener.bind(this);
        this.isAuthenticated = this.isAuthenticated.bind(this);
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

    isAuthenticated ()  {
        return this.state.authenticated;
    }

    componentDidMount() {
        this.authListener();
    }

  render() {
      return (
          <HashRouter>
              <div className="Site">
                  <div className="Site-content">
                      <Navigation />
                      <div className="container">
                          <Route exact path="/" component={Login} />
                          <Route exact path="/signUp" component={Register} />
                          <Route exact path="/home" render={() => ( this.state.authenticated ? <Home /> : <Login />)} />
                          <Route exact path="/home/:token" render={(props) => ( this.isAuthenticated() ? <Game token={props.match.params.token}/> : <Login />)}/>
                          <Route exact path="/room/:email" render={(props) => ( this.isAuthenticated() ? <GameRoom email={props.match.params.email}/> : <Login />)} />

                      </div>
                  </div>
              </div>
              <Footer />
      </HashRouter>
    );
  }
}
