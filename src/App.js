import React, { Component } from "react";
import Login from "./Screens/Login/login";
import firebase, { fireStore } from "./Config/firebase";
import Dasboard from "./Screens/Dasboard/Dasboard";
class App extends Component {
  constructor(props) {
    super();
    this.state = {
      // set the current user if the user is authenticated or set to null
      currentAuth: {uid:'12312y78y87y'}
    };
  }

  handleLogin = currentAuth => {
    const user = {
      userName: currentAuth.displayName,
      avatar: currentAuth.photoURL,
      uid: currentAuth.uid
    };
    this.setState({ currentAuth: user });
  };

  handleLogout = () => {
    localStorage["eyeOnEye"] = null;
    this.setState({ currentAuth: null });
  };

  componentDidMount() {}

  render() {
    const { currentAuth } = this.state;
    return (
      <div className="App">
        {!currentAuth && <Login handleLogin={this.handleLogin}/>}
        {currentAuth && <Dasboard currentAuth={currentAuth} handleLogout={this.handleLogout}/>}
      </div>
    );
  }
}

export default App;
