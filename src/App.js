import React, { Component } from "react";
import Login from "./Screens/Login/login";
import { Provider,connect } from "react-redux";
import {updateUser,removeUser} from './Redux/Actions/authActions';
import IndexRoutes from './Config/Routes'
import store from "./Redux/store";
import Dasboard from "./Screens/Dasboard/Dasboard";
class App extends Component {
  constructor(props) {
    super();
    this.state = {
      // set the current user if the user is authenticated or set to null
      currentAuth: props.user ? props.user : null
    };
  }

  componentWillReceiveProps(nextProps){
    console.log(nextProps.user)
    if(nextProps.user){
      this.setState({currentAuth:nextProps.user})
    }
  }

  // static getDerivedStateFromPops(props, state) {
  //   console.log(props.user);
  //     return { currentAuth: props.user };
  // }

  // handleLogin = currentAuth => {
  //   const user = {
  //     userName: currentAuth.displayName,
  //     avatar: currentAuth.photoURL,
  //     uid: currentAuth.uid
  //   };
  //   this.setState({ currentAuth: user });
  // };

  componentDidMount() {}

  render() {
    const { currentAuth } = this.state;
    return (
        <div className="App">
          {/* {!currentAuth && <Login />}
          {currentAuth && <Dasboard />} */}
          <IndexRoutes/>
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

const mapDispatchToProps = (dispatch) => {
  return{
    updateUser: user=> dispatch(updateUser(user)),
    removeUser: ()=> dispatch(removeUser())
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

