import React, { Component } from "react";
import moment from "moment";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  NotificationCreater,
  ActionCreater
} from "../../Helpers/Actions/action";
import { List, Avatar, DatePicker, Card, Button, Pagination, Icon } from "antd";
import { miscellaneousActions, authActions } from "../../Redux/Actions";
import "antd/dist/antd.css";
import "./home.css";
import { fireStore } from "../../Config/firebase";
const { RangePicker } = DatePicker;
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: props.profile,
      currentAuth: props.user,
      loader: false,
      datedFetchedRecentMeetings: null,
      recentMeeting: null,
      currentPage: 0,
      meetingsDone: [],
      meetingsRequested: [],
      meetingsRejected: [],
      meetingsDoneLimit: 5,
      meetingsRequestedLimit: 5,
      meetingsRejectedLimit: 5
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      loading: nextProps.loader,
      currentAuth: nextProps.user,
      profile: nextProps.profile
    });
  }

  async componentDidMount() {
    const { profile } = this.state;
    if (profile) {
      this.handleFetchRecentMeetings();
      this.handleFetchMeetingsMeta();
      this.props.handleupdateNavigation("1");
    }
  }

  disabledDate(current) {
    // Can not select days before today and today
    return current && current > moment().endOf("day");
  }

  handleDateDiff(first, second) {
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
  }

  handleValidateDates(userDate) {
    // const now = new Data();
    // const recent  = new Date(now.setMonth(now.getMonth()+1));
    // const user  = new Date(userDate);
  }

  //fetch the recent meetings
  //either auto or ranged if the date are mentioned
  handleFetchRecentMeetings = async (dates = null) => {
    try {
      console.log(
        dates ? "Fetching with condition" : "Fetching without condition"
      );
      const meetingsRef = fireStore.collection("meetings");
      let recentMeetings = [];
      if (dates) {
        const query = meetingsRef
          .where("status", "==", "Accepted")
          .where("date", ">=", dates[0])
          .where("date", "<=", dates[1]);
        const snap = await query.get();
        snap.forEach(doc => {
          const data = doc.data();
          recentMeetings = recentMeetings.concat(data);
        });
      } else {
        const snap = await meetingsRef.get();
        snap.forEach(doc => {
          const data = doc.data();
          recentMeetings = recentMeetings.concat(data);
        });
      }
      console.log(recentMeetings);
      this.setState({ recentMeeting: recentMeetings });
    } catch (err) {
      console.log(err);
    }
  };

  handleFetchDatedMeetings = dates => {
    if (dates.length) {
      this.setState({ datedFetchedRecentMeetings: true, recentMeeting: null });
      const dates_d = [];
      dates_d.push(new Date(dates[0]._d).getTime());
      dates_d.push(new Date(dates[1]._d).getTime());
      console.log("fetching new data=>", dates_d);
      this.handleFetchRecentMeetings(dates_d);
    }
  };

  handleFetchMeetingsMeta = () => {
    this.handleFetchDoneMeetings();
    this.handleFetchRejectedMeetings();
    this.handleFetchRequestedMeetings();
  };

  handleFetchDoneMeetings = async () => {
    const { currentAuth, meetingsDoneLimit } = this.state;
    const meetingsRef = fireStore.collection("meetings");
    try {
      const query = meetingsRef
        .where("status", "==", "Done")
        .limit(meetingsDoneLimit);
      query.onSnapshot(snap => {
        let resArray = [];
        snap.forEach(doc => {
          const data = doc.data();
          if (data.requester.uid == currentAuth.uid) {
            resArray = resArray.concat({
              user: data.confirmer,
              location: data.location
            });
          } else if (data.confirmer.uid == currentAuth.uid) {
            resArray = resArray.concat({
              user: data.requester,
              location: data.location
            });
          }
        });
        if (resArray.length) this.setState({ meetingsDone: [...resArray] });
      });
    } catch (err) {
      console.log(err);
    }
  };

  handleFetchRequestedMeetings = async () => {
    const { currentAuth, meetingsRequestedLimit } = this.state;
    const meetingsRef = fireStore.collection("meetings");
    try {
      const query = meetingsRef
        .where("status", "==", "not set")
        .where("requester.uid", "==", currentAuth.uid)
        .limit(meetingsRequestedLimit);
      query.onSnapshot(snap => {
        let resArray = [];
        snap.forEach(doc => {
          const data = doc.data();
          if (data.requester.uid == currentAuth.uid) {
            resArray = resArray.concat({
              user: data.confirmer,
              location: data.location
            });
          } else if (data.confirmer.uid == currentAuth.uid) {
            resArray = resArray.concat({
              user: data.requester,
              location: data.location
            });
          }
        });
        if (resArray.length)
          this.setState({
            meetingsRequested: [...resArray]
          });
      });
    } catch (err) {
      console.log(err);
    }
  };

  handleFetchRejectedMeetings = () => {
    const { currentAuth, meetingsRejectedLimit } = this.state;
    const meetingsRef = fireStore.collection("meetings");
    try {
      const query = meetingsRef
        .where("status", "==", "Rejected")
        .limit(meetingsRejectedLimit);
      query.onSnapshot(snap => {
        let resArray = [];
        snap.forEach(doc => {
          const data = doc.data();
          if (data.requester.uid == currentAuth.uid) {
            resArray = resArray.concat({
              user: data.confirmer,
              location: data.location
            });
          } else if (data.confirmer.uid == currentAuth.uid) {
            resArray = resArray.concat({
              user: data.requester,
              location: data.location
            });
          }
        });
        if (resArray.length) this.setState({ meetingsRejected: [...resArray] });
      });
    } catch (err) {
      console.log(err);
    }
  };

  //validate which data should be fetched more regarding statistics
  //either requester, rejected or done
  handleValidateMoreFetchedStatistics = type => {
    console.log("handleValidateMoreFetchedStatistics==>", type);
    switch (type) {
      case "done": {
        console.log("fetching done");
        this.setState(
          { meetingsDoneLimit: this.state.meetingsDoneLimit * 2 },
          () => {
            this.handleFetchDoneMeetings();
          }
        );
        break;
      }
      case "req": {
        console.log("fetching requested");
        this.setState(
          { meetingsDoneLimit: this.state.meetingsRequestedLimit * 2 },
          () => {
            this.handleFetchRecentMeetings();
          }
        );
        break;
      }
      case "pend": {
        console.log("fetching rejected");
        this.setState(
          { meetingsDoneLimit: this.state.meetingsRejectedLimit * 2 },
          () => {
            this.handleFetchRejectedMeetings();
          }
        );
        break;
      }
    }
  };

  handleUpdateNavigation = () => {
    this.props.handleupdateNavigation("2");
    this.props.history.push("/dashboard/profile");
  };

  render() {
    const { loader, profile } = this.state;
    return (
      <div className="home-screen">
        {profile ? (
          this.renderUserStatistic()
        ) : loader ? (
          <h1>Fetching data</h1>
        ) : (
          this.renderSetProfileMessage()
        )}
      </div>
    );
  }

  renderSetProfileMessage = () => {
    const {} = this.state;
    return (
      <div className="set-profile">
        <h3 className="msg" style={{ textAlign: "center" }}>
          {`You have not set the profile yet,please set up your profile for
          seamless experience`}
        </h3>
        <div className="setProfile-action-container">
          <Button
            type="primary"
            shape="circle"
            icon="edit"
            size={"large"}
            onClick={this.handleUpdateNavigation}
          />
          <br />
          <span>Set Profile</span>
        </div>
      </div>
    );
  };

  renderUserStatistic = () => {
    return (
      <div className="user-statistics">
        {this.renderEventInfo()}
        {this.renderMeetingsMeta()}
      </div>
    );
  };

  renderEventInfo = () => {
    const { currentAuth, recentMeeting, profile } = this.state;
    return (
      <div className="event-meta">
        <div className="md-col-6">
          <List.Item className="user-info">
            <List.Item.Meta
              className="user-meta"
              avatar={
                <Avatar src={profile.images[0]} className="user-avatar" />
              }
              title={
                <div>
                  <h4>Welcome, Dashboard</h4>
                  <span className="user-name">{currentAuth.userName}</span>
                </div>
              }
              description={
                <span style={{ color: "black" }}>
                  Extreme Design Studio ©2018, All rights reserved
                </span>
              }
            />
          </List.Item>
          <RangePicker
            renderExtraFooter={() => ""}
            showTime
            disabledDate={this.disabledDate}
            className="event-date"
            onOk={this.handleFetchDatedMeetings}
          />
          <Button
            type="primary"
            disabled={
              !(
                this.state.datedFetchedRecentMeetings &&
                this.state.recentMeeting
              )
            }
            onClick={() => {
              this.setState({
                datedFetchedRecentMeetings: false,
                recentMeeting: null
              });
              this.handleFetchRecentMeetings();
            }}
          >
            Reset
          </Button>
        </div>
        <div className="md-col-6 events">
          {!recentMeeting && this.renderCardSkeleton()}
          {recentMeeting && recentMeeting.length > 0 && (
            <div>
              {this.renderRecentMeetings()}
              <Pagination
                current={this.state.currentPage}
                onChange={page => {
                  this.setState({ currentPage: page });
                }}
                total={recentMeeting.length}
                style={{ marginTop: "5px" }}
                pageSize={recentMeeting.length}
                hideOnSinglePage={true}
              />
            </div>
          )}
          {recentMeeting && !recentMeeting.length && (
            <h4 style={{ textAlign: "center" }}>No Recent Meetings</h4>
          )}
        </div>
      </div>
    );
  };

  renderRecentMeetings = () => {
    const gridStyle = {
      width: "calc(100% / 3)",
      textAlign: "center"
    };
    const { recentMeeting, currentPage } = this.state;
    return (
      <Card title="Recent Meeting">
        <Card.Grid style={gridStyle} className="grid-item">
          <h6>Name</h6>
          <span style={{ color: "#a09999" }}>
            {recentMeeting[0].confirmer.nickName}
          </span>
        </Card.Grid>
        <Card.Grid style={gridStyle} className="grid-item">
          <h6>Contact</h6>
          <span style={{ color: "#a09999" }}>
            {recentMeeting[0].confirmer.contact}
          </span>
        </Card.Grid>
        <Card.Grid style={gridStyle} className="grid-item">
          <h6>Meeting Location</h6>
          <span style={{ color: "#a09999" }}>
            {recentMeeting[currentPage].location.name}
          </span>
        </Card.Grid>
        <Card.Grid style={gridStyle} className="grid-item">
          <h6>Distance</h6>
          <span style={{ color: "#a09999" }}>
            {Math.round(recentMeeting[currentPage].location.distance / 1000)} KM
          </span>
        </Card.Grid>
        <Card.Grid style={gridStyle} className="grid-item">
          <h6>Meeting Date</h6>
          <span style={{ color: "#a09999" }}>
            {new Date(recentMeeting[currentPage].date).toLocaleDateString()}
          </span>
        </Card.Grid>
      </Card>
    );
  };

  renderCardSkeleton = () => {
    return <Card loading={true} className="card" />;
  };

  //method to render information about meetings
  renderMeetingsMeta = () => {
    const { meetingsDone, meetingsRejected, meetingsRequested } = this.state;
    return (
      <div className="meetings-meta">
        {this.renderMetaCard(meetingsDone, "Done Meetings", "done")}
        {this.renderMetaCard(meetingsRequested, "Requested Meetings", "req")}
        {this.renderMetaCard(meetingsRejected, "Rejected Meetings", "pend")}
      </div>
    );
  };

  //method to render meetings meta in cards
  renderMetaCard = (data, text, type) => {
    return (
      <Card
        style={{ minHeight: 300, border: "1px solid" }}
        className="meta-card"
        style={{ width: "cal(100%/3)" }}
      >
        <div className="meta-type">{text}</div>
        <div className="total">
          <span>{data.length}</span>
        </div>
        <div className="brand">
          <span>Total</span>
        </div>
        <div className="list">
          {data.length ? (
            this.renderUsersGrid(data)
          ) : (
            <h6 style={{ textAlign: "center", color: "#e60000" }}>
              No data found
            </h6>
          )}
        </div>
        <div className="button">
          <Button
            size={"large"}
            disabled={data.length == 0}
            onClick={() => {
              this.handleValidateMoreFetchedStatistics(type);
            }}
          >
            More
          </Button>
        </div>
      </Card>
    );
  };

  //method to render the users in grid involved in done meetings
  renderUsersGrid = data => {
    const gridStyle = {
      width: "calc(100% / 3)",
      textAlign: "center"
    };
    return (
      <Card title="" className="list-grid">
        {data.map((value, index) => (
          <Card.Grid style={gridStyle} className="grid-item" key={index}>
            <span style={{ color: "#a09999" }}>{value.user.nickName}</span>
          </Card.Grid>
        ))}
      </Card>
    );
  };
}
//THis Function will get the updated store
const mapStateToProps = state => {
  console.log(state);
  return {
    user: state.authReducers.user,
    loader: state.miscellaneousReducers.loader,
    profile: state.authReducers.profile
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateLoader: data => dispatch(miscellaneousActions.updateLoader(data)),
    updateProfile: data => dispatch(authActions.updateProfile(data))
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Home)
);
