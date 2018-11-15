import React, { Component } from "react";
import { connect } from "react-redux";
import { authActions } from "../../Redux/Actions";
import { Steps, Input, Button, Modal, Icon, Carousel, DatePicker } from "antd";
import { Card as AntdCard } from "antd";
import { Card as DeckCard } from "react-swipe-deck";
import {
  withGoogleMap,
  GoogleMap,
  Marker,
  withScriptjs,
  DirectionsRenderer
} from "react-google-maps";
import {
  ActionCreater,
  NotificationCreater
} from "../../Helpers/Actions/action";
import Cards from "react-swipe-deck";
import "antd/dist/antd.css";
import "./wizard.css";
import defaultAvatar from "../../Helpers/Images/default Avatar.jpg";
import firebase, { fireStore } from "../../Config/firebase";
import tickIcon from "../../Helpers/Images/tick.png";
import cancelIcon from "../../Helpers/Images/cancel.png";
const Step = Steps.Step;
const Search = Input.Search;
const { Meta } = AntdCard;
const apiEndPoint = `https://api.foursquare.com/v2/venues`;
/* eslint-disable no-undef */
class SetMeeting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      totalSteps: 3,
      currentStep: 1,
      users: null,
      wizardComplete: null,
      currentUserdata: null,
      meetupOne: null,
      searchPlace: "",
      meetingPoints: [],
      isOpenModal: false,
      modal: {},
      submitPlaceLoading: false,
      selectedMeetingPoint: null,
      meetingLocation: null,
      nextStep: false,
      haveFavourites: null,
      selectedDate: null
    };
  }

  async componentDidMount() {
    NotificationCreater(
      "info",
      `Welcome to set a meeting module`,
      `A 3 steps easy process in which you have to select and save different steps`
    );
    this.handleFetchMeetingPlaces();
    await this.handleFetchCurrentAuthDataFireStore();
    await this.handleFetchUsers();
  }

  handleFetchCurrentAuthDataFireStore = async () => {
    const userProfileRef = fireStore.collection("usersProfile");
    const currentUserdata = (await userProfileRef
      .doc(this.props.user.uid)
      .get()).data();
    this.setState({
      currentUserdata: { ...currentUserdata, uid: this.props.user.uid }
    });
  };

  handleFetchUsers = async () => {
    const { currentUserdata } = this.state;
    const users = [];
    const collectionRef = fireStore.collection("usersProfile");
    try {
      const usersSnapshot = await collectionRef.get();
      console.log(currentUserdata.uid);
      usersSnapshot.forEach(doc => {
        if (doc.id !== currentUserdata.uid) {
          const data = doc.data();
          const interest = data["interest"];
          const durations = data["durations"];
          let hasInterest = null;
          let hasDurations = null;
          for (let index = 0; index < interest.length; index++) {
            if (currentUserdata.interest.includes(interest[index])) {
              hasInterest = true;
            }
          }

          for (let index = 0; index < durations.length; index++) {
            if (currentUserdata.durations.includes(durations[index])) {
              hasDurations = true;
            }
          }

          if (
            hasInterest &&
            hasDurations &&
            this.getDistance(data.coords, currentUserdata.coords) <= 5
          ) {
            users.push(data);
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
    this.setState({ users });
  };

  handleOnUsersDataEnd = () => {
    console.log("Data Ended");
  };

  handleOnUserAccept = index => {
    const { users } = this.state;
    NotificationCreater(
      "info",
      `${users[index].nickName} Selected`,
      `You selected ${users[index].nickName} for meeting`
    );
    this.setState({ meetupOne: users[index] });
  };

  handleOnUserReject = index => {
    const { users } = this.state;
    NotificationCreater(
      "warning",
      `${users[index].nickName} Rejected`,
      `You rejected ${users[index].nickName} for meeting`
    );
  };

  handleSearchChange = e => {
    this.setState({ searchPlace: e.target.value });
  };

  handleSearchPlace = searchPlace => {
    if (searchPlace) {
      this.handleFetchMeetingPlaces();
      this.setState({ searchPlace: "" });
    }
  };

  handleCloseModel = () => {
    const { submitPlaceLoading } = this.state;
    if (!submitPlaceLoading)
      this.setState({
        isOpenModal: false,
        selectedMeetingPoint: null,
        directions: null
      });
  };

  handleFetchMeetingPlaces = () => {
    const { searchPlace } = this.state;
    const fetchingQuery =
      "client_id=YKEVHX1NOP0GJ3B43HMSVGI4B2C4MC2DQCOR2JLOMYDLFT3P&client_secret=W2NEO2HSNV5BAOSEWCUO4HGGVFPF5G3RIBCVJBHKAEUK0OKM&v=20180323&limit=20&ll=24.844725332577944,67.0297252269836";
    const query = searchPlace ? `&query=${searchPlace}` : "";
    fetch(`${apiEndPoint}/search?${fetchingQuery}${query}`)
      .then(res => res.json())
      .then(json => {
        this.setState({ meetingPoints: json.response.venues });
      })
      .catch(err => {
        ActionCreater(
          "error",
          "Search Failed",
          "Failed to fetch the searched data"
        );
      });
  };

  handleMeetingPointSelected = (id, index) => {
    const { meetingPoints, modal } = this.state;
    modal["id"] = id;
    modal["title"] = meetingPoints[index].name;
    modal["description"] = meetingPoints[index].categories[0]
      ? meetingPoints[index].categories[0].name
      : "";
    modal["location"] = meetingPoints[index].location.address
      ? meetingPoints[index].location.address
      : "";
    modal["isMap"] = false;
    // meetingPoints[index].location.city;
    console.log(modal);
    this.setState({ modal, isOpenModal: true, selectedMeetingPoint: index });
    this.handleFetchPhotos(id);
  };

  handleFetchPhotos = id => {
    const { modal } = this.state;
    let photos = [];
    const fetchingQuery =
      "client_id=YKEVHX1NOP0GJ3B43HMSVGI4B2C4MC2DQCOR2JLOMYDLFT3P&client_secret=W2NEO2HSNV5BAOSEWCUO4HGGVFPF5G3RIBCVJBHKAEUK0OKM&v=20180323&limit=5";
    fetch(`${apiEndPoint}/${id}/photos?${fetchingQuery}`)
      .then(res => res.json())
      .then(json => {
        if (json.meta.code === 200) {
          for (
            let index = 0;
            index < json.response.photos.items.length;
            index++
          ) {
            const item = json.response.photos.items[index];
            const imgUrl = `${item.prefix}${item.height}x${item.width}${
              item.suffix
            }`;
            photos.push(<img src={imgUrl} />);
          }
          modal["photos"] = photos.length ? photos : null;
          this.setState({ modal });
        } else {
          modal["photos"] = null;
        }
      });
  };

  handleSelectMeetingPlace = () => {
    const { selectedMeetingPoint, meetingPoints } = this.state;
    let meetingLocation = "";
    if (meetingPoints[selectedMeetingPoint].location) {
      meetingLocation = {
        latitude: meetingPoints[selectedMeetingPoint].location.lat,
        longitude: meetingPoints[selectedMeetingPoint].location.lng,
        distance: meetingPoints[selectedMeetingPoint].location.distance,
        name: meetingPoints[selectedMeetingPoint].name
      };
    } else {
      meetingLocation = { name: meetingPoints[selectedMeetingPoint].name };
    }
    this.setState({ submitPlaceLoading: true });
    setTimeout(() => {
      this.setState({
        submitPlaceLoading: false,
        isOpenModal: false,
        meetingLocation
      });
    }, 2000);
  };

  handleDateTimeChange = (value, dateString) => {
    if (value && value < new Date()) {
      ActionCreater(
        "error",
        "Selected Date&Time is Invalid",
        "The date or time you select is not valid as it is lessor than current"
      );
    }
    this.setState({ selectedDate: value });
    console.log("Formatted Selected Time: ", dateString);
  };

  handleNextStep = () => {
    const { currentStep, totalSteps } = this.state;
    if (currentStep < totalSteps)
      this.setState({ currentStep: currentStep + 1, nextStep: false });
  };

  handleBackWizard = () => {
    const { currentStep, totalSteps } = this.state;
    if (currentStep > 1)
      this.setState({ currentStep: currentStep - 1, nextStep: false });
  };

  //Method to save the current step and enable the next button
  handleSaveStep = e => {
    const { currentStep } = this.state;
    switch (currentStep) {
      case 1: {
        this.handleSaveStep1Coords(e);
        break;
      }
      case 2: {
        this.handleSaveStep2Coords(e);
        break;
      }
      case 3: {
        this.handleSaveStep3(e);
        break;
      }
    }
  };

  handleSaveStep1Coords = e => {
    if (this.state.meetupOne) this.setState({ nextStep: true });
    else {
      NotificationCreater(
        "warning",
        `Select a User`,
        `Please select a user for meeting`
      );
    }
  };

  handleSaveStep2Coords = e => {
    const { meetingLocation } = this.state;
    if (meetingLocation) this.setState({ nextStep: true });
    else {
      NotificationCreater(
        "warning",
        `Select a Meeting Point`,
        `Please select an appropriate nearby meeting point`
      );
    }
  };

  handleSaveStep3 = e => {
    const { selectedDate } = this.state;
    if (selectedDate) {
      if (selectedDate < new Date())
        ActionCreater(
          "error",
          "Selected Date&Time is Invalid",
          "The date or time you select is not valid as it is lessor than current"
        );
      else {
        this.setState({ wizardComplete: true });
      }
    } else {
      ActionCreater(
        "warning",
        "Date/Time Not Selected",
        "Please select a valid date & time"
      );
    }
  };

  handleSaveAllSteps = () => {
    const meetingsMetaRef = fireStore.collection("meetingsMeta");
    const meetingsRef = fireStore.collection("meetings");
    const {
      meetupOne,
      meetingLocation,
      selectedDate,
      currentUserdata
    } = this.state;
    const meetingData = {
      requester: currentUserdata,
      confirmer: meetupOne,
      location: meetingLocation,
      date: new Date(selectedDate).getTime(),
      status: "not set"
    };
    const meetingsMetaData = {
      meeters: [currentUserdata, meetupOne],
      status: "not set"
    };
    console.log("meetingData", "meetingsMetaData");
    console.log(meetingData, meetingsMetaData);
    meetingsMetaRef
      .add(meetingsMetaData)
      .then(doc => meetingsRef.doc(doc.id).set(meetingData))
      .then(() => {
        ActionCreater(
          "success",
          "Data Saved",
          `Data successfully save and the notification to the selected person has been sent`
        );
      })
      .catch(err => {
        ActionCreater(
          "error",
          "Failed to save the data",
          `Failed to save the data may be your connection was interreupted please check your network connection and try again`
        );
        console.log("Error Saving Data", err);
      });
  };

  handleGetMap = () => {
    const { modal } = this.state;
    modal["isMap"] = true;
    this.setState({ modal });
  };

  handleGetDirections = () => {
    const { currentUserdata, meetingPoints, selectedMeetingPoint } = this.state;
    const DirectionsService = new google.maps.DirectionsService();
    console.log("Postion one=>", currentUserdata.coords);
    console.log("Postion two=>", {
      latitude: meetingPoints[selectedMeetingPoint].location.lat,
      longitude: meetingPoints[selectedMeetingPoint].location.lng
    });
    DirectionsService.route(
      {
        origin: new google.maps.LatLng(
          currentUserdata.coords.latitude,
          currentUserdata.coords.longitude
        ),
        destination: new google.maps.LatLng(
          meetingPoints[selectedMeetingPoint].location.lat,
          meetingPoints[selectedMeetingPoint].location.lng
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

  rad = x => {
    return (x * Math.PI) / 180;
  };

  getDistance = (p1Coords, p2Coords) => {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = this.rad(p2Coords.latitude - p1Coords.latitude);
    var dLong = this.rad(p2Coords.longitude - p1Coords.longitude);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.rad(p1Coords.longitude)) *
        Math.cos(this.rad(p2Coords.longitude)) *
        Math.sin(dLong / 2) *
        Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return Math.ceil(d) / 1000; // returns the distance in KM
  };

  render() {
    const { currentStep, totalSteps, nextStep,wizardComplete } = this.state;
    return (
      <div className="wizard-setmeeting">
        {this.renderWizard()}
        {this.renderSteps(currentStep)}
        <Button
          type="primary"
          style={{ position: "absolute", right: "278px" }}
          onClick={this.handleBackWizard}
          disabled={!(currentStep > 1)}
          id="btnBack"
        >
          Back
          <Icon type="left" theme="outlined" />
        </Button>
        <Button
          type="primary"
          style={{ position: "absolute", right: "192px" }}
          onClick={this.handleSaveStep}
          disabled={nextStep}
          id="btnSave"
        >
          Save
          <Icon type="lock" theme="outlined" />
        </Button>

        <Button
          type="primary"
          style={{ position: "absolute", right: "105px" }}
          onClick={this.handleNextStep}
          disabled={!nextStep}
        >
          Next
          <Icon type="right" />
        </Button>

        <Button
          type="primary"
          style={{ position: "absolute", right: "25px" }}
          onClick={this.handleSaveAllSteps}
          disabled={!wizardComplete}
        >
          Submit
        </Button>
      </div>
    );
  }

  renderSteps = step => {
    return this.getCurrentStep(step);
  };

  getCurrentStep = step => {
    switch (step) {
      case 1: {
        return this.renderUsers();
      }
      case 2: {
        return this.renderMeetingPoints();
      }
      case 3: {
        return this.renderDateTime();
      }
    }
  };

  renderUsers = () => {
    const { users } = this.state;
    return (
      <div className="card-container">
        {users && (
          <h3 style={{ marginBottom: "8px;", textAlign: "center" }}>
            Select the person you want to meet
          </h3>
        )}
        {!users && (
          <h3 style={{ marginBottom: "8px;", textAlign: "center" }}>
            No Favourite persons
          </h3>
        )}
        <div className="cards-deck">
          {users && (
            <Cards onEnd={this.handleOnUsersDataEnd} className="master-root">
              {users.map((item, index) => (
                <DeckCard
                  onSwipeLeft={e => {
                    this.handleOnUserReject(index);
                  }}
                  onSwipeRight={e => {
                    this.handleOnUserAccept(index);
                  }}
                >
                  <AntdCard
                    className="user-card"
                    hoverable
                    style={{ width: "100%", height: "100%" }}
                    cover={
                      <Carousel autoplay>
                        {item.images.map((image, index) => (
                          <img
                            alt="userImg"
                            src={image}
                            style={{ width: "100%", height: "100%" }}
                            id={index}
                          />
                        ))}
                      </Carousel>
                    }
                  >
                    <Meta title={item.nickName} description={item.nickName} />
                    <div
                      className="cancel-user"
                      onClick={() => {
                        console.log("Cancel");
                      }}
                    >
                      <img src={cancelIcon} />
                    </div>
                    <div
                      className="accept-user"
                      onClick={() => {
                        console.log("Accept");
                      }}
                    >
                      <img src={tickIcon} />
                    </div>
                  </AntdCard>
                </DeckCard>
              ))}
            </Cards>
          )}
        </div>
      </div>
    );
  };

  renderMeetingPoints = () => {
    const { searchPlace, meetingPoints } = this.state;
    return (
      <div className="meeting-points">
        {this.renderModel()}
        <h4 style={{ textAlign: "center", marginBottom: "20px" }}>
          Select a meeting point
        </h4>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Search
            placeholder="Search a meeting point"
            value={searchPlace}
            onChange={this.handleSearchChange}
            onSearch={this.handleSearchPlace}
            style={{ width: 300 }}
          />
        </div>
        <ul className="vanues-list">
          {meetingPoints &&
            meetingPoints.map((item, index) => (
              <li
                onClick={() => {
                  this.handleMeetingPointSelected(item.id, index);
                }}
                key={item.id}
              >
                <AntdCard title={item.name} bordered={false}>
                  {item.categories[0] ? item.categories[0].name : ""}
                </AntdCard>
              </li>
            ))}
        </ul>
      </div>
    );
  };

  renderDateTime = () => {
    return (
      <div className="select-date">
        <h4 style={{ textAlign: "center" }}>Select a meeting date/time</h4>
        <div className="datetime-container">
          <DatePicker
            showTime
            format="DD-MM-YYYY HH:mm:ss"
            placeholder="Select Date&Time"
            onChange={this.handleDateTimeChange}
          />
        </div>
      </div>
    );
  };

  renderWizard = () => {
    const { currentStep } = this.state;
    return (
      <div className="wizard-steps" style={{ marginBottom: "20px" }}>
        <Steps current={currentStep - 1}>
          <Step title={"Person"} description="Person Selection" />
          <Step title={"Point"} description="Meeting point selection" />
          <Step title={"Date/Time"} description="Select Date/Time" />
        </Steps>
      </div>
    );
  };

  renderModel = () => {
    const { isOpenModal, modal, submitPlaceLoading } = this.state;
    return (
      <Modal
        visible={isOpenModal}
        title={
          modal && !modal.isMap
            ? modal.title + (modal.location ? ` (${modal.location})` : "")
            : "Direction of your locations"
        }
        onOk={this.handleCloseModel}
        onCancel={this.handleCloseModel}
        className="mettingPlace-modal"
        footer={[
          <Button key="back" onClick={this.handleCloseModel}>
            Back
          </Button>,
          !modal.isMap ? (
            <Button key="getDirection" onClick={this.handleGetMap}>
              Open Map
            </Button>
          ) : (
            <Button key="getDirection" onClick={this.handleGetDirections}>
              Get Directions
            </Button>
          ),
          <Button
            key="submit"
            type="primary"
            onClick={this.handleSelectMeetingPlace}
            loading={submitPlaceLoading}
          >
            Submit
          </Button>
        ]}
      >
        {!modal.isMap && this.renderPhotos(modal)}
        {modal.isMap && this.renderMap()}
      </Modal>
    );
  };

  renderPhotos = modal => {
    return modal.photos ? (
      modal.photos[0]
    ) : (
      <h5 style={{ textAlign: "center" }}>No Photos Available</h5>
    );
  };

  renderMap = () => {
    const {
      directions,
      currentUserdata,
      meetingPoints,
      selectedMeetingPoint
    } = this.state;
    return (
      <div className="direction-map" style={{ height: "300px", width: "100%" }}>
        {selectedMeetingPoint != null && (
          <MapComponent
            isMarkerShown
            googleMapURL="https://maps.googleapis.com/maps/api/js?key=&v=3.exp&libraries=geometry,drawing,places"
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: `100%` }} />}
            mapElement={<div style={{ height: `100%` }} />}
            directions={directions}
            position1={currentUserdata.coords}
            position2={{
              latitude: meetingPoints[selectedMeetingPoint].location.lat,
              longitude: meetingPoints[selectedMeetingPoint].location.lng
            }}
          />
        )}
      </div>
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
    user: state.authReducers.user
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateUser: user => dispatch(authActions.updateUser(user)),
    removeUser: () => dispatch(authActions.removeUser())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetMeeting);
