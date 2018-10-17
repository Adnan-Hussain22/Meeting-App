import React, { Component } from "react";
import { Card, Button } from "antd";
import "antd/dist/antd.css";
import "./dashboard.css";
import Wizard from "../../Components/Wizard/wizard";
import defaultAvatar from "../../Helpers/Images/default Avatar.jpg";
import firebase, { fireStore } from "../../Config/firebase";
import { Layout, Menu, Icon } from "antd";
const { SubMenu } = Menu;
const { Header, Content, Footer, Sider } = Layout;
class Dasboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentAuth: { ...props.currentAuth },
      menuSelected: "1",
      headerMenu: false,
      profileSet: false,
      avatar: ""
    };
  }

  componentDidMount() {
    const { currentAuth } = this.state;
    if (currentAuth) {
      const userRef = fireStore.collection("usersProfile").doc(currentAuth.uid);
      userRef.get().then(doc => {
        if (doc.exists) {
          const data = doc.data();
          this.setState({ profileSet: true, avatar: data.images[0] });
        }
      });
    }
  }

  handleShowHeaderMenu = () => {
    const { headerMenu } = this.state;
    this.setState({ headerMenu: !headerMenu });
  };

  handleShowProfileInfo = () => {
    this.setState({ menuSelected: "2" });
  };

  render() {
    return <div className="dashboard-screen">{this.renderDashboard()}</div>;
  }

  //Method to render the dashboard
  renderDashboard = () => {
    const { currentAuth, profileSet, menuSelected, avatar } = this.state;
    const avatarImg = avatar ? avatar : 
    (currentAuth.avatar ? currentAuth.avatar : defaultAvatar)
    return (
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
            <img
              src={avatarImg}
            />
          </div>
          <div>
            <h4 style={{ color: "white", textAlign: "center" }}>
              {currentAuth.userName ? currentAuth.userName : "User Name"}
            </h4>
          </div>
          <Menu
            theme="light"
            mode="inline"
            defaultSelectedKeys={[menuSelected]}
          >
            <Menu.Item key="1" onClick={this.handleMenuClick}>
              <Icon type="user" />
              <span className="nav-text">Profile Info</span>
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="video-camera" />
              <span className="nav-text">Menu No 2</span>
            </Menu.Item>
            <Menu.Item key="3">
              <Icon type="upload" />
              <span className="nav-text">Menu No 3</span>
            </Menu.Item>
            <Menu.Item key="4">
              <Icon type="user" />
              <span className="nav-text">Menu No 4</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header className="dashboard-header">{this.renderHeader()}</Header>
          <Content style={{ margin: "24px 16px 0" }}>
            <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
              {!profileSet && <Wizard />}
              {profileSet && <h2 style={{textAlign:'center'}}>You have already set the profile settings</h2>}
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>
            Extreme Design Studio ©2018 Created by Adnan Hussain
          </Footer>
        </Layout>
      </Layout>
    );
  };

  //Method to render the header
  renderHeader = () => {
    const { headerMenu } = this.state;
    return (
      <div className="dash-header" style={{ position: "relative" }}>
        <div className="menu-hamburger">
          <div className="menu">
            <Icon
              className="trigger"
              type={this.state.headerMenu ? "menu-unfold" : "menu-fold"}
              onClick={this.handleShowHeaderMenu}
            />
          </div>
          <Menu
            style={{ width: 256, display: headerMenu ? "block" : "none" }}
            theme={"light"}
            className="header-menu"
          >
            <Menu.Item key="1" onClick={this.props.handleLogout}>
            <Icon type="poweroff" theme="outlined" />
              Logout
            </Menu.Item>
            <Menu.Item key="2">
            <Icon type="eye" theme="outlined" />
              Some other menu
            </Menu.Item>
          </Menu>
        </div>
      </div>
    );
  };
}

export default Dasboard;
