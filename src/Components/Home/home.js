import React, { Component } from "react";
import moment from "moment";
import { connect } from "react-redux";
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
      recentMeeting: [],
      currentPage: 0,
      meetingsDone: [],
      meetingsRequested: [],
      meetingsPending: []
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
    }
  }

  range(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  disabledDate(current) {
    // Can not select days before today and today
    return current && current < moment().endOf("day");
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

  handleFetchRecentMeetings = (dates = null) => {
    const meetingsRef = fireStore.collection("meetings");
    const meetingsRefQuery = meetingsRef
      .where("status", "==", "Accepted")
      .orderBy("date", "asc");
    if (dates == null) {
      console.log("Fetching without condition");
      let dateArray = [];
      meetingsRefQuery
        .limit(5)
        .get()
        .then(res => {
          res.forEach(doc => {
            dateArray = dateArray.concat({ ...doc.data() });
          });
          this.setState({ recentMeeting: dateArray });
        });
      return;
    }
    console.log("fetching with condition");
    let recentArray = [];
    meetingsRefQuery
      .get()
      .then(res => {
        res.forEach(doc => {
          const data = doc.data();
          const date_d = new Date(data.date);
          if (date_d >= dates[0] && date_d <= dates[1]) {
            console.log("conditioned true");
            recentArray = recentArray.concat(data);
          }
        });
        if (recentArray.length) this.setState({ recentMeeting: recentArray });
        else
          NotificationCreater(
            "warning",
            "No data found!",
            "No data found as per the dates"
          );
      })
      .catch(err => {
        console.log(err);
      });
  };

  handleFetchDatedMeetings = dates => {
    if (dates.length) {
      const dates_d = [];
      dates_d.push(dates[0]._d);
      dates_d.push(dates[1]._d);
      console.log("fetching new data=>", dates_d);
      this.handleFetchRecentMeetings(dates_d);
    }
  };

  handleFetchMeetingsMeta = () => {
    this.handleFetchDoneMeetings();
    this.handleFetchPendingMeetings();
    this.handleFetchRequestedMeetings();
  };

  handleFetchDoneMeetings = () => {
    const { currentAuth } = this.state;
    const meetingsRef = fireStore.collection("meetings");
    const query = meetingsRef.where("status", "==", "Done");
    query.get().then(res => {
      let resArray = [];
      res.forEach(doc => {
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
  };

  handleFetchRequestedMeetings = () => {
    const { currentAuth } = this.state;
    const meetingsRef = fireStore.collection("meetings");
    const query = meetingsRef.where("status", "==", "not set");
    query.get().then(res => {
      let resArray = [];
      res.forEach(doc => {
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
      if (resArray.length) this.setState({ meetingsRequested: [...resArray] });
    });
  };

  handleFetchPendingMeetings = () => {
    const { currentAuth } = this.state;
    const meetingsRef = fireStore.collection("meetings");
    const query = meetingsRef.where("status", "==", "Accepted");
    query.get().then(res => {
      let resArray = [];
      res.forEach(doc => {
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
      if (resArray.length) this.setState({ meetingsPending: [...resArray] });
    });
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
                  Ant Design, a design language for background applications, is
                  refined by Ant UED Team
                </span>
              }
            />
          </List.Item>
          {/* <DatePicker
            format="YYYY-MM-DD HH:mm:ss"
            disabledDate={this.disabledDate}
            className="event-date"
          /> */}
          <RangePicker
            renderExtraFooter={() => ""}
            showTime
            disabledDate={this.disabledDate}
            className="event-date"
            onOk={this.handleFetchDatedMeetings}
          />
        </div>
        <div className="md-col-6 events">
          {recentMeeting.length > 0 && (
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
          {!recentMeeting && <h4>No Recent Meetings</h4>}
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

  //method to render information about meetings
  renderMeetingsMeta = () => {
    const { meetingsDone, meetingsPending, meetingsRequested } = this.state;
    console.log(meetingsDone.length);
    return (
      <div className="meetings-meta">
        {this.renderMetaCard(meetingsDone, "Done Meetings")}
        {this.renderMetaCard(meetingsRequested, "Requested Meetings")}
        {this.renderMetaCard(meetingsPending, "Pending Meetings")}
      </div>
    );
  };

  //method to render meetings meta in cards
  renderMetaCard = (data, type) => {
    return (
      <Card
        style={{ minHeight: 300, border: "1px solid" }}
        className="meta-card"
        style={{ width: "cal(100%/3)" }}
      >
        <div className="meta-type">{type}</div>
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
          <Button size={"large"} disabled={data.length == 0}>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
