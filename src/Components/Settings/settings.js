import React, { Component } from "react";
import { Card, Button } from "antd";
import "antd/dist/antd.css";
import "./settings.css";
import avatar from '../../Helpers/Images/avatar.jpg';
import firebase from "../../Config/firebase";
class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      avatar: props.avatar ? props.avatar : avatar,
      userName: "",
      descriptions: ""
    };
  }

  render() {
    return( 
      <div className="panel-settings">
        {this.renderUserInfo()}
      </div>
    )
  }

  renderUserInfo = () => {
    const { avatar } = this.state;
    return (
      <div className="user-info">
        <div className="avatar">
          <img src={avatar} />
        </div>
        <div className="info">
          <h2>User Name</h2>
          <p>Short Description</p>
        </div>
      </div>
    );
  };

  renderSettings() {
    return <div className="settings" />;
  }

  renderSetting() {
    return <div className="setting" />;
  }
}

export default Settings;
