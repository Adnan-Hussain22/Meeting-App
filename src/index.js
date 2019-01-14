import React from "react";
import ReactDOM from "react-dom";
import { store, persistor } from "./Redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import IndexRoutes from "./Config/Routes";
import "./index.css";

ReactDOM.render(
  <Provider store={store}>
    <PersistGate persistor={persistor} loading={null}>
      <IndexRoutes />
    </PersistGate>
  </Provider>,
  document.getElementById("root")
);
