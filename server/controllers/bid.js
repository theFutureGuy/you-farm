const asyncHandler = require("express-async-handler");
const { db } = require("../config/db");
const {
  addDoc,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  Timestamp,
} = require("firebase/firestore/lite");

const createShow = asyncHandler(async (req, res) => {
  try {
    const { phone, name, quantity, end } = req.body;
    const bidShowRef = collection(db, "bidshows");
    const dataRef = {
      closetime: Timestamp.fromMillis(Date.parse(Date())),
      createdby: phone,
      createdon: Timestamp.fromMillis(Date.parse(Date(end))),
      name: name,
      quantity: quantity,
      bids: [],
    };
    let id = "";
    await addDoc(bidShowRef, dataRef).then((result) => (id = result.id));
    dataRef.id = id;
    res.status(200).send(dataRef);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

const addBid = asyncHandler(async (req, res) => {
  try {
    const { showId, phone, name, amount } = req.body;
    const bidRef = collection(db, "bids");
    const docRef = doc(db, "bids", showId + phone);
    const createShowDocRef = doc(db, "bidshows", showId);
    const dataRef = {
      name: name,
      amount: amount,
      phone: phone,
      bidId: createShowDocRef,
      createdon: Timestamp.fromMillis(Date.parse(new Date())),
    };
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      res.status(404).send("User already exists");
    } else {
      await setDoc(doc(bidRef, showId + phone), dataRef);
      const updates = [];
      await getDoc(createShowDocRef).then((doc) => {
        updates.push(
          updateDoc(createShowDocRef, { bids: [...doc.data().bids, docRef] })
        );
        // console.log(updates);
      });
      Promise.all(updates, () => {
        console.log("Users updated success");
      });
      dataRef.bidId = showId;

      res.status(200).send(dataRef);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = {
  addBid,
  createShow,
};
