import React from "react";
import { Modal, notification } from "antd";
import "antd/dist/antd.css";
const ActionCreater = (type, msgTitle, msgContent) => {
  switch (type) {
    case "error": {
      Modal.error({
        title: msgTitle,
        content: msgContent
      });
      break;
    }
    case "info": {
      Modal.info({
        title: msgTitle,
        content: msgContent
      });
      break;
    }

    case "success": {
      Modal.success({
        title: msgTitle,
        content: msgContent
      });
      break;
    }

    case "warning": {
      Modal.warning({
        title: msgTitle,
        content: msgContent
      });
      break;
    }
  }
};

const NotificationCreater = (type, msgTitle, msgContent) => {
  notification[type]({
    message: msgTitle,
    description: msgContent
  });
};

export { ActionCreater, NotificationCreater };
