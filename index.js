const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;
const Stripe = require("stripe");

const stripe = require("stripe")(process.env.PAYMENT_SK_KEY);

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

    const db = client.db("mentorium");
    const usersCollection = db.collection("users");
    const allClassesCollection = db.collection("allClasses");
    const enrollmentsCollection = db.collection("enrollments");
    const assignmentsCollection = db.collection("assignments");
    const submissionsCollection = db.collection("submissions");
    const evaluationsCollection = db.collection("evaluations");

    // User added usersCollection
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send({ insertedId: result.insertedId });
    });

    app.get("/mentorium/allUsers", async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      try {
        const totalUsers = await usersCollection.countDocuments({});
        const users = await usersCollection
          .find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray();

        res.send({
          success: true,
          data: users,
          totalCount: totalUsers,
          currentPage: page,
          itemsPerPage: limit,
        });
      } catch (err) {
        res
          .status(500)
          .send({ success: false, message: "Failed to fetch users." });
      }
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

        const result = await usersCollection.updateOne(
          { email: email, "teacherApplication.status": "pending" },
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

    // POST /addClass route (ensure availableSeats is handled for unlimited enrollment)
    app.post("/addClass", async (req, res) => {
      try {
        const classData = req.body;
        classData.status = "pending";
        classData.totalEnrolled = classData.totalEnrolled || 0;
        classData.availableSeats = classData.availableSeats || 999999;
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

    // All Approved Classes Get Route
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

    // --- NEW: Popular Classes Route ---
    app.get("/popular-classes", async (req, res) => {
      try {
        const popularClasses = await allClassesCollection
          .find({ status: "approved" })
          .sort({ totalEnrolled: -1 })
          .limit(6)
          .toArray();

        res.status(200).json({ success: true, data: popularClasses });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch popular classes.",
          error: error.message,
        });
      }
    });

    // Admin Route - Get All Classes
    app.get("/admin/all-classes", async (req, res) => {
      try {
        const result = await allClassesCollection.find().toArray();
        res.send({ success: true, data: result });
      } catch (err) {
        res
          .status(500)
          .send({ success: false, message: "Failed to fetch classes." });
      }
    });

    // Admin PATCH to Approve/Reject Class
    app.patch("/admin/class-status/:id", async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;
      try {
        const result = await allClassesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );
        res.send({ success: true, modifiedCount: result.modifiedCount });
      } catch (err) {
        res
          .status(500)
          .send({ success: false, message: "Failed to update status." });
      }
    });

    // Payment Process start
    app.post("/create-payment-intent", async (req, res) => {
      try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid payment amount",
          });
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: "usd",
          payment_method_types: ["card"],
        });

        res.status(200).json({
          success: true,
          clientSecret: paymentIntent.client_secret,
        });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    });

    // Update the existing enrollment route
    app.post("/enrollments", async (req, res) => {
      try {
        const { classId, studentEmail, transactionId, amount } = req.body;

        const classData = await allClassesCollection.findOne({
          _id: new ObjectId(classId),
        });

        if (!classData) {
          return res
            .status(404)
            .json({ success: false, message: "Class not found" });
        }

        // 2. Check if student is already enrolled in this specific class
        const existing = await enrollmentsCollection.findOne({
          classId,
          studentEmail,
        });

        if (existing) {
          return res.status(400).json({
            success: false,
            message: "Already enrolled in this class",
          });
        }

        // 3. Enroll
        const enrollment = {
          classId,
          studentEmail,
          teacherEmail: classData.email,
          transactionId: transactionId,
          amount,
          enrolledAt: new Date(),
          status: "active",
          className: classData.title,
          classImage: classData.image,
          instructorName: classData.name,
        };

        const result = await enrollmentsCollection.insertOne(enrollment);

        // Only increment totalEnrolled, DO NOT decrement availableSeats
        await allClassesCollection.updateOne(
          { _id: new ObjectId(classId) },
          {
            $inc: {
              totalEnrolled: 1,
            },
          }
        );

        await usersCollection.updateOne(
          { email: studentEmail },
          { $addToSet: { enrolledClasses: classId } }
        );

        res.status(200).json({
          success: true,
          message: "Enrollment successful",
          data: {
            enrollmentId: result.insertedId,
            classId,
            className: classData.title,
          },
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Failed to enroll",
          error: err.message,
        });
      }
    });

    // Get user's enrolled classes with class details
    app.get("/users/:email/enrolled-classes", async (req, res) => {
      try {
        const email = req.params.email;

        const user = await usersCollection.findOne({ email });
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        // If no enrolled classes, return empty array
        if (!user.enrolledClasses || user.enrolledClasses.length === 0) {
          return res.status(200).json({
            success: true,
            data: [],
          });
        }

        // Convert string IDs to ObjectId
        const classIds = user.enrolledClasses.map((id) => new ObjectId(id));

        // Get full class details for each enrolled class
        const enrolledClasses = await allClassesCollection
          .find({
            _id: { $in: classIds },
          })
          .toArray();

        // Get enrollment dates and transaction info
        const enrollments = await enrollmentsCollection
          .find({
            classId: { $in: user.enrolledClasses },
            studentEmail: email,
          })
          .toArray();

        // Combine the data
        const result = enrolledClasses.map((cls) => {
          const enrollment = enrollments.find(
            (e) => e.classId === cls._id.toString()
          );
          return {
            ...cls,
            enrollmentDate: enrollment?.enrolledAt,
            transactionId: enrollment?.transactionId,
            amountPaid: enrollment?.amount,
          };
        });

        res.status(200).json({
          success: true,
          data: result,
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch enrolled classes",
          error: err.message,
        });
      }
    });

    app.get("/class/:id", async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid class ID" });
        }
        const classDoc = await allClassesCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!classDoc) {
          return res.status(404).json({ error: "Class not found" });
        }

        res.status(200).json({ data: classDoc });
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // --- NEW: Get Feedbacks for a Specific Class Route ---
    app.get("/feedbacks/class/:classId", async (req, res) => {
      try {
        const classId = req.params.classId;
        const feedbacks = await evaluationsCollection
          .find({ classId: classId, rating: { $ne: null } })
          .toArray();

        const feedbacksWithUserDetails = await Promise.all(
          feedbacks.map(async (feedback) => {
            const student = await usersCollection.findOne({
              email: feedback.studentEmail,
            });
            return {
              ...feedback,
              studentName: student?.name || "Anonymous",
              studentPhoto:
                student?.photo ||
                "https://img.icons8.com/?size=100&id=124204&format=png&color=000000",
            };
          })
        );

        res.status(200).json({ success: true, data: feedbacksWithUserDetails });
      } catch (error) {
        console.error("Error fetching class feedbacks:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch class feedbacks.",
          error: error.message,
        });
      }
    });

    app.post("/verify-payment", async (req, res) => {
      try {
        const { paymentIntentId } = req.body;
        if (!paymentIntentId) {
          return res
            .status(400)
            .json({ success: false, message: "PaymentIntent ID is required" });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId
        );

        if (paymentIntent.status !== "succeeded") {
          return res
            .status(400)
            .json({ success: false, message: "Payment not completed" });
        }

        res.status(200).json({
          success: true,
          data: {
            paymentStatus: paymentIntent.status,
            amountPaid: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            createdAt: new Date(paymentIntent.created * 1000),
          },
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Failed to verify payment",
          error: err.message,
        });
      }
    });

    // Add a new assignment
    app.post("/assignments", async (req, res) => {
      try {
        const assignmentData = req.body;

        assignmentData.submissionCount = 0;
        assignmentData.createdAt = new Date();

        // Validate required fields (optional but good practice)
        if (
          !assignmentData.classId ||
          !assignmentData.teacherEmail ||
          !assignmentData.title ||
          !assignmentData.description ||
          !assignmentData.deadline
        ) {
          return res.status(400).json({
            success: false,
            message: "Missing required assignment fields.",
          });
        }

        const result = await assignmentsCollection.insertOne(assignmentData);

        res.status(201).json({
          success: true,
          message: "Assignment added successfully!",
          insertedId: result.insertedId,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to add assignment.",
          error: error.message,
        });
      }
    });

    // Get all assignments for a specific class
    app.get("/assignments/:classId", async (req, res) => {
      try {
        const classId = req.params.classId;
        const assignments = await assignmentsCollection
          .find({ classId: classId })
          .toArray();
        res.status(200).json({ success: true, data: assignments });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch assignments.",
          error: error.message,
        });
      }
    });

    // Get total assignment count for a class (for teacher dashboard)
    app.get("/assignments/count/:classId", async (req, res) => {
      try {
        const classId = req.params.classId;
        const count = await assignmentsCollection.countDocuments({
          classId: classId,
        });
        res.status(200).json({ success: true, count: count });
      } catch (error) {
        console.error("Error fetching assignment count:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch assignment count.",
          error: error.message,
        });
      }
    });

    // Submit an assignment
    app.post("/submissions", async (req, res) => {
      try {
        const submissionData = req.body;
        submissionData.submittedAt = new Date();
        const result = await submissionsCollection.insertOne(submissionData);

        // Increment assignment submission count
        await assignmentsCollection.updateOne(
          { _id: new ObjectId(submissionData.assignmentId) },
          { $inc: { submissionCount: 1 } }
        );

        res.status(201).json({
          success: true,
          message: "Assignment submitted successfully!",
          insertedId: result.insertedId,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to submit assignment.",
          error: error.message,
        });
      }
    });

    // Get total submission count for a class (for teacher dashboard)
    app.get("/submissions/count/:classId", async (req, res) => {
      try {
        const classId = req.params.classId;
        const count = await submissionsCollection.countDocuments({
          classId: classId,
        });
        res.status(200).json({ success: true, count: count });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch submission count.",
          error: error.message,
        });
      }
    });

    // Submit a teaching evaluation
    app.post("/evaluations", async (req, res) => {
      try {
        const evaluationData = req.body;
        evaluationData.submittedAt = new Date();
        const result = await evaluationsCollection.insertOne(evaluationData);
        res.status(201).json({
          success: true,
          message: "Evaluation submitted successfully!",
          insertedId: result.insertedId,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to submit evaluation.",
          error: error.message,
        });
      }
    });

    // --- NEW: Get All Feedbacks Route ---
    app.get("/feedbacks", async (req, res) => {
      try {
        const feedbacks = await evaluationsCollection
          .find({ rating: { $ne: null } })
          .toArray();

        const feedbacksWithUserDetails = await Promise.all(
          feedbacks.map(async (feedback) => {
            const student = await usersCollection.findOne({
              email: feedback.studentEmail,
            });
            return {
              ...feedback,
              studentName: student?.name || "Anonymous",
              studentPhoto:
                student?.photo ||
                "https://img.icons8.com/?size=100&id=124204&format=png&color=000000", // Default photo
            };
          })
        );

        res.status(200).json({ success: true, data: feedbacksWithUserDetails });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch feedbacks.",
          error: error.message,
        });
      }
    });

    // --- NEW: Get Website Stats Route ---
    app.get("/stats", async (req, res) => {
      try {
        const totalUsers = await usersCollection.countDocuments();
        const totalClasses = await allClassesCollection.countDocuments({
          status: "approved",
        });
        const totalEnrollments = await enrollmentsCollection.countDocuments();

        res.status(200).json({
          success: true,
          data: {
            totalUsers,
            totalClasses,
            totalEnrollments,
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch website statistics.",
          error: error.message,
        });
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
