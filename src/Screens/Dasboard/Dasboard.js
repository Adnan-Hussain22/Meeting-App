import React, { Component } from "react";
import { connect } from "react-redux";
import "antd/dist/antd.css";
import "./dashboard.css";
import WizardProfile from "../../Components/WizardProfile/wizard";
import Meetings from "../../Components/Meetings/meetings";
import defaultAvatar from "../../Helpers/Images/default Avatar.jpg";
import {
  authActions,
  loaderActions,
  meetingActions
} from "../../Redux/Actions";
import { Layout, Menu, Icon, Tooltip, List, Avatar, Badge } from "antd";
import WizardSetMeeting from "../../Components/WizardSetMeeting/wizard";
const { Header, Content, Footer, Sider } = Layout;
class Dasboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentAuth: { ...props.user },
      menuSelected: "3",
      headerMenu: false,
      profileSet: true,
      setMeeting: true,
      avatar: "",
      isNotifationListOpen: null,
      notifications: true
    };
  }

  static getDerivedStateFromPops(props, state) {
    console.log(props);
    return { currentAuth: props.user };
  }

  componentDidMount() {
    this.props.updateLoader({ loader: null });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.meetingList && nextProps.meetingList.length) {
      const notifications = nextProps.meetingList.map(value => {
        return {
          title: value.requester.nickName,
          description: `${
            value.requester.nickName
          } requested for the meeting at ${value.location.name} on ${new Date(
            value.date
          ).toLocaleDateString()}`,
          avatar: value.requester.images[0]
        };
      });
      this.setState({ notifications });
    } else {
      this.setState({ notifications: [] });
    }
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

  render() {
    return <div className="dashboard-screen">{this.renderDashboard()}</div>;
  }

  //Method to render the dashboard
  renderDashboard = () => {
    const {
      currentAuth,
      profileSet,
      menuSelected,
      avatar,
      setMeeting
    } = this.state;
    const avatarImg = avatar
      ? avatar
      : currentAuth.avatar
      ? currentAuth.avatar
      : defaultAvatar;
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
            defaultSelectedKeys={[menuSelected]}
          >
            <Menu.Item key="1" onClick={this.handleMenuClick}>
              <Icon type="user" />
              <span className="nav-text">Profile</span>
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="team" theme="outlined" />
              <span className="nav-text">Set a Meeting</span>
            </Menu.Item>
            <Menu.Item key="3">
              <Icon type="team" theme="outlined" />
              <span className="nav-text">Meetings</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header className="dashboard-header">{this.renderHeader()}</Header>
          <Content style={{ margin: "24px 16px 0" }}>
            <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
              {!profileSet && (
                <WizardProfile handleSetProfile={this.handleSetProfile} />
              )}
              {profileSet && !setMeeting && <WizardSetMeeting />}
              {setMeeting && <Meetings />}
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
    const { headerMenu, isNotifationListOpen, notifications } = this.state;
    return (
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
            <List
              itemLayout="horizontal"
              className={
                "notification-list " +
                (isNotifationListOpen ? "notifications-open" : "") +
                (notifications ? " notifications" : "")
              }
              dataSource={notifications}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} />}
                    title={<a href="#">{item.title}</a>}
                    description={item.description}
                    className="notification-item"
                  />
                </List.Item>
              )}
            />
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

//THis Function will get the updated store
const mapStateToProps = state => {
  return {
    user: state.authReducers.user,
    loader: state.loaderReducers.loader,
    meetingList: state.meetingsReducers.list
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateUser: user => dispatch(authActions.updateUser(user)),
    removeUser: () => dispatch(authActions.removeUser()),
    updateLoader: data => dispatch(loaderActions.updateLoader(data)),
    updateMeetingList: data => dispatch(meetingActions.updateMeetingList(data))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dasboard);
