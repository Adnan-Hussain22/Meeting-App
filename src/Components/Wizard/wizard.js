import React, { Component } from "react";
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
import "antd/dist/antd.css";
import "./wizard.css";
const FormItem = Form.Item;
const Step = Steps.Step;
const CheckboxGroup = Checkbox.Group;
class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrl: "",
      step: 1,
      totalSteps: 3,
      previewVisible: false,
      previewImage: "",
      loading: false,
      nickName: "",
      contact: "",
      Beverages: [],
      Durations: [],
      nextStep: false,
      fileList: []
    };
  }


  //Method to preview the image on the model
  handlePreview = file => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true
    });
  };

  //Method to get the image in base64 from file reader
  getBase64(img, callback, info) {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result, info));
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
    // this.setState({
    //   fileList: {
    //     name: fileList[fileList.length - 1].name,
    //     url:fileList[fileList.length - 1].thumbUrl,
    //     status:"done",
    //     uid:(fileList.length - 2)
    //   }
    // });
    if (info.file.status === "uploading") {
      this.setState({ loading: true });
      this.getBase64(info.file.originFileObj, this.getImage, info.file);
      return;
    }

    if (info.file.status === "removed") {
      const newArray = fileList.filter(elem => !(elem.uid === info.file.uid));
      this.setState({ fileList: newArray });
    }

    // if (info.file.status === "done") {
    //   console.log("Getting the image url");
    //   // Get this url from response in real world.
    // }
  };

  handleNextStep = () => {
    const { step, totalSteps } = this.state;
    if (step < totalSteps) this.setState({ step: step + 1, nextStep: false });
  };

  handleSaveSteps = () => {};

  handlePreview = file => {
    console.log(file);
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true
    });
  };

  //Method to get the image as base64 from 64 method and save in the state
  getImage = (filePath, info) => {
    const { images, fileList } = this.state;
    this.setState({
      fileList: fileList.concat([
        {
          name: info.name,
          url: filePath,
          status: "done",
          uid: fileList.length - 1
        }
      ]),
      loading: false
    });
    // let flag = true;
    // for (let i = 0; i < images.length; i++) {
    //   if (images[i].filePath === filePath) {
    //     flag = false;
    //     break;
    //   }
    // }

    // if (flag)
    // this.setState({
    //   loading: false,
    //   images: images.concat([{ filePath, id: info.uid }])
    // });
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
    if (Beverages.length && Durations.length) console.log("Save all the data");
  };

  handelUploadedBundle = info => {
    if (info.file.status !== "uploading") {
    }
    if (info.file.status === "done") {
    } else if (info.file.status === "error") {
    }
  };

  render() {
    const { step, nextStep } = this.state;
    return (
      <div className="wizard" style={{ position: "relative" }}>
        {this.renderWizard()}
        {this.renderSteps(step)}
        <Button
          type="primary"
          style={{ position: "absolute", right: "5px" }}
          onClick={this.handleNextStep}
          disabled={!nextStep}
        >
          Next
          <Icon type="right" />
        </Button>
        <Button
          type="primary"
          style={{ position: "absolute", right: "100px" }}
          onClick={this.handleSaveStep}
          disabled={nextStep}
        >
          Save
          <Icon type="lock" theme="outlined" />
        </Button>
      </div>
    );
  }

  renderSteps = step => {
    return (
      <div>
        {step === 1 && this.renderUserInfo()}
        {step === 2 && this.renderUserImages()}
        {step === 3 && this.renderUserInterest()}
      </div>
    );
  };

  renderWizard = (current) => {
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
}

export default Profile;
