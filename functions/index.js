const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.database();
const slots = db.ref('slots');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.createSlot = functions.https.onCall(async () => {
  const getSlot = async (slotId) =>
    (await slots.child(slotId).once('value')).val();
  try {
    let slotId;
    let exists = true;
    do {
      slotId = Math.floor(100000 + Math.random() * 900000);
      // eslint-disable-next-line no-await-in-loop
      exists = await getSlot(slotId);
      console.log({ slotId, exists });
    } while (exists);
    console.log({
      slotId,
    });
    await slots.child(slotId).set({
      timestamp: admin.database.ServerValue.TIMESTAMP,
      extConn: true,
      appConn: false,
      currentState: {},
      operation: {
        action: 'NOOP',
        control: '',
      },
    });
    return slotId;
  } catch (err) {
    console.log(err);
    return err;
  }
});

/**
 * Deletes all inactive slots.
 */
exports.deleteInactiveSlots = functions.database
  .ref('slots')
  .onWrite(async (change) => {
    const now = Date.now();
    const cutoff = now - 30 * 60 * 1000;

    const oldItemsQuery = slots.orderByChild('timestamp').endAt(cutoff);
    return oldItemsQuery.once('value', (snapshot) => {
      // create a map with all children that need to be removed
      const updates = {};
      snapshot.forEach((child) => {
        updates[child.key] = null;
      });
      // execute all updates in one go and return the result to end the function
      return slots.update(updates);
    });
  });
