import React, { Component } from "react";
import Login from "./Screens/Login/login";
import firebase, { fireStore } from "./Config/firebase";
import Dasboard from './Screens/Dasboard/Dasboard';
const provider = new firebase.auth.FacebookAuthProvider();
class App extends Component {
  constructor(props) {
    super();
    this.state = {
      currentAuth: "Adnan"
    };
  }

  componentDidMount() {

  }

  render() {
    const { currentAuth } = this.state;
    return (
      <div className="App">
        {!currentAuth && <Login />}
        {currentAuth && <Dasboard />}
      </div>
    );
  }
}

export default App;
