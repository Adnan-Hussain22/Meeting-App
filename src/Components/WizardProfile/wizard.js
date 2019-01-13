import React, { Component } from "react";
import { connect } from "react-redux";
import { authActions, miscellaneousActions } from "../../Redux/Actions";
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
      wizardComplete: false,
      stepOneValidated: null,
      stepTwoValidated: null,
      stepThreeValidated: null
    };
  }

  componentDidMount() {
    this.handleGetProfile();
    this.props.handleupdateNavigation('2');
  }

  // get the profile info if already added
  handleGetProfile = () => {
    const { profile } = this.props;
    if (profile) {
      const { coords, interest, durations, nickName, contact } = profile;
      const stepOneValidated = { validated: true };
      const stepTwoValidated = { validated: true };
      const stepThreeValidated = { validated: true };
      this.setState({
        coords,
        Beverages: [...interest],
        Durations: [...durations],
        nickName,
        contact,
        stepOneValidated,
        stepTwoValidated,
        stepThreeValidated
      });
    }
  };

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
      message.error("You can only upload JPEG | PNG | JPG file!");
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
    const {
      step,
      totalSteps,
      stepOneValidated,
      stepTwoValidated,
      stepThreeValidated
    } = this.state;
    if (step < totalSteps) {
      switch (step) {
        case 1: {
          if (!stepOneValidated || !stepOneValidated.validated) {
            this.handleSaveStep1();
            return;
          }
          this.setState({ step: step + 1, nextStep: false });
          break;
        }
        case 2: {
          if (!stepTwoValidated || !stepTwoValidated.validated) {
            this.handleSaveStep2();
            return;
          }
          this.setState({ step: step + 1, nextStep: false });
          break;
        }
        case 3: {
          if (!stepThreeValidated || !stepThreeValidated.validated) {
            this.handleSaveStep3();
            return;
          }
          this.setState({ step: step + 1, nextStep: false });
          break;
        }
      }
    }
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
    this.setState({ Beverages: checkedValues }, () => {
      this.handleValidateBeverages();
    });
  };

  handleInterestsDurationChange = checkedValues => {
    console.log("handleInterestsDurationChange=>", checkedValues);
    this.setState({ Durations: checkedValues }, () => {
      this.handleValidateDurationSlots();
    });
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
    const { stepOneValidated } = this.state;
    console.log("handleSaveStep1==>", stepOneValidated);
    //if the feild is untouched so first validate that one
    if (
      !stepOneValidated ||
      !stepOneValidated.nickName ||
      !stepOneValidated.contact
    ) {
      this.handleValidateName();
      setTimeout(() => {
        this.handleValidatePhoneNo();
      }, 80);
      return;
    }
    if (stepOneValidated.nickName.help || stepOneValidated.contact.help) {
      this.handleValidateName();
      setTimeout(() => {
        this.handleValidatePhoneNo();
      }, 80);
      return;
    }
    this.setState({
      nextStep: true,
      stepOneValidated: { ...stepOneValidated, validated: true }
    });
  };

  //Method to validate and save step 2
  handleSaveStep2 = e => {
    const { stepTwoValidated } = this.state;
    if (this.handleValidateUserImages()) {
      this.setState({
        nextStep: true,
        stepTwoValidated: { ...stepTwoValidated, validated: true }
      });
    }
  };

  //Method to validate and save step 3
  handleSaveStep3 = e => {
    const { stepThreeValidated } = this.state;
    console.log("handleSaveStep3==>", stepThreeValidated);
    //if the feild is untouched so first validate that one
    if (
      !stepThreeValidated ||
      !stepThreeValidated.beverages ||
      !stepThreeValidated.durations
    ) {
      this.handleValidateBeverages();
      setTimeout(() => {
        this.handleValidateDurationSlots();
      }, 80);
      return;
    }
    if (
      stepThreeValidated.beverages.help ||
      stepThreeValidated.durations.help
    ) {
      this.handleValidateBeverages();
      setTimeout(() => {
        this.handleValidateDurationSlots();
      }, 80);
      return;
    }
    this.setState({
      nextStep: true,
      stepTwoValidated: { ...stepThreeValidated, validated: true }
    });
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
        coords: coords,
        uid: this.props.user.uid
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
      await this.props.handleValidateProfile();
      this.props.handleupdateNavigation("3");
      this.props.history.push("/dashboard/Set_Meetings");
    } catch (err) {
      ActionCreater("error", "Error!!", `${err}`);
      console.log("Error While Uploading Data => ", err);
    } finally {
      this.props.updateLoader(false);
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
      <div className="wizard-setProfile" style={{ position: "relative" }}>
        <h3 style={{ textAlign: "center", marginBottom: "30px" }}>
          Set your profile
        </h3>
        {this.renderWizard()}
        {this.renderSteps(step)}
        {this.renderWizardActions()}
      </div>
    );
  }

  renderWizardActions = () => {
    const { step, nextStep, wizardComplete } = this.state;
    return (
      <div className="wizard-actions">
        <Button
          type="primary"
          onClick={this.handleBackWizard}
          disabled={!(step > 1)}
          id="btnBack"
        >
          Back
          <Icon type="left" theme="outlined" />
        </Button>
        <Button
          type="primary"
          onClick={this.handleSaveStep}
          disabled={nextStep}
          id="btnSave"
        >
          Save
          <Icon type="lock" theme="outlined" />
        </Button>

        <Button
          type="primary"
          onClick={this.handleNextStep}
          disabled={!nextStep}
        >
          Next
          <Icon type="right" />
        </Button>

        <Button
          type="primary"
          onClick={this.handleSaveAllSteps}
          disabled={!wizardComplete}
        >
          Submit
        </Button>
      </div>
    );
  };

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

  //=================================================================//
  //=========================VALIDATONS=============================//
  //===============================================================//

  //--------------------------Step one-----------------------------//

  //validate nick name
  handleValidateName = () => {
    const { nickName, stepOneValidated } = this.state;
    console.log("handleValidateName=>", stepOneValidated);
    if (!nickName) {
      const stepOneValidated_d = {
        ...stepOneValidated,
        nickName: {
          hasFeedback: true,
          validateStatus: "error",
          help: "Please input your nick name"
        },
        validated: false
      };
      this.setState({ stepOneValidated: stepOneValidated_d });
      return;
    }
    const stepOneValidated_d = {
      ...stepOneValidated,
      nickName: {
        hasFeedback: true,
        validateStatus: "success"
      },
      validated: true
    };
    this.setState({ stepOneValidated: stepOneValidated_d });
  };

  //validate contact no
  handleValidatePhoneNo = () => {
    const { stepOneValidated, contact } = this.state;
    console.log("handleValidatePhoneNo=>", stepOneValidated);
    const contactRegex = /^((\+92)|(0092))-{0,1}\d{3}-{0,1}\d{7}$|^\d{11}$|^\d{4}-\d{7}$/;
    if (!contact || !contact.match(contactRegex)) {
      const stepOneValidated_d = {
        ...stepOneValidated,
        contact: {
          hasFeedback: true,
          validateStatus: "error",
          help: "Please input valid PK contact number"
        },
        validated: false
      };
      this.setState({ stepOneValidated: stepOneValidated_d });
      return;
    }
    const stepOneValidated_d = {
      ...stepOneValidated,
      contact: {
        hasFeedback: true,
        validateStatus: "success"
      },
      validated: true
    };
    this.setState({ stepOneValidated: stepOneValidated_d });
  };

  //--------------------------End of Step one-----------------------------//

  //----------------------------Step two-----------------------------------//

  //validate user images
  handleValidateUserImages = () => {
    const { fileList } = this.state;
    if (!fileList.length || fileList.length < 3) {
      const stepTwoValidated = {
        images: {
          validateStatus: "error",
          help: "Please upload three images"
        },
        validated: false
      };
      this.setState({ stepTwoValidated });
      return false;
    }
    this.setState({ stepTwoValidated: { images: null, validated: true } });
    return true;
  };

  //--------------------------End of Step one-----------------------------//

  //----------------------------Step Three-----------------------------------//

  //validate beverages selected
  handleValidateBeverages = () => {
    console.log("handleValidateBeverages==>", this.state.Beverages);
    const { Beverages, stepThreeValidated } = this.state;
    if (Beverages.length < 2) {
      const stepThreeValidated_d = {
        ...stepThreeValidated,
        beverages: {
          hasFeedback: true,
          validateStatus: "error",
          help: "Please select atleast three"
        },
        validated: false
      };
      this.setState({ stepThreeValidated: stepThreeValidated_d });
      return;
    }
    const stepThreeValidated_d = {
      ...stepThreeValidated,
      beverages: {
        hasFeedback: true,
        validateStatus: "success"
      },
      validated: true
    };
    this.setState({ stepThreeValidated: stepThreeValidated_d });
  };

  //validate user images
  handleValidateDurationSlots = () => {
    const { Durations, stepThreeValidated } = this.state;
    if (Durations.length < 2) {
      const stepThreeValidated_d = {
        ...stepThreeValidated,
        durations: {
          hasFeedback: true,
          validateStatus: "error",
          help: "Please select atleast three"
        },
        validated: false
      };
      this.setState({ stepThreeValidated: stepThreeValidated_d });
      return;
    }
    const stepThreeValidated_d = {
      ...stepThreeValidated,
      durations: {
        hasFeedback: true,
        validateStatus: "success"
      },
      validated: true
    };
    this.setState({ stepThreeValidated: stepThreeValidated_d });
  };

  //--------------------------End of Step Three-----------------------------//

  //===============================================================//
  //=====================END OF VALIDATONS========================//
  //=============================================================//

  renderUserInfo = () => {
    const { nickName, contact, stepOneValidated } = this.state;
    const validationName = stepOneValidated ? stepOneValidated.nickName : null;
    const validationContact = stepOneValidated
      ? stepOneValidated.contact
      : null;
    return (
      <div className="user-info">
        <Form onSubmit={() => false} className="login-form">
          <FormItem {...validationName}>
            {
              <Input
                prefix={
                  <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                type="text"
                placeholder="Nick Name"
                value={nickName}
                onChange={e => {
                  this.setState({ nickName: e.target.value }, () => {
                    this.handleValidateName();
                  });
                }}
              />
            }
          </FormItem>
          {/* <Icon type="contacts" theme="outlined" /> */}
          <FormItem {...validationContact}>
            {
              <Input
                prefix={
                  <Icon type="contacts" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                type="text"
                placeholder="Contact No"
                value={contact}
                onChange={e => {
                  this.setState({ contact: e.target.value }, () => {
                    this.handleValidatePhoneNo();
                  });
                }}
              />
            }
          </FormItem>
        </Form>
      </div>
    );
  };

  renderUserImages = () => {
    const {
      loading,
      stepTwoValidated,
      previewVisible,
      previewImage
    } = this.state;
    const uploadButton = (
      <div>
        <Icon type={loading ? "loading" : "plus"} />
        <div className="ant-upload-text">Upload Image</div>
      </div>
    );
    const validation = stepTwoValidated ? stepTwoValidated.images : null;
    return (
      <div className="user-images">
        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={() => {
            this.setState({ previewVisible: false });
          }}
        >
          <img alt="example" style={{ width: "100%" }} src={previewImage} />
        </Modal>
        <FormItem {...validation}>
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
          </div>
        </FormItem>
      </div>
    );
  };

  renderImageUpload = (text, uploadButton) => {
    const { image } = this.state;
    return <div className="image-container">{uploadButton}</div>;
  };

  renderUserInterest = () => {
    const { stepThreeValidated } = this.state;
    const beverages = ["Coffee", "Juice", "Cocktail"];
    const mettingDuration = ["20", "60", "120"];
    const beveragesValidation = stepThreeValidated
      ? stepThreeValidated.beverages
      : null;
    const durationValidation = stepThreeValidated
      ? stepThreeValidated.durations
      : null;
    return (
      <div className="user-interest">
        <div>
          <p>Select Beverages</p>
          <FormItem {...beveragesValidation}>
            <CheckboxGroup
              options={beverages}
              onChange={this.handleInterestBeverageChange}
              value={this.state.Beverages}
            />
          </FormItem>
        </div>
        <br />
        <br />
        <div>
          <p>Meeting Slots</p>
          <FormItem {...durationValidation}>
            <CheckboxGroup
              options={mettingDuration}
              onChange={this.handleInterestsDurationChange}
              value={this.state.Durations}
            />
          </FormItem>
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
    profile: state.authReducers.profile
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateUser: user => dispatch(authActions.updateUser(user)),
    removeUser: () => dispatch(authActions.removeUser()),
    updateLoader: data => dispatch(miscellaneousActions.updateLoader(data)),
    updateProfile: data => dispatch(authActions.updateProfile(data))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile);
