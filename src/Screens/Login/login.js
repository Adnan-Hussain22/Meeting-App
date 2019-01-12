import React, { Component } from "react";
import { Card, Button } from "antd";
import { Redirect } from "react-router-dom";
import "antd/dist/antd.css";
import eyeLogo from "../../Helpers/Images/Eye Logo.jpg";
import "./login.css";
import firebase from "../../Config/firebase";
import { connect } from "react-redux";
import { authActions, loaderActions } from "../../Redux/Actions";
const provider = new firebase.auth.FacebookAuthProvider();
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: null
    };
  }

  static getDerivedStateFromPops(props, state) {
    return { currentAuth: props.user };
  }

  handleLoginWithFb = () => {
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(result => {
        const currentAuth = {
          userName: result.user.displayName,
          avatar: result.user.photoURL,
          uid: result.user.uid
        };
        this.props.updateUser({ ...currentAuth });
        setTimeout(() => {
          this.props.history.replace({ pathname: "/dashboard" });
        }, 5000);
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
    return !this.props.user ? (
      this.renderLoginScreen()
    ) : (
      <Redirect to="/dashboard" />
    );
  }

  renderLoginScreen = () => {
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
            <h4 style={{ fontWeight: 1000 }}>LEARN, LEAD, CONNECT</h4>
          </div>
          <div className="fb-login">
            <Button type="primary" block onClick={this.handleLoginWithFb}>
              Login
            </Button>
          </div>
        </div>
      </div>
    );
  };
}

//THis Function will get the updated store
const mapStateToProps = state => {
  return {
    user: state.authReducers.user
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateUser: user => dispatch(authActions.updateUser(user))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
