import React, { Component } from "react";
import loadingGif from "../../Helpers/Images/loader.gif";
import "./loader.css";
class Loader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enabled: props.enabled
    };
  }

  handleValidateModal = () => {
    const {enabled} = this.state;
    if (enabled) this.modalLoader.style.display = "block";
    else this.modalLoader.style.display = "none";
  };

  componentDidUpdate(){
    this.handleValidateModal();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ enabled: nextProps.enabled }, () => {
    });
  }

  render() {
    return (
      <div
        className="modal-loader"
        ref={ele => {
          this.modalLoader = ele;
        }}
      >
        <div class="modal-content">
          <img src={loadingGif} style={{ width: "40px", height: "40px" }} />
        </div>
      </div>
    );
  }
}


export default Loader
