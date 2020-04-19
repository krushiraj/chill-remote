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

function initApp() {
  // chrome.runtime.sendMessafe(
  //   ({ action, data }, sender, sendResponse) => {
  //     console.log({ action, data });
  //     if (action === 'set_slot_id') {
  //       console.log(document.getElementById('slot-id'));
  //       document.getElementById('slot-id').innerHTML = data.slotId;
  //       gSlotId = data.slotId;
  //     }
  //   }
  // );
}

window.onload = function () {
  // initApp();
  chrome.runtime.sendMessage({ action: 'get_slot_id' }, {}, ({ slotId }) => {
    document.getElementById('slot-id').innerHTML = slotId || '******';
  });
};
