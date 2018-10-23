import React, { Component } from "react";
import { Button, Carousel } from "antd";
import { Card as AntdCard } from "antd";
import { Card as DeckCard } from "react-swipe-deck";
import Cards from "react-swipe-deck";
import "antd/dist/antd.css";
import firebase, { fireStore } from "../../Config/firebase";
import Profile from "../Profile/profile";
import defaultAvatar from "../../Helpers/Images/default Avatar.jpg";
import tickIcon from "../../Helpers/Images/tick.png";
import cancelIcon from "../../Helpers/Images/cancel.png";
import "./card.css";
const { Meta } = AntdCard;
class Data extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: null
    };
  }

  componentDidMount() {
    // this.handleFetchUsers();
  }

  

  render() {
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
            <Cards
              onEnd={() => {
                console.log("onEnd");
              }}
              className="master-root"
            >
              {users.map(item => (
                <DeckCard
                  onSwipeLeft={e => {
                    console.log("onSwipeLeft", e);
                  }}
                  onSwipeRight={() => {
                    console.log("onSwipeRight");
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
  }

  renderUsers = () => {
    return <div>Users Data</div>;
  };
}
export default Data;
