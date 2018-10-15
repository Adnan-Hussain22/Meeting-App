import React, { Component } from "react";
import { Card, Button, Steps, Icon } from "antd";
import "antd/dist/antd.css";
import "./profile.css";
import firebase from "../../Config/firebase";
const Step = Steps.Step;
class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      step: 3
    };
  }

  render() {
    const { step } = this.state;
    return (
      <div className="profile-settings">
        {this.renderWizard()}
        {this.renderSteps()}
      </div>
    );
  }

  renderSteps = step => {
    return (
      <div>
        {step === 1 && this.renderUserInfo()}
        {step === 2 && this.renderUserImages()}
        {step === 3 && this.renderUserInterest()}
      </div>
    );
  };

  renderWizard = current => {
    return (
      <div className="wizard">
        <Steps current={current}>
          <Step title="Finished" description="Personal Info" />
          <Step title="In Progress" description="Images" />
          <Step title="Waiting" description="Interest" />
        </Steps>
      </div>
    );
  };

  renderUserInfo = () => {
    return <div>User Info</div>;
  };

  renderUserImages = () => {
    return <div>User Images</div>;
  };

  renderUserInterest = () => {
    return <div>User Intersts</div>;
  };
}

export default Profile;
