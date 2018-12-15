import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Route,
} from "react-router-dom";
import * as Screens from "../../Screens";

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
