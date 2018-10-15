import firebase from "firebase";
var config = {
  apiKey: "AIzaSyBURwrX3es_925W6qzsRzHkIQt86I5XtnM",
  authDomain: "meeting-app-df2fa.firebaseapp.com",
  databaseURL: "https://meeting-app-df2fa.firebaseio.com",
  projectId: "meeting-app-df2fa",
  storageBucket: "meeting-app-df2fa.appspot.com",
  messagingSenderId: "462065929865"
};

firebase.initializeApp(config);

export default firebase;

const fireStore = firebase.firestore();
fireStore.settings({
  timestampsInSnapshots: true
});

// const base = Rebase.createClass(fireStore);

export {fireStore};
