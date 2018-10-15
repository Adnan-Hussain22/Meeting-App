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
  Checkbox
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
      user: null,
      step: 3,
      totalSteps: 3,
      previewVisible: false,
      previewImage: "",
      loading: false,
      avatar: "",
      images: [],
      Beverages: [],
      Durations: [],
      nextStep:false
    };
  }

  getBase64(img, callback, info) {
    const reader = new FileReader();
    reader.addEventListener("load", () =>
      callback(reader.result, info.fileList.uid)
    );
    reader.readAsDataURL(img);
  }

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
    if (info.file.status === "uploading") {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === "done") {
      console.log("Getting the image url");
      // Get this url from response in real world.
      this.getBase64(info.file.originFileObj, this.getImage, info);
    }
  };

  handleNextStep = () => {
    const { step, totalSteps } = this.state;
    if (step < totalSteps) this.setState({ step: step + 1 });
  };

  handleSaveSteps = () => {};

  handlePreview = file => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true
    });
  };

  getImage = (filePath, id) => {
    console.log("getImage");
    const { images } = this.state;
    console.log("Setting Image");
    this.setState({ loading: false });
    //this.setState({ images: images.concat([{ filePath, id }]) });
  };

  handleCustomRequest = e => {
    console.log("handleCustomRequest=>", e);
  };

  handleInterestBeverageChange = checkedValues => {
    this.setState({ Beverages: checkedValues });
  };

  handleInterestsDurationChange = checkedValues => {
    this.setState({ Durations: checkedValues });
  };

  render() {
    const { step,nextStep } = this.state;
    return (
      <div className="wizard" style={{ position: "relative" }}>
        {this.renderWizard()}
        {this.renderSteps(step)}
        <Button
          type="primary"
          style={{ position: "absolute", right: "5px" }}
          onClick={step != 3 ? this.handleNextStep : this.handleSaveSteps}
          disabled={nextStep}
        >
          {step != 3 ? "Next" : "Save"}
          <Icon type="right" />
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

  renderWizard = current => {
    return (
      <div className="wizard-steps" style={{ marginBottom: "20px" }}>
        <Steps current={current}>
          <Step title="Finished" description="Personal Info" />
          <Step title="In Progress" description="Images" />
          <Step title="Waiting" description="Interest" />
        </Steps>
      </div>
    );
  };

  renderUserInfo = () => {
    return (
      <div className="user-info">
        <Form onSubmit={this.handleSubmit} className="login-form">
          <FormItem>
            {
              <Input
                prefix={
                  <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                type="text"
                placeholder="Nick Name"
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
              />
            }
          </FormItem>
        </Form>
      </div>
    );
  };

  renderUserImages = () => {
    const { loading, imageUrl } = this.state;
    const uploadButton = (
      <div>
        <Icon type={loading ? "loading" : "plus"} />
        <div className="ant-upload-text">Upload Image</div>
      </div>
    );
    return (
      <ul className="userImage-list">
        <li>
          <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            action="//jsonplaceholder.typicode.com/posts/"
            beforeUpload={this.beforeUpload}
            onChange={this.handleAvatarChange}
            withCredentials={false}
            customRequest={() => {
              console.log("customRequest");
            }}
          >
            {imageUrl ? <img src={imageUrl} alt="avatar" /> : uploadButton}
          </Upload>
        </li>

        <li>
          <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            action="//jsonplaceholder.typicode.com/posts/"
            beforeUpload={this.beforeUpload}
            onChange={this.handleAvatarChange}
            withCredentials={false}
            customRequest={() => {
              console.log("customRequest");
            }}
          >
            {imageUrl ? <img src={imageUrl} alt="avatar" /> : uploadButton}
          </Upload>
        </li>

        <li>
          <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            action="//jsonplaceholder.typicode.com/posts/"
            beforeUpload={this.beforeUpload}
            onChange={this.handleAvatarChange}
            withCredentials={false}
            customRequest={() => {
              console.log("customRequest");
            }}
          >
            {imageUrl ? <img src={imageUrl} alt="avatar" /> : uploadButton}
          </Upload>
        </li>
      </ul>
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
            onChange={this.handleInterestBeverageChange}
          />
        </div>
      </div>
    );
  };
}

export default Profile;
