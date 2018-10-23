import React, { Component } from "react";
import { Steps, Input, Button, Modal, Icon, Carousel, DatePicker } from "antd";
import { Card as AntdCard } from "antd";
import { Card as DeckCard } from "react-swipe-deck";
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
class SetMeeting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      totalSteps: 3,
      currentStep: 1,
      users: null,
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

  componentDidMount() {
    NotificationCreater(
      "info",
      `Welcome to set a meeting module`,
      `A 3 steps easy process in which you have to select and save different steps`
    );
    this.handleFetchMeetingPlaces();
  }

  handleFetchUsers = async () => {
    const users = [];
    const collectionRef = fireStore.collection("usersProfile");
    try {
      const currentUserdata = (await collectionRef
        .doc("4PG5PIkaFSQRjL9BvfemWO7HYGD2")
        .get()).data();

      const usersSnapshot = await collectionRef.get();
      usersSnapshot.forEach(doc => {
        if (doc.id !== "4PG5PIkaFSQRjL9BvfemWO7HYGD2") {
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

          if (hasInterest && hasDurations) users.push(data);
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
    console.log("handleOnUserReject", users[index]);
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
      this.setState({ isOpenModal: false, selectedMeetingPoint: null });
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
    meetingPoints[index].location.city;
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
            photos.push(
              <img src={imgUrl} style={{ width: 300, height: 300 }} />
            );
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

  //Method to save the current step and enable the next button
  handleSaveStep = e => {
    const { currentStep } = this.state;
    switch (currentStep) {
      case 1: {
        this.handleSaveStep1(e);
        break;
      }
      case 2: {
        this.handleSaveStep2(e);
        break;
      }
      case 3: {
        this.handleSaveStep3(e);
        break;
      }
    }
  };

  handleSaveStep1 = e => {
    if (this.state.meetupOne) this.setState({ nextStep: true });
    else {
      NotificationCreater(
        "warning",
        `Select a User`,
        `Please select a user for meeting`
      );
    }
  };

  handleSaveStep2 = e => {
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
        this.handleSaveAllSteps();
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
    const { meetupOne, meetingLocation, selectedDate } = this.state;
    const requester = localStorage["eyeOnEye"]
      ? JSON.parse(localStorage["eyeOnEye"])
      : null;
    const meetingData = {
      requester,
      confirmer: meetupOne,
      location: meetingLocation,
      date: new Date(selectedDate).getTime(),
      status: "not set"
    };
    const meetingsMetaData = {
      meeter: [requester, meetupOne],
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

  render() {
    const { currentStep, totalSteps, nextStep } = this.state;
    return (
      <div className="wizard-setmeeting">
        {this.renderWizard()}
        {this.renderSteps(currentStep)}
        <Button
          type="primary"
          style={{ position: "absolute", right: "150px" }}
          onClick={this.handleSaveStep}
          disabled={nextStep}
          id="btnSave"
        >
          Save
          <Icon type="lock" theme="outlined" />
        </Button>

        <Button
          type="primary"
          style={{ position: "absolute", right: "45px" }}
          onClick={this.handleNextStep}
          disabled={!nextStep}
        >
          Next
          <Icon type="right" />
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
        this.handleFetchUsers();
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
          modal
            ? modal.title + (modal.location ? ` (${modal.location})` : "")
            : ""
        }
        onOk={this.handleCloseModel}
        onCancel={this.handleCloseModel}
        className="mettingPlace-modal"
        footer={[
          <Button key="back" onClick={this.handleCloseModel}>
            Back
          </Button>,
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
        {modal.photos ? (
          modal.photos[0]
        ) : (
          <h5 style={{ textAlign: "center" }}>No Photos Available</h5>
        )}
      </Modal>
    );
  };
}
export default SetMeeting;
