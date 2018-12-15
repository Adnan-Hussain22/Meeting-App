import React from "react";
import {Route } from "react-router-dom";

import * as DasboardComponents from "../../Components";

const Routes = props => (
      <div>
        <Route
      exact
        path="/dashboard/"
        render={childProps => <DasboardComponents.Home {...props} />}
      />
        <Route
      exact
        path="/dashboard/profile"
        render={childProps => <DasboardComponents.WizardProfile {...props} />}
      />
      <Route
        exact
        path="/dashboard/Set_Meetings"
        render={() => <DasboardComponents.WizardSetMeetings {...props} />}
      />
      <Route
        exact
        path="/dashboard/Meetings"
        render={() => <DasboardComponents.Meetings {...props} />}
      />
      </div>
);

export default Routes;
