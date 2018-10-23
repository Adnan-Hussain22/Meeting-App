import React, { Component } from "react";
import {
  withRouter,
  BrowserRouter as Router,Switch,
  Route,
  Redirect
} from "react-router-dom";
import * as Screens from "../../Screens";

const Routes = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={Screens.Login} />
      <PrivateRoute spath="/dashboard" component={Screens.Dashboard}/>
    </Switch>
  </Router>
);

const PrivateRoute = ({ component: Component, ...rest }) => {
  const currentAuth = localStorage["eyeOnEye"]
    ? JSON.parse(localStorage["eyeOnEye"])
    : null;
  return (
    <Route
      {...rest}
      render={props =>
        currentAuth ? (
          <Component {...props} />
        ) : (
          <Redirect
          exact={true}
          to={{pathname:"/"}}
          />
        )
      }
    />
  );
};

export default Routes