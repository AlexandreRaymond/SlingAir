"use strict";
const { MongoClient } = require("mongodb");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const getMongoClient = async () => {
  try {
    console.log("MONGO", MONGO_URI);
    const client = new MongoClient(MONGO_URI, options);
    await client.connect();
    console.log("I'm in handlers!");
    return client;
  } catch (err) {
    console.log("Error", err);
    return false;
  }
};

// use this package to generate unique ids: https://www.npmjs.com/package/uuid
const { v4: uuidv4 } = require("uuid");

// returns an array of all flight numbers
const getFlights = async (req, res) => {
  try {
    const client = await getMongoClient();
    const db = await client.db("slingair");
    const flights = await db.collection("flights").find().toArray();
    await client.close();
    console.log("GetFlights closed!");
    const flightNum = flights.map((item) => {
      return item.flight;
    });

    return res.status(200).json({
      status: 200,
      flights: flightNum,
    });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      data: "Error, cannot get flight numbers",
    });
  }
};

// returns all the seats on a specified flight
const getFlight = async (req, res) => {
  const { flight } = req.params;

  try {
    const client = await getMongoClient();
    const db = await client.db("slingair");
    const specFlight = await db.collection("flights").findOne({ flight });
    await client.close();
    console.log("Closed GetFlight!");
    return res.status(200).json({
      status: 200,
      seats: specFlight.seats,
    });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      data: "Error, cannot get flight numbers",
    });
  }
};

// returns all reservations
const getReservations = async (req, res) => {
  try {
    const client = await getMongoClient();
    const db = await client.db("slingair");
    const reserves = await db.collection("reservations").find().toArray();
    await client.close();
    console.log("getReservations closed!");
    return res.status(200).json({
      status: 200,
      reservations: reserves,
    });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      data: "Error, cannot get reservations",
    });
  }
};

// returns a single reservation
const getSingleReservation = async (req, res) => {
  const { reservation } = req.params;

  try {
    const client = await getMongoClient();
    const db = await client.db("slingair");
    const specreserve = await db
      .collection("reservations")
      .findOne({ _id: reservation });
    await client.close();
    console.log("Closed GetSingleReservation!");
    return res.status(200).json({
      status: 200,
      seats: specreserve,
    });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      data: "Error, reservation not found",
    });
  }
};

// creates a new reservation
const addReservation = async (req, res) => {
  const { flight, seat, givenName, surname, email } = req.body;
  const client = await getMongoClient();
  try {
    const newId = uuidv4();
    const db = await client.db("slingair");
    const newValues = {
      _id: newId,
      flight: flight,
      seat: seat,
      givenName: givenName,
      surname: surname,
      email: email,
    };

    const result = await db.collection("reservations").insertOne(newValues);

    const theQuery = { _id: flight, seats: { $elemMatch: { id: seat } } };
    const theUpdate = { $set: { "seats.$.isAvailable": false } };
    const updatedresult = await db
      .collection("flights")
      .updateOne(theQuery, theUpdate);
    await client.close();
    console.log("addReservation closed!");
    return res.status(200).json({
      status: 200,
      sucess: true,
      data: { reservationId: newId },
    });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      data: "Error, could not reserve",
    });
  }
};

// updates a specified reservation
const updateReservation = async (req, res) => {
  const client = await getMongoClient();
  const { flight, seat, givenName, surname, email, _id } = req.body;
  try {
    console.log("flight flight", flight);
    const theQuery = { _id: flight, seats: { $elemMatch: { id: seat } } };
    const theUpdate = { $set: { "seats.$.isAvailable": true } };
    const newValues = { $set: { ...req.body } };
    const db = await client.db("slingair");
    const currentReservation = await db
      .collection("reservations")
      .findOne({ _id: _id });
    const changeOldSeat = await db
      .collection("flights")
      .updateOne(
        { _id: currentReservation.flight, "seats.id": currentReservation.seat },
        { $set: { "seats.$.isAvailable": true } }
      );

    const flightResult = await db
      .collection("flights")
      .updateOne(
        { _id: flight, "seats.id": seat },
        { $set: { "seats.$.isAvailable": false } }
      );

    const result = await db
      .collection("reservations")
      .updateOne({ _id: _id }, newValues);
    console.log("result update", result);

    console.log("flightResult", flightResult);
    console.log("Result", result);
    await client.close();
    console.log("Upgrade Client is closed!");
    return res.status(200).json({
      status: 200,
      _id,
      ...req.body,
    });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      data: "Error, could not update reservation",
    });
  }
};

// deletes a specified reservation
const deleteReservation = async (req, res) => {
  const client = await getMongoClient();
  const { reservation } = req.params;

  try {
    const query = { _id: reservation };
    const db = await client.db("slingair");
    const currentReservation = await db
      .collection("reservations")
      .findOne(query);
    const changeOldSeat = await db
      .collection("flights")
      .updateOne(
        { _id: currentReservation.flight, "seats.id": currentReservation.seat },
        { $set: { "seats.$.isAvailable": true } }
      );
    const result = await db.collection("reservations").deleteOne(query);
    console.log("Result", result);
    await client.close();
    console.log("Delete Client is closed!");
    if (result.deletedCount) {
      return res.status(201).json({ status: 201, message: "Is deleted" });
    } else {
      return res
        .status(404)
        .json({ status: 404, message: "reservation not found!" });
    }
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      data: "Error, could not remove reservation",
    });
  }
};

module.exports = {
  getFlights,
  getFlight,
  getReservations,
  addReservation,
  getSingleReservation,
  deleteReservation,
  updateReservation,
};
