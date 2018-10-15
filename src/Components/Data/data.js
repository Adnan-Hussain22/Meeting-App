import React, { Component } from "react";
import { Card, Button } from "antd";
import "antd/dist/antd.css";
import "./data.css";
import firebase from "../../Config/firebase";
import Profile from "../Profile/profile";
class Data extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: null
    };
  }

  render() {
    const { profile } = this.state;
    return (
      <div className="panel-data">
        {/* 
            Users Data
            Profile 
      */}
        {!profile && <Profile />}
        {profile && this.renderUsers()}
      </div>
    );
  }

  renderUsers = () => {
    return <div>Users Data</div>;
  };
}
export default Data;
