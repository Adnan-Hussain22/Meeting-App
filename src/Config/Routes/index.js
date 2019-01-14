import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import * as Screens from "../../Screens";

const Routes = props => (
  <Router basename={process.env.PUBLIC_URL}>
    <Switch>
      <Route exact path="/" component={Screens.Login} />
      <Route path="/dashboard" component={Screens.Dashboard} />
    </Switch>
  </Router>
);

export default Routes;
