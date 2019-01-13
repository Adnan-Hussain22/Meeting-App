import React, { Component } from "react";
import DasboardRoutes from "../../Config/Routes/DashboardRoutes.js";
import { connect } from "react-redux";
import { Redirect, Link } from "react-router-dom";
import "antd/dist/antd.css";
import "./dashboard.css";
import { ActionCreater } from "../../Helpers/Actions/action";
import defaultAvatar from "../../Helpers/Images/default Avatar.jpg";
import {
  authActions,
  miscellaneousActions,
  meetingActions
} from "../../Redux/Actions";
import { Layout, Menu, Icon, Tooltip, List, Avatar, Badge } from "antd";
import { fireStore } from "../../Config/firebase";
import Loader from "../../Components/Loader/loader";
const { Header, Content, Footer, Sider } = Layout;
class Dasboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentAuth: props.user,
      navigation: "2",
      headerMenu: false,
      profileSet: true,
      setMeeting: true,
      isNotifationListOpen: null,
      notifications: [],
      loading: null,
      profile: props.profile
    };
  }

  async componentDidMount() {
    const { profile, currentAuth } = this.state;
    if (!(profile && currentAuth.uid == profile.uid))
      await this.handleValidateProfile();
    this.handleValidateRequests();
    this.handleValidateNavigation();
  }

  //validate the url
  // than update the navigation menu
  handleValidateNavigation = () => {
    const route = this.props.location.pathname;
    switch (route) {
      case "/dashboard": {
        this.handleupdateNavigation('1');
        break;
      }
      case "/dashboard/": {
        this.handleupdateNavigation('1');
        break;
      }
      case "/dashboard/profile": {
        this.handleupdateNavigation('2');
        break;
      }
      case "/dashboard/Set_Meetings": {
        this.handleupdateNavigation('3');
        break;
      }
      case "/dashboard/Meetings": {
        this.handleupdateNavigation('4');
        break;
      }
      default:{
        //unselect the route
        //if the route not exists
        this.handleupdateNavigation('100');
      }
    }
  };

  //validate if the profile is setup or not
  //if not than ask the user to fist setup the profile
  handleValidateProfile = async () => {
    const { currentAuth } = this.state;
    if (currentAuth) {
      console.log("getting data=>");
      this.props.updateLoader(true);
      const userProfileRef = fireStore
        .collection("usersProfile")
        .doc(currentAuth.uid);
      const doc = await userProfileRef.get();
      this.props.updateLoader(false);
      if (doc.exists) this.props.updateProfile({ ...doc.data() });
      else {
        ActionCreater(
          "warning",
          "Profile not set",
          `Dear user please set up your profile to seamless experience`
        );
      }
    }
  };

  //get the requested meetings of the user
  handleValidateRequests = async () => {
    const meetingsRef = fireStore.collection("meetings");
    const query = meetingsRef
      .where("confirmer.uid", "==", `${this.state.currentAuth.uid}`)
      .where("status", "==", "not set");
    let notifications = [];
    (await query.get()).forEach(doc => {
      const data = doc.data();
      const noticationObj = {
        title: data.requester.nickName,
        description: `${data.requester.nickName} requested for the meeting at ${
          data.location.name
        } on ${new Date(data.date).toLocaleDateString()}`,
        avatar: data.requester.images[0],
        uid: doc.id
      };
      notifications = notifications.concat(noticationObj);
    });
    this.setState({ notifications });
  };

  handleNotificationClick = (e, id) => {
    e.preventDefault();
    if (id) this.props.history.push(`/dashboard/meetings#${id}`);
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      loading: nextProps.loader,
      currentAuth: nextProps.user,
      profile: nextProps.profile
    });
  }

  handleSetProfile = () => {
    this.setState({ profileSet: true });
  };

  handleShowHeaderMenu = () => {
    const { headerMenu } = this.state;
    this.setState({ headerMenu: !headerMenu });
  };

  handleShowProfileInfo = () => {
    this.setState({ menuSelected: "2" });
  };

  handleLogout = () => {
    this.props.updateUser(null);
    this.props.history.replace({ pathname: "/" });
  };

  handleMenuClick = (route, item) => {
    this.props.history.push(route);
    this.setState({ navigation: item });
  };

  handleupdateNavigation = item => {
    this.setState({ navigation: item });
  };

  render() {
    return this.props.user ? (
      <div className="dashboard-screen">
        <Loader enabled={this.state.loading} />
        {this.renderDashboard()}
      </div>
    ) : (
      <Redirect exact to="/" />
    );
  }

  //Method to render the dashboard
  renderDashboard = () => {
    return (
      <Layout className="dashboard-layout">
        {this.renderSlider()}
        <Layout className="main-layout">
          {this.renderHeader()}
          {this.renderMainContent()}
          {this.renderFooter()}
        </Layout>
      </Layout>
    );
  };

  //Method to render the header
  renderHeader = () => {
    const { headerMenu, isNotifationListOpen, notifications } = this.state;
    return (
      <Header className="dashboard-header">
        <div className="dash-header" style={{ position: "relative" }}>
          <div className="menu-hamburger">
            <div className="menu">
              {notifications.length > 0 && (
                <Badge
                  count={notifications.length}
                  className="notification-count"
                />
              )}
              <Tooltip
                placement="topLeft"
                title="Notifications"
                className="notication-btn"
              >
                <Icon
                  type="global"
                  onClick={() => {
                    this.setState({
                      isNotifationListOpen: !isNotifationListOpen
                    });
                  }}
                />
              </Tooltip>
              <div className="meeting-notifications">
                {this.renderMeetingNotification()}
              </div>
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
              <Menu.Item key="1" onClick={this.handleLogout}>
                <Icon type="poweroff" theme="outlined" />
                Logout
              </Menu.Item>
            </Menu>
          </div>
        </div>
      </Header>
    );
  };

  //method to render the left navigation slider
  renderSlider = () => {
    const { currentAuth, navigation, profile } = this.state;
    const avatarImg = profile ? profile.images[0] : defaultAvatar;
    return (
      <Sider
        breakpoint="md"
        collapsedWidth="0"
        onBreakpoint={broken => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
        className="dashboard-slider"
      >
        <div className="avatar">
          <img src={avatarImg} />
        </div>
        <div>
          <h4 style={{ color: "white", textAlign: "center" }}>
            {currentAuth.userName ? currentAuth.userName : "User Name"}
          </h4>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[navigation]}
          className="dasboard-navigation"
        >
          <Menu.Item
            key="1"
            onClick={e => {
              this.handleMenuClick("/dashboard/", "1");
            }}
            className="navigation-menu"
          >
            <Icon type="home" />
            <span className="nav-text">Home</span>
          </Menu.Item>
          <Menu.Item
            key="2"
            onClick={e => {
              this.handleMenuClick("/dashboard/profile", "2");
            }}
            className="navigation-menu"
          >
            <Icon type="user" />
            <span className="nav-text">Profile</span>
          </Menu.Item>
          <Menu.Item
            key="3"
            onClick={e => {
              this.handleMenuClick("/dashboard/Set_Meetings", "3");
            }}
            className="navigation-menu"
          >
            <Icon type="team" theme="outlined" />
            <span className="nav-text">Set a Meeting</span>
          </Menu.Item>
          <Menu.Item
            key="4"
            onClick={e => {
              this.handleMenuClick("/dashboard/Meetings", "4");
            }}
            className="navigation-menu"
          >
            <Icon type="team" theme="outlined" />
            <span className="nav-text">Meetings</span>
          </Menu.Item>
        </Menu>
      </Sider>
    );
  };

  //method to render main components of dashboard
  renderMainContent = () => {
    return (
      <Content style={{ margin: "24px 16px 0" }} className="main-content">
        <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
          <DasboardRoutes
            handleupdateNavigation={this.handleupdateNavigation}
            handleValidateProfile={this.handleValidateProfile}
            {...this.props}
          />
        </div>
      </Content>
    );
  };

  //method to render footer
  renderFooter = () => {
    return (
      <Footer style={{ textAlign: "center" }}>
        Extreme Design Studio ©2018 Created by Adnan Hussain
      </Footer>
    );
  };

  renderMeetingNotification = () => {
    const { isNotifationListOpen, notifications } = this.state;
    return (
      <List
        itemLayout="horizontal"
        className={
          "notification-list " +
          (isNotifationListOpen ? "notifications-open" : "") +
          (notifications ? " notifications" : "")
        }
        dataSource={notifications}
        renderItem={item => (
          <List.Item
            onClick={e => {
              this.handleNotificationClick(e, item.uid);
            }}
            className="notification-item"
          >
            <List.Item.Meta
              onClick={e => {
                this.handleNotificationClick(e, item.uid);
              }}
              avatar={<Avatar src={item.avatar} />}
              title={
                <a
                  href="#"
                  onClick={e => {
                    this.handleNotificationClick(e, item.uid);
                  }}
                >
                  {item.title}
                </a>
              }
              description={item.description}
              className="notification-item"
            />
          </List.Item>
        )}
      />
    );
  };
}

//THis Function will get the updated store
const mapStateToProps = state => {
  console.log(state);
  return {
    user: state.authReducers.user,
    profile: state.authReducers.profile,
    loader: state.miscellaneousReducers.loader,
    meetingList: state.meetingsReducers.list,
    navigation: state.miscellaneousReducers.navigation
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateUser: user => dispatch(authActions.updateUser(user)),
    removeUser: () => dispatch(authActions.removeUser()),
    updateLoader: data => dispatch(miscellaneousActions.updateLoader(data)),
    updateMeetingList: data => dispatch(meetingActions.updateMeetingList(data)),
    updateProfile: data => dispatch(authActions.updateProfile(data))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dasboard);
