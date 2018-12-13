import React, { Component } from "react";
import {
  withRouter,
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import * as Screens from "../../Screens";
import * as DasboardComponents from "../../Components";

const Routes = props => (
  <Router>
    <div>
      <Route exact path="/" component={Screens.Login} />
      <Route path="/dashboard" component={Screens.Dashboard} />
    </div>
  </Router>
);

// const PrivateRoute = ({ component: Component, ...rest }) => {
//   const currentAuth = localStorage["eyeOnEye"]
//     ? JSON.parse(localStorage["eyeOnEye"])
//     : null;
//   return (
//     <Route
//       {...rest}
//       render={props =>
//         currentAuth ? (
//           <Component {...props} />
//         ) : (
//           <Redirect
//           exact={true}
//           to={{pathname:"/"}}
//           />
//         )
//       }
//     />
//   );
// };

export default Routes;
