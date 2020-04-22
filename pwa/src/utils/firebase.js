import * as firebase from 'firebase';

export const config = {
  apiKey: 'AIzaSyCgVN5T7M4HMkUsAHPhjiOmc5rM32PX6N4',
  authDomain: 'chill-remote-tkr.firebaseapp.com',
  databaseURL: 'https://chill-remote-tkr.firebaseio.com',
  projectId: 'chill-remote-tkr',
  storageBucket: 'chill-remote-tkr.appspot.com',
  messagingSenderId: '110935019751',
  appId: '1:110935019751:web:534d107400cc235639d242',
  measurementId: 'G-PPXXFNXN57',
};

export default firebase;
export const firebaseApp = firebase.initializeApp(config);
