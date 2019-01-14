import React, { Component } from "react";
import { connect } from "react-redux";
import { updateUser, removeUser } from "./Redux/Actions/authActions";
import IndexRoutes from "./Config/Routes";
import { withRouter } from "react-router-dom";
class App extends Component {
  constructor(props) {
    super();
    this.state = {
      // set the current user if the user is authenticated or set to null
      currentAuth: props.user ? props.user : null
    };
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.user);
    if (nextProps.user) {
      this.setState({ currentAuth: nextProps.user });
    }
  }
  componentDidMount() {}

  render() {
    return (
      <div className="App">
        <IndexRoutes />
      </div>
    );
  }
}

//THis Function will get the updated store
const mapStateToProps = state => {
  console.log(state);
  return {
    user: state.authReducers.user
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateUser: user => dispatch(updateUser(user)),
    removeUser: () => dispatch(removeUser())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
