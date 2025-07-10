const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
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
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    console.log("MongoDB Connected Successfully!");

    const db = client.db("mentorium");
    const usersCollection = db.collection("users");
    const allClassesCollection = db.collection("allClasses");

    // User added usersCollection
    app.post("/users", async (req, res) => {
      console.log("POST /users received. Body:", req.body);
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send({ insertedId: result.insertedId });
    });

    // GET user by email (for existing application check)

    app.get("/users/:email", async (req, res) => {
      try {
        const email = req.params.email;

        const user = await usersCollection.findOne({ email });

        if (user) {
          res.status(200).json({ success: true, data: user });
        } else {
          res
            .status(200)
            .json({ success: true, data: null, message: "User not found." });
        }
      } catch (error) {
        res
          .status(500)
          .json({ success: false, message: "Internal server error." });
      }
    });

    // PATCH user with teacher application
    app.patch("/users/:email", async (req, res) => {
      try {
        const { email } = req.params;
        const { role, name, experience, title, category } = req.body;

        console.log(`PATCH /users/${email} received. Body:`, req.body);

        if (!experience || !title || !category) {
          return res.status(400).json({
            success: false,
            message:
              "Experience, title, and category are required for teacher application",
          });
        }

        const updateDoc = {
          $set: {
            role: role || "pending",
            teacherApplication: {
              name: name,
              email: email,
              experience: experience,
              title: title,
              category: category,
              status: "pending",
              appliedAt: new Date(),
            },
          },
        };

        const result = await usersCollection.updateOne({ email }, updateDoc);

        if (result.modifiedCount === 0) {
          const userExists = await usersCollection.findOne({ email });
          if (!userExists) {
            return res.status(404).json({
              success: false,
              message: "User not found.",
            });
          }
          return res.status(200).json({
            success: true,
            message:
              "No changes made (user role and application already up to date).",
          });
        }

        res.status(200).json({
          success: true,
          message:
            "Teacher application submitted and user role updated successfully.",
        });
      } catch (error) {
        console.error("Error submitting teacher application:", error);
        res.status(500).json({
          success: false,
          message: "Failed to submit teacher application",
          error: error.message,
        });
      }
    });

    // Get user role by email (Existing route)
    app.get("/users/:email/role", async (req, res) => {
      const email = req.params.email;
      try {
        const user = await usersCollection.findOne({ email });

        if (user) {
          res.send({ role: user.role || "user" });
        } else {
          res.status(404).send({ message: "User not found" });
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
        res.status(500).send({ message: "Failed to fetch user role" });
      }
    });

    // Classes Added Api
    app.post("/class", async (req, res) => {});

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
