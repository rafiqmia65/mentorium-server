const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
require("dotenv").config();
const admin = require("firebase-admin");
const port = process.env.PORT || 3000;

// Middle Ware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const db = client.db("mentorium");
    const usersCollection = db.collection("users");


    






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Mentorium Server is Cooking!");
});

app.listen(port, () => {
  console.log(`Mentorium app listening on port ${port}`);
});
