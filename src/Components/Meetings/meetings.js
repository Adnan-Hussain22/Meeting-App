import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import AddToCalendar from "react-add-to-calendar";
import "react-add-to-calendar/dist/react-add-to-calendar.css";
import {
  authActions,
  meetingActions,
  miscellaneousActions
} from "../../Redux/Actions";
import { ActionCreater } from "../../Helpers/Actions/action";
import {
  Card,
  Button,
  Skeleton,
  Avatar,
  Icon,
  Tooltip,
  Modal,
  Popconfirm,
  Pagination
} from "antd";
import { fireStore } from "../../Config/firebase";
import {
  withGoogleMap,
  GoogleMap,
  withScriptjs,
  DirectionsRenderer
} from "react-google-maps";
import _ from "lodash";
import "antd/dist/antd.css";
import "./meetings.css";
const { Meta } = Card;
/* eslint-disable no-undef */
class Meetings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      meetingList: null,
      currentAuth: props.user,
      filteredMeetingList: null,
      paginatedList: null,
      isOpenMapModal: false,
      isOpenCalenderModal: false,
      directions: false,
      event: null,
      calenders: [{ google: "Google" }]
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      {
        meetingList: nextProps.meetingList,
        currentAuth: nextProps.user
      },
      () => {
        if (this.state.meetingList)
          this.handleFilterMeetingList(
            this.props.location.hash,
            nextProps.meetingList
          );
      }
    );
  }

  //filter the meeting list of the bases notification selected
  handleFilterMeetingList = (id, meetingList) => {
    let filteredMeetingList = [...meetingList];
    if (id) {
      filteredMeetingList = _.filter(meetingList, function(elem) {
        return elem.Id == id;
      });
    }
    if (!filteredMeetingList.length) filteredMeetingList = [...meetingList];
    this.setState({ filteredMeetingList }, () => {
      this.handleGetNextPageData(1, 10);
    });
  };

  //fetch all pending meetings from db
  // the data include the data which is atleast matches
  // to one item of interest and duration of current user
  handleFetchMeetings = async (id = null) => {
    const meetingsRef = fireStore.collection("meetings");
    const query = meetingsRef
      .where("status", "==", "not set")
      .where("confirmer.uid", "==", this.props.user.uid);
    const meetingList = [];
    try {
      const dataSnap = await query.get();
      if (!dataSnap.empty) {
        dataSnap.forEach(doc => {
          const data = doc.data();
          if (data.requester.uid != this.props.user.uid) {
            meetingList.push({ ...data, Id: doc.id });
          }
        });
      }
      this.props.updateMeetingList(meetingList);
      if (!meetingList.length) {
        ActionCreater(
          "info",
          "No Pending Requests",
          <div>
            <p>There are no pending requests</p>
          </div>
        );
      }
    } catch (err) {
    } finally {
      this.props.updateLoader(null);
    }
  };

  //get the next page data
  // when next btn is selected
  handleGetNextPageData = (page, pageSize) => {
    const { filteredMeetingList } = this.state;
    const End =
      page * pageSize <= filteredMeetingList.length
        ? page * pageSize
        : filteredMeetingList.length;
    const start = page * pageSize - 10;
    let data = [];
    for (let i = start; i < End; i++) {
      data = data.concat(filteredMeetingList[i]);
    }
    this.setState({ paginatedList: data });
  };

  componentDidMount() {
    this.props.updateLoader(true);
    this.props.updateMeetingList(null);
    this.handleFetchMeetings();
    this.props.handleupdateNavigation("4");
  }

  handleCloseModel = () => {
    this.setState({
      isOpenMapModal: false,
      position1: null,
      position2: null,
      directions: null
    });
  };

  //to cancel a request
  handleCancelRequest = id => {
    this.handleUpdateMeetingStatus(id, "Rejected");
  };

  //to meeting status either the user accepts
  // or reject the meeting
  handleUpdateMeetingStatus = async (id, status) => {
    const meetingsRef = fireStore
      .collection("meetings")
      .doc(this.state.meetingList[id].Id);
    const meetingsMetaRef = fireStore
      .collection("meetingsMeta")
      .doc(this.state.meetingList[id].Id);
    try {
      await meetingsRef.update({ status: status });
      await meetingsMetaRef.update({ status: status });
    } catch (err) {
      console.log(err);
    }
  };

  //to accept the user request
  handleOnAcceptRequest = id => {
    const { meetingList } = this.state;
    const event = {
      title: "Meeting Day",
      description: `Hey, ${
        meetingList[id].confirmer.nickName
      } today you have a meeting at ${meetingList[id].location.name} with ${
        meetingList[id].requester.nickName
      }`,
      location: `${meetingList[id].location.name}`,
      startTime: new Date(meetingList[id].date).toUTCString(),
      endTime: new Date(
        meetingList[id].date + Number(meetingList[id].confirmer.durations[0])
      ).toUTCString()
    };
    this.handleUpdateMeetingStatus(id, "Accepted");
    this.setState({ isOpenCalenderModal: true, event });
  };

  //opens the map
  handleOpenMap = (elem, id) => {
    const { meetingList } = this.state;
    this.setState({
      position1: { ...meetingList[id].confirmer.coords },
      position2: { ...meetingList[id].location },
      isOpenMapModal: true
    });
  };

  //
  handleGetDirections = () => {
    const { position1, position2 } = this.state;
    const DirectionsService = new google.maps.DirectionsService();
    DirectionsService.route(
      {
        origin: new google.maps.LatLng(position1.latitude, position1.longitude),
        destination: new google.maps.LatLng(
          position2.latitude,
          position2.longitude
        ),
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.setState({
            directions: result
          });
        } else {
          alert("Sorry! Can't calculate directions!");
        }
      }
    );
  };

  handleGetModal = () => {
    Modal.success({
      title: "This is a success message",
      content: "some messages...some messages...",
      footer: [<AddToCalendar event={this.state.event} />]
    });
  };

  render() {
    const { paginatedList } = this.state;
    return (
      <div className="meetings">
        {paginatedList && paginatedList.length > 0 && (
          <h2 style={{ textAlign: "center" }}>Pending Meetings</h2>
        )}
        {paginatedList && !paginatedList.length > 0 && (
          <h2 style={{ textAlign: "center" }}>No Pending Requests</h2>
        )}
        {!paginatedList && this.renderCardSkeletons()}
        {paginatedList && paginatedList.length > 0 && this.renderMeetingCards()}
        {this.renderMapModal()}
        {this.renderAddToCalenderModal()}
      </div>
    );
  }

  //render the loding card
  renderCardSkeletons = () => {
    return (
      <div className="skeletons">
        <Card loading={true} className="card" />
        <Card loading={true} className="card" />
        <Card loading={true} className="card" />
      </div>
    );
  };

  //render the requests data in card
  renderMeetingCards = () => {
    const { paginatedList, loading } = this.state;
    return (
      <div>
        <div className="meeting-list">
          {paginatedList &&
            paginatedList.length > 0 &&
            paginatedList.map((meetingItem, index) => (
              <Card
                className="meeting-card"
                cover={
                  <img
                    src={meetingItem.requester.images[0]}
                    style={{ borderRadius: "5px 5px 0px 0px" }}
                  />
                }
                ref={ele => {
                  this.Card = ele;
                }}
                actions={[
                  <Tooltip placement="topLeft" title="cancel request">
                    <Popconfirm
                      placement="top"
                      title={"Are you sure you want to cancel the request ?"}
                      onConfirm={() => {
                        this.handleCancelRequest(index);
                      }}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Icon
                        type="close-circle"
                        className="cancelRequeust-icon"
                      />
                    </Popconfirm>
                  </Tooltip>,
                  <Tooltip placement="topLeft" title="get directions">
                    <div
                      className="direction-icon"
                      onClick={elem => {
                        this.handleOpenMap(elem, index);
                      }}
                    >
                      <i class="fas fa-map-marker-alt" />
                    </div>
                  </Tooltip>,
                  <Tooltip placement="topLeft" title="accept request">
                    <Popconfirm
                      placement="top"
                      title={"Are you sure you want to accept the request ?"}
                      onConfirm={() => this.handleOnAcceptRequest(index)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Icon
                        type="check-circle"
                        className="acceptRequeust-icon"
                      />
                    </Popconfirm>
                  </Tooltip>
                ]}
              >
                <Skeleton loading={loading} avatar active>
                  <Meta
                    avatar={
                      <div className="avatars">
                        <Avatar src={meetingItem.confirmer.images[0]} />
                      </div>
                    }
                    title={meetingItem.requester.nickName}
                    description={
                      <div>
                        <span>Location : {meetingItem.location.name}</span>{" "}
                        <br />
                        <span>
                          Date :{" "}
                          {new Date(meetingItem.date).toLocaleDateString()}
                        </span>
                        <br />
                        <span>
                          Time :{" "}
                          {new Date(meetingItem.date).toLocaleTimeString()}
                        </span>
                        <br />
                        <span>Status : {meetingItem.status}</span>
                      </div>
                    }
                  />
                </Skeleton>
              </Card>
            ))}
        </div>
        {/* render Pagination */}
        {this.state.filteredMeetingList &&
          this.state.filteredMeetingList.length > 0 && (
            <div className="paging">
              <Pagination
                defaultCurrent={1}
                total={this.state.filteredMeetingList.length}
                onChange={this.handleGetNextPageData}
              />
            </div>
          )}
      </div>
    );
  };

  //rendes the map in modal
  renderMapModal = () => {
    const { isOpenMapModal } = this.state;
    return (
      <Modal
        visible={isOpenMapModal}
        title="Directions"
        onOk={this.handleCloseModel}
        onCancel={this.handleCloseModel}
        className="mettingPlace-modal"
        footer={[
          <Button key="back" onClick={this.handleCloseModel}>
            Back
          </Button>,
          <Button key="getDirection" onClick={this.handleGetDirections}>
            Get Directions
          </Button>
        ]}
      >
        {this.renderMap()}
      </Modal>
    );
  };

  //renders the map
  renderMap = () => {
    const { isOpenMapModal, directions, position1, position2 } = this.state;
    return (
      <div className="direction-map" style={{ height: "300px", width: "100%" }}>
        {isOpenMapModal != null && (
          <MapComponent
            isMarkerShown
            googleMapURL="https://maps.googleapis.com/maps/api/js?key=&v=3.exp&libraries=geometry,drawing,places"
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: `100%` }} />}
            mapElement={<div style={{ height: `100%` }} />}
            directions={directions}
            position1={
              position1 != null && {
                latitude: position1.latitude,
                longitude: position1.longitude
              }
            }
            position2={
              position2 != null && {
                latitude: position2.latitude,
                longitude: position2.longitude
              }
            }
          />
        )}
      </div>
    );
  };

  //add the meeting date to calender
  renderAddToCalenderModal = () => {
    const { isOpenCalenderModal } = this.state;

    return (
      <Modal
        visible={isOpenCalenderModal}
        title="Add Event to Calender"
        onOk={() => {
          this.setState({ isOpenCalenderModal: false });
        }}
        onCancel={() => {
          this.setState({ isOpenCalenderModal: false });
        }}
        className="mettingPlace-modal"
        footer={[
          <Button
            key="back"
            onClick={() => {
              this.setState({ isOpenCalenderModal: false });
            }}
          >
            Back
          </Button>,
          <AddToCalendar
            event={this.state.event}
            buttonTemplate={{ "calendar-plus-o": "left" }}
            listItems={this.state.calenders}
          />
        ]}
      >
        <p>
          <Icon
            type="check-circle"
            twoToneColor="#52c41a"
            style={{
              position: "absolute",
              left: "60px",
              bottom: "92px",
              fontSize: "120%",
              color: "#6cca6c"
            }}
          />
          Request accepted, please add the event to calender
        </p>
      </Modal>
    );
  };
}

const MapComponent = withScriptjs(
  withGoogleMap(props => (
    <GoogleMap
      defaultZoom={14}
      center={{
        lat: props.position1.latitude,
        lng: props.position1.longitude
      }}
    >
      {console.log(props.position1, props.position2)}

      {props.directions && <DirectionsRenderer directions={props.directions} />}
    </GoogleMap>
  ))
);

//THis Function will get the updated store
const mapStateToProps = state => {
  return {
    meetingList: state.meetingsReducers.list,
    user: state.authReducers.user,
    loader: state.miscellaneousReducers.loader
  };
};
const mapDispatchToProps = dispatch => {
  return {
    updateUser: user => dispatch(authActions.updateUser(user)),
    removeUser: () => dispatch(authActions.removeUser()),
    updateMeetingList: data => dispatch(meetingActions.updateMeetingList(data)),
    updateLoader: data => dispatch(miscellaneousActions.updateLoader(data))
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Meetings)
);
