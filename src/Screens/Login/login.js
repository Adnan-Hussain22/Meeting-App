import React, { Component } from "react";
import { Card, Button } from "antd";
import "antd/dist/antd.css";
import eyeLogo from "../../Helpers/Images/Eye Logo.jpg";
import "./login.css";
import firebase from "../../Config/firebase";
const provider = new firebase.auth.FacebookAuthProvider();
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: ""
    };
  }

  handleLoginWithFb = () => {
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(result => {
        console.log(result.user);
        const currentAuth = {
          userName: result.user.displayName,
            avatar: result.user.photoURL,
            uid: result.user.uid

        }
        localStorage["eyeOnEye"] = JSON.stringify(currentAuth)
        this.props.handleLogin(result.user);
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
  };

  render() {
    return (
      <div className="login-screen">
        <div className="login-inner">
          <div className="eye-logo">
            <img src={eyeLogo} style={{ width: "120px", height: "120px" }} />
          </div>
          <div className="brand">
            <h1 className="brand-name" style={{ marginBottom: "0px" }}>
              Eye on Eye
            </h1>
            <h2>Meetings</h2>
            <h4 style={{ fontWeight: 1000 }}>LEARN. LEAD. CONNECT</h4>
          </div>
          <div className="fb-login">
            <Button type="primary" block onClick={this.handleLoginWithFb}>
              Login
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
