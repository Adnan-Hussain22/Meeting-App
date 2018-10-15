import React, { Component } from "react";
import { Card, Button } from "antd";
import "antd/dist/antd.css";
import "./dashboard.css";
import firebase from "../../Config/firebase";
import SettingsPanel from "../../Components/Settings/settings";
import Wizard from "../../Components/Wizard/wizard";
import DataPanel from "../../Components/Data/data";
import avatar from "../../Helpers/Images/avatar.jpg";
import { Layout, Menu, Icon } from "antd";
const { Header, Content, Footer, Sider } = Layout;
class Dasboard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="dashboard-screen">
        <Layout>
          <Sider
            breakpoint="md"
            collapsedWidth="0"
            onBreakpoint={broken => {
              console.log(broken);
            }}
            onCollapse={(collapsed, type) => {
              console.log(collapsed, type);
            }}
          >
            <div className="avatar">
              <img src={avatar} />
            </div>
            <div>
              <h4 style={{ color: "white", textAlign: "center" }}>User Name</h4>
            </div>
            <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
              <Menu.Item key="1">
                <Icon type="user" />
                <span className="nav-text">Profile Info</span>
              </Menu.Item>
              {/* <Menu.Item key="2">
                <Icon type="video-camera" />
                <span className="nav-text">nav 2</span>
              </Menu.Item>
              <Menu.Item key="3">
                <Icon type="upload" />
                <span className="nav-text">nav 3</span>
              </Menu.Item>
              <Menu.Item key="4">
                <Icon type="user" />
                <span className="nav-text">nav 4</span>
              </Menu.Item> */}
            </Menu>
          </Sider>
          <Layout>
            <Header style={{ background: "#fff", padding: 0 }} />
            <Content style={{ margin: "24px 16px 0" }}>
              <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
                <Wizard />
              </div>
            </Content>
            <Footer style={{ textAlign: "center" }}>
              Extreme Design Studio ©2018 Created by Adnan Hussain
            </Footer>
          </Layout>
        </Layout>
      </div>
    );
  }

  renderHeader = () => {
    return <div className="dash-header">Dasboard Header</div>;
  };
}

export default Dasboard;
