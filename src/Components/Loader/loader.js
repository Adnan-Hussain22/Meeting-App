import React, { Component } from "react";
import { connect } from "react-redux";
import { updateLoader } from "../../Redux/Actions/loaderActions";
import loadingGif from "../../Helpers/Images/loader.gif";
import "./loader.css";
class Loader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: props.loader
    };
  }

  handleValidateModal = loader => {
    if (loader) this.modalLoader.style.display = "block";
    else this.modalLoader.style.display = "none";
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ loader: nextProps.loader }, () => {
      this.handleValidateModal(this.state.loader);
    });
  }

  componentDidMount() {
    this.modalLoader.style.display = "none"
    if(this.props.loader)
    this.handleValidateModal({loader:true});
    else this.handleValidateModal({loader:false});
  }

  render() {
    return (
      <div
        className="modal-loader"
        ref={ele => {
          this.modalLoader = ele;
        }}
        style={{ display: "none" }}
      >
        <div class="modal-content">
          <img src={loadingGif} style={{ width: "40px", height: "40px" }} />
        </div>
      </div>
    );
  }
}
//This function will get the updated store
const mapStateToProps = state => {
  return {
    loader: state.loaderReducers.loader
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateLoader: data => dispatch(updateLoader(data))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Loader);
