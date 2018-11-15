import React from "react";
import ReactDOM from "react-dom";
import { store, persistor } from "./Redux/store";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import "./index.css";
import App from "./App";

ReactDOM.render(
  <Provider store={store}>
    <PersistGate persistor={persistor} loading={null}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById("root")
);
