import React, { Component } from "react";
import { connect } from "react-redux";
import { authActions,miscellaneousActions } from "../../Redux/Actions";
import {
  Card,
  Button,
  Steps,
  Icon,
  Form,
  Input,
  Upload,
  message,
  Checkbox,
  Modal
} from "antd";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from "react-google-maps";
import "antd/dist/antd.css";
import "./wizard.css";
import firebase, { fireStore } from "../../Config/firebase";
import { strict } from "assert";
import {
  ActionCreater,
  NotificationCreater
} from "../../Helpers/Actions/action";
const FormItem = Form.Item;
const Step = Steps.Step;
const CheckboxGroup = Checkbox.Group;
class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrl: "",
      step: 1,
      totalSteps: 4,
      previewVisible: false,
      previewImage: "",
      loading: false,
      nickName: "",
      contact: "",
      Beverages: [],
      Durations: [],
      nextStep: false,
      fileList: [],
      coords: null,
      wizardComplete: false
    };
  }

  componentDidMount(){
    this.props.handleValidateNavigation();
  }

  //Method to preview the image on the model
  handlePreview = file => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true
    });
  };

  //Method to get the image in base64 from file reader
  getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result, img));
    reader.readAsDataURL(img);
  }

  //Method to check if the uploading file is not
  beforeUpload(file) {
    const isJPG = file.type === "image/jpeg" || "image/png" || "image/jpg";
    if (!isJPG) {
      message.error("You can only upload JPG file!");
    }
    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      message.error("Image must smaller than 20MB!");
    }
    return isJPG && isLt20M;
  }

  handleAvatarChange = info => {
    const { fileList } = this.state;
    console.log("handleAvatarChange", info.file);
    if (info.file.status === "uploading") {
      this.setState({ loading: true });
      this.getBase64(info.file.originFileObj, this.getImage);
      return;
    }

    if (info.file.status === "removed") {
      const newArray = fileList.filter(elem => !(elem.uid === info.file.uid));
      console.log("NewImageArray=>", newArray);
      this.setState({ fileList: newArray });
    }

    // if (info.file.status === "done") {
    //   console.log("Getting the image url");
    //   // Get this url from response in real world.
    // }
  };

  handleRemoveImageFromStorage = url => {
    console.log("handleRemoveImageFromStorage", url);
    const imgRef = firebase.storage().refFromURL(url);
    imgRef
      .delete()
      .then(() => {})
      .catch(err => {
        console.log(err);
      });
  };

  handleNextStep = () => {
    const { step, totalSteps } = this.state;
    if (step < totalSteps) this.setState({ step: step + 1, nextStep: false });
  };

  handleBackWizard = () => {
    const { step } = this.state;
    if (step > 1) this.setState({ step: step - 1 });
  };

  handlePreview = file => {
    console.log(file);
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true
    });
  };

  //Method to get the image as base64 from 64 method and save in the state
  getImage = (base64, imageBlob) => {
    console.log("getImage");
    const { fileList } = this.state;
    this.setState({
      fileList: fileList.concat([
        {
          name: imageBlob.name,
          url: base64,
          status: "done",
          uid: fileList.length - 1,
          imageBlob
        }
      ]),
      loading: false
    });
  };

  handleCustomRequest = e => {
    console.log("handleCustomRequest=>", e);
  };

  handleInterestBeverageChange = checkedValues => {
    console.log("handleInterestBeverageChange=>", checkedValues);
    this.setState({ Beverages: checkedValues });
  };

  handleInterestsDurationChange = checkedValues => {
    console.log("handleInterestsDurationChange=>", checkedValues);
    this.setState({ Durations: checkedValues });
  };

  handleSetMapPosition = () => {
    navigator.geolocation.getCurrentPosition(position => {
      this.setState({ coords: position.coords });
    });
  };

  handleUpdateMapCoords = ({ latitude, longitude }) => {
    this.setState({ coords: { latitude, longitude } });
  };

  //Method to save the current step and enable the next button
  handleSaveStep = e => {
    const { step } = this.state;
    switch (step) {
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
      case 4: {
        this.handleSaveStep4(e);
        break;
      }
    }
  };

  //Method to validate and save step 1
  handleSaveStep1 = e => {
    const { contact, nickName } = this.state;
    if (contact && nickName) {
      this.setState({ nextStep: true });
      console.log("contact=>", contact);
      console.log("nickName=>", nickName);
    }
  };

  //Method to validate and save step 2
  handleSaveStep2 = e => {
    const { fileList } = this.state;
    if (fileList.length) this.setState({ nextStep: true });
  };

  //Method to validate and save step 3
  handleSaveStep3 = e => {
    const { Beverages, Durations } = this.state;
    if (Beverages.length && Durations.length) this.setState({ nextStep: true });
  };

  handleSaveStep4 = e => {
    if (this.state.coords) this.setState({ wizardComplete: true });
  };

  handelUploadedBundle = info => {
    if (info.file.status !== "uploading") {
    }
    if (info.file.status === "done") {
    } else if (info.file.status === "error") {
    }
  };

  handleSaveAllSteps = async () => {
    const {
      nickName,
      contact,
      fileList,
      Beverages,
      Durations,
      coords
    } = this.state;
    this.props.updateLoader(true);
    let images = [];
    try {
      for (let i = 0; i < fileList.length; i++) {
        const url = await this.SaveImagesToStorage(fileList[i].imageBlob);
        images.push(url);
      }
      const obj = {
        nickName,
        contact,
        images: images,
        interest: Beverages,
        durations: Durations,
        coords: coords
      };
      await fireStore
        .collection("usersProfile")
        .doc(this.props.user.uid)
        .set(obj);
      ActionCreater(
        "success",
        "Data uploaded successfully",
        "Profile data uploaded successfully"
      );
      this.props.handleSetProfile();
    } catch (err) {
      ActionCreater(
        "error",
        "Error!!",
        `${err}`
      );
      console.log("Error While Uploading Data => ", err);
    } finally {
      this.props.updateLoader(null);
    }
  };

  async SaveImagesToStorage(imageBlob) {
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child("UserImages/" + imageBlob.name);
    try {
      const snapshot = await imageRef.put(imageBlob);
      return await snapshot.ref.getDownloadURL();
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    const { step, nextStep, wizardComplete } = this.state;
    return (
      <div className="wizard" style={{ position: "relative" }}>
        {this.renderWizard()}
        {this.renderSteps(step)}
        <Button
          type="primary"
          style={{ position: "absolute", right: "278px" }}
          onClick={this.handleBackWizard}
          disabled={!(step > 1)}
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
    return <div>{this.getCurrentStep(step)}</div>;
  };

  //Method to get the current step UI based on the step no
  getCurrentStep = step => {
    console.log("getting current step=>", step);
    switch (step) {
      case 1: {
        return this.renderUserInfo();
      }
      case 2: {
        return this.renderUserImages();
      }
      case 3: {
        return this.renderUserInterest();
      }
      case 4: {
        this.handleSetMapPosition();
        return this.renderMap();
      }
    }
  };

  renderWizard = current => {
    const { step } = this.state;
    return (
      <div className="wizard-steps" style={{ marginBottom: "20px" }}>
        <Steps current={step - 1}>
          <Step
            title={this.validateStep(1, step)}
            description="Personal Info"
          />
          <Step title={this.validateStep(2, step)} description="Images" />
          <Step title={this.validateStep(3, step)} description="Interest" />
        </Steps>
      </div>
    );
  };

  validateStep = (stepNo, currentStep) => {
    const title1 = "Finished",
      title2 = "In Process",
      title3 = "Waiting";
    if (stepNo === currentStep) return title2;
    else if (stepNo < currentStep) return title1;
    else return title3;
  };

  renderUserInfo = () => {
    const { nickName, contact } = this.state;
    return (
      <div className="user-info">
        <Form onSubmit={() => false} className="login-form">
          <FormItem>
            {
              <Input
                prefix={
                  <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                type="text"
                placeholder="Nick Name"
                value={nickName}
                onChange={e => {
                  this.setState({ nickName: e.target.value });
                }}
              />
            }
          </FormItem>
          {/* <Icon type="contacts" theme="outlined" /> */}
          <FormItem>
            {
              <Input
                prefix={
                  <Icon type="contacts" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                type="text"
                placeholder="Contact No"
                value={contact}
                onChange={e => {
                  this.setState({ contact: e.target.value });
                }}
              />
            }
          </FormItem>
        </Form>
      </div>
    );
  };

  renderUserImages = () => {
    const { loading, images, previewVisible, previewImage } = this.state;
    const uploadButton = (
      <div>
        <Icon type={loading ? "loading" : "plus"} />
        <div className="ant-upload-text">Upload Image</div>
      </div>
    );
    return (
      // <ul className="userImage-list">
      //   <li>

      //   </li>
      // </ul>
      <div className="userImage-list clearfix">
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          beforeUpload={this.beforeUpload}
          fileList={this.state.fileList}
          onChange={this.handleAvatarChange}
          customRequest={this.handelUploadedBundle}
          onPreview={this.handlePreview}
          accept="image/*"
        >
          {this.state.fileList.length >= 3 ? null : uploadButton}
        </Upload>
        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={() => {
            this.setState({ previewVisible: false });
          }}
        >
          <img alt="example" style={{ width: "100%" }} src={previewImage} />
        </Modal>
      </div>
    );
  };

  renderImageUpload = (text, uploadButton) => {
    const { image } = this.state;
    return <div className="image-container">{uploadButton}</div>;
  };

  renderUserInterest = () => {
    const beverages = ["Coffee", "Juice", "Cocktail"];
    const mettingDuration = ["20", "60", "120"];
    return (
      <div className="user-interest">
        <div>
          <p>Select Beverages</p>
          <CheckboxGroup
            options={beverages}
            onChange={this.handleInterestBeverageChange}
          />
        </div>
        <br />
        <br />
        <div>
          <p>Meeting Slots</p>
          <CheckboxGroup
            options={mettingDuration}
            onChange={this.handleInterestsDurationChange}
          />
        </div>
      </div>
    );
  };

  renderMap = () => {
    const { coords } = this.state;
    return (
      <div className="map-container">
        <h5>Select Your Location</h5>
        {console.log("renderMap", coords)}
        <div className="map">
          {coords && (
            <MyMapComponent
              isMarkerShown
              googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
              loadingElement={<div style={{ height: `100%` }} />}
              containerElement={<div style={{ height: `100%` }} />}
              mapElement={<div style={{ height: `100%` }} />}
              coords={coords}
              updateCoords={this.handleUpdateMapCoords}
            />
          )}
        </div>
      </div>
    );
  };
}

const MyMapComponent = withScriptjs(
  withGoogleMap(props => (
    <GoogleMap
      defaultZoom={30}
      center={{ lat: props.coords.latitude, lng: props.coords.longitude }}
    >
      {props.isMarkerShown && (
        <Marker
          position={{ lat: props.coords.latitude, lng: props.coords.longitude }}
          draggable={true}
          onDragEnd={position => {
            props.updateCoords({
              latitude: position.latLng.lat(),
              longitude: position.latLng.lng()
            });
          }}
        />
      )}
    </GoogleMap>
  ))
);

//THis Function will get the updated store
const mapStateToProps = state => {
  return {
    user: state.authReducers.user,
    loader: state.miscellaneousReducers.loader,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateUser: user => dispatch(authActions.updateUser(user)),
    removeUser: () => dispatch(authActions.removeUser()),
    updateLoader: data => dispatch(miscellaneousActions.updateLoader(data))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile);
