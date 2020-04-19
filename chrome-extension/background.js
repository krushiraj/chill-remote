// TODO(DEVELOPER): Change the values below using values from the initialization snippet: Firebase Console > Overview > Add Firebase to your web app.
// Initialize Firebase
const config = {
  apiKey: 'AIzaSyCgVN5T7M4HMkUsAHPhjiOmc5rM32PX6N4',
  authDomain: 'chill-remote-tkr.firebaseapp.com',
  databaseURL: 'https://chill-remote-tkr.firebaseio.com',
  projectId: 'chill-remote-tkr',
  storageBucket: 'chill-remote-tkr.appspot.com',
  messagingSenderId: '110935019751',
  appId: '1:110935019751:web:534d107400cc235639d242',
  measurementId: 'G-PPXXFNXN57',
};
firebase.initializeApp(config);
const createSlot = firebase.functions().httpsCallable('createSlot');
const slots = firebase.database().ref('slots');
const connected = firebase.database().ref('.info/connected');

/**
 * initApp handles setting up the Firebase context and registering
 * callbacks for the auth status.
 *
 * The core initialization is in firebase.App - this is the glue class
 * which stores configuration. We provide an app name here to allow
 * distinguishing multiple app instances.
 *
 * This method also registers a listener with firebase.auth().onAuthStateChanged.
 * This listener is called when the user is signed in or out, and that
 * is where we update the UI.
 *
 * When signed in, we also authenticate to the Firebase Realtime Database.
 */

function setTimestamp(extConn) {
  if (window.slotId) {
    slots.child(slotId).update({
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      extConn,
    });
  }
}

async function createAndStoreSlot() {
  const { data: slotId } = await createSlot();
  window.slotId = slotId;
  console.log({ slotId, windowSlotId: window.slotId });
}

async function initSlot() {
  if (!window.slotId) {
    await createAndStoreSlot();
  } else {
    const slotId = window.slotId;
    console.log('Existing: ', { slotId });
    const slotIdDb = (await slots.child(slotId).once('value')).val();
    console.log({ slotIdDb });
    if (!slotIdDb) {
      window.slotId = null;
      await createAndStoreSlot();
    }
  }
}

async function initApp() {
  console.log('app started');

  chrome.runtime.onMessage.addListener(
    ({ action, data }, sender, sendResponse) => {
      if (action === 'get_slot_id') {
        const slotId = window.slotId;
        console.log({ sendResponse, slotId });
        sendResponse({ slotId });
        return true;
      }
    }
  );

  await initSlot();

  const slotId = window.slotId;
  connected.on('value', async (snap) => {
    const val = snap.val();
    console.log({ val });
    if (val === true) {
      // When I disconnect, update the last time I was seen online
      setTimestamp(true);
    } else {
      setTimestamp(false);
    }
  });

  console.log('adding observers on', slotId);
  slots
    .child(slotId)
    .child('operation')
    .on('value', (snap) => {
      console.log(snap);
      const { action, selector } = snap.val();
      console.log('Sending message:', { action, selector });
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action, selector }, function (
          response
        ) {});
      });
    });
}

window.onload = function () {
  initApp();
};
