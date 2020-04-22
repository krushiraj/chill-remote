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
const selectors = firebase.database().ref('selectors');
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

function getDomain(url) {
  const a = document.createElement('a');
  a.href = url;
  return a.hostname.replace(/(www.)|(.com)|(.in)|(.co)/g, '');
}

async function initApp() {
  console.log('app started');

  window.selectors = (await selectors.once('value')).val();
  window.supportedDomains = Object.keys(window.selectors || {});

  selectors.on('value', (snap) => {
    window.selectors = snap.val();
    window.supportedDomains = Object.keys(window.selectors || {});
  });

  console.log({
    selectors: window.selectors,
    supportedDomains: window.supportedDomains,
  });

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

  chrome.tabs.onActivated.addListener(() => {
    chrome.windows.getAll({ populate: true }, (windows) => {
      const currentState = {};
      windows.forEach(({ tabs }) => {
        tabs.forEach((tab) => {
          const { url, favIconUrl, title, id, active } = tab;
          console.log({
            url,
            id,
            truth: window.supportedDomains.includes(getDomain(url)),
          });
          if (window.supportedDomains.includes(getDomain(url)))
            currentState[id] = {
              url,
              favIconUrl,
              title,
              active,
            };
        });
      });
      console.log(currentState);
      slots.child(slotId).child('currentState').set(currentState);
      setTimestamp(true);
    });
  });

  connected.on('value', async (snap) => {
    const val = snap.val();
    console.log({ val });
    setTimestamp(val);
  });

  console.log('adding observers on', slotId);
  slots
    .child(slotId)
    .child('operation')
    .on('value', (snap) => {
      console.log(snap);
      const { action, control, domain, tabId } = snap.val();
      const selector = window.selectors[domain][control];

      console.log('Sending message:', {
        action,
        control,
        domain,
        tabId,
        selector,
      });
      chrome.tabs.sendMessage(parseInt(tabId), { action, selector }, function (
        response
      ) {});
    });
}

window.onload = function () {
  initApp();
};
