import firebase from 'firebase'
import firestore from 'firebase/firestore'

var config = {
  apiKey: "AIzaSyBH8dKFP4CDphjSyTHVU_D6lxUBnUMRJqI",
  authDomain: "poked-36d6a.firebaseapp.com",
  databaseURL: "https://poked-36d6a.firebaseio.com",
  projectId: "poked-36d6a",
  storageBucket: "poked-36d6a.appspot.com",
  messagingSenderId: "563011610660",
  appId: "1:563011610660:web:6e5f9019eb9610a166d0b1"
};

//var app = firebase.initializeApp(config);
//var db = firebase.firestore(app);

const firebaseApp = firebase.initializeApp(config);
firebaseApp.firestore()//.settings({ timestampsInSnapshots: true })

export default firebaseApp.firestore()