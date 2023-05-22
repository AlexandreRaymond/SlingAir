const { MongoClient } = require("mongodb");
const { flights, reservations } = require("./data");

const flightIds = Object.keys(flights);
console.log("flightIds", flightIds);

const allFlights = flightIds.map((item) => {
  return {
    _id: item,
    flight: item,
    seats: flights[item],
  };
});

console.log("result", allFlights[0].seats[0]);

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const batchImport = async () => {
  console.log("MONGO URI", MONGO_URI);
  const client = new MongoClient(MONGO_URI, options);
  let result;
  try {
    await client.connect();
    console.log("Jet is in the air!");

    const db = client.db("slingair");
    result = await db.collection("reservations").insertMany(reservations);
    console.log("batch result", result);
  } catch (err) {
    console.log(err.stack);
    console.log("message", err.message);
  } finally {
    await client.close();
    console.log("Jet has landed!");
    if (result.acknowledged === true) {
      console.log("It worked");
    }
  }
};

batchImport();
