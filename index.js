const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { ObjectId } = require("mongodb");
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
        res.status(500).send({ message: "Failed to fetch user role" });
      }
    });

    // GET all pending teacher requests
    app.get("/teacher-requests/pending", async (req, res) => {
      try {
        const pendingRequests = await usersCollection
          .find({
            "teacherApplication.status": "pending",
          })
          .toArray();

        res.status(200).json({ success: true, data: pendingRequests });
      } catch (error) {
        res
          .status(500)
          .json({ success: false, message: "Internal server error." });
      }
    });

    // PATCH to approve a teacher request
    app.patch("/teacher-requests/:email/approve", async (req, res) => {
      try {
        const { email } = req.params;
        console.log(`PATCH /teacher-requests/${email}/approve received.`);

        const result = await usersCollection.updateOne(
          { email: email, "teacherApplication.status": "pending" },
          {
            $set: {
              role: "teacher",
              "teacherApplication.status": "approved",
            },
          }
        );

        if (result.modifiedCount === 0) {
          const userExists = await usersCollection.findOne({ email });
          if (!userExists) {
            return res
              .status(404)
              .json({ success: false, message: "User not found." });
          }
          return res.status(400).json({
            success: false,
            message: "Application not pending or already approved/rejected.",
          });
        }

        res.status(200).json({
          success: true,
          message: "Teacher request approved successfully.",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to approve teacher request.",
          error: error.message,
        });
      }
    });

    // --- NEW: PATCH to reject a teacher request (with role change) ---
    app.patch("/teacher-requests/:email/reject", async (req, res) => {
      try {
        const { email } = req.params;
        console.log(`PATCH /teacher-requests/${email}/reject received.`);

        const result = await usersCollection.updateOne(
          { email: email, "teacherApplication.status": "pending" }, // Only update if currently pending
          {
            $set: {
              role: "student",
              "teacherApplication.status": "rejected",
            },
          }
        );

        if (result.modifiedCount === 0) {
          const userExists = await usersCollection.findOne({ email });
          if (!userExists) {
            return res
              .status(404)
              .json({ success: false, message: "User not found." });
          }
          return res.status(400).json({
            success: false,
            message: "Application not pending or already approved/rejected.",
          });
        }

        res.status(200).json({
          success: true,
          message: "Teacher request rejected successfully.",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to reject teacher request.",
          error: error.message,
        });
      }
    });

    // Example route: GET /allUsers?search=admin
    app.get("/allUsers", async (req, res) => {
      const search = req.query.search || "";
      const users = await usersCollection
        .find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        })
        .sort({ createdAt: -1 })
        .toArray();

      res.send(users);
    });

    // Make Admin route
    app.patch("/users/make-admin/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.updateOne(
        { email },
        { $set: { role: "admin" } }
      );
      res.send(result);
    });

    // POST /addClass
    app.post("/addClass", async (req, res) => {
      try {
        const classData = req.body;
        classData.status = "pending"; // Set default status
        const result = await db.collection("allClasses").insertOne(classData);
        res.send({ success: true, insertedId: result.insertedId });
      } catch (error) {
        res.status(500).send({ success: false, message: error.message });
      }
    });

    // My classes Route
    app.get("/my-classes", async (req, res) => {
      const email = req.query.email;
      try {
        const result = await allClassesCollection
          .find({ email: email })
          .sort({ createdAt: -1 })
          .toArray();
        res.send({ success: true, data: result });
      } catch (err) {
        res
          .status(500)
          .send({ success: false, message: "Failed to fetch classes." });
      }
    });

    // Update Class Route
    app.patch("/my-classes/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      try {
        console.log("PATCH data:", updatedData); // Debug incoming data

        const result = await allClassesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );

        if (result.modifiedCount > 0) {
          res.send({ success: true, modifiedCount: result.modifiedCount });
        } else {
          res
            .status(400)
            .send({ success: false, message: "No document updated." });
        }
      } catch (err) {
        console.error("Update error:", err);
        res
          .status(500)
          .send({ success: false, message: "Failed to update class." });
      }
    });

    // Class Delete Route

    app.delete("/my-classes/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await allClassesCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send({ success: true, deletedCount: result.deletedCount });
      } catch (err) {
        res
          .status(500)
          .send({ success: false, message: "Failed to delete class." });
      }
    });

    //  All Approved Classes Get Route
    app.get("/allClasses", async (req, res) => {
      try {
        const result = await allClassesCollection
          .find({ status: "approved" })
          .toArray();

        res.send({ success: true, data: result });
      } catch (err) {
        res
          .status(500)
          .send({ success: false, message: "Failed to fetch classes." });
      }
    });

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
