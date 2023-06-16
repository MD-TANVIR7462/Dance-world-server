const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const stripe = require("stripe")(process.env.Payment_Secret);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB setup
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.v4ogoz2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const database = client.db("DanceProjectDB");
    const AllusersCollection = database.collection("Allusers");
    const insClassCollection = database.collection("ClassCollection");
    const paymentCollection = database.collection("paymentCollection");
    const MyBookmarkCollection = database.collection("MyBookmarkCollection");

    // Create Payment Intent
    app.post("/create-payment-intent", async (req, res) => {
      const price = req.body.price;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"]
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // Complete Payment
    app.post('/paymentcomplete', async (req, res) => {
      const newpayment = req.body;
      const id = req.body.oldId;
      const filter = { _id: new ObjectId(id) };
      const deleteID = newpayment.bookamekID;
      const confirmDelet = { _id: new ObjectId(deleteID) };
      const updateDoc = {
        $set: {
          Availableseats: newpayment.Availableseats,
          students: newpayment.students
        },
      };
      const removeBookmark = await MyBookmarkCollection.deleteOne(confirmDelet);
      const query = await insClassCollection.updateOne(filter, updateDoc);
      const result = await paymentCollection.insertOne(newpayment);
      res.send({ result, query, removeBookmark });
    });

    // User Collection Routes
    app.post('/allusers', async (req, res) => {
      const user = req.body;
      const result = await AllusersCollection.insertOne(user);
      res.send(result);
    });

    app.post('/allusersGoogle', async (req, res) => {
      const user = req.body;
      const email = user.email;
      const query = { email: email };
      const existingUser = await AllusersCollection.findOne(query);
      if (existingUser) {
        return res.send({ "status": "Already have an account" });
      } else {
        const result = await AllusersCollection.insertOne(user);
        res.send(result);
      }
    });

    app.get('/allusers', async (req, res) => {
      const result = await AllusersCollection.find().toArray();
      res.send(result);
    });

    app.patch('/allusers/instructor/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "instructor"
        },
      };
      const result = await AllusersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch('/allusers/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin"
        },
      };
      const result = await AllusersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // User Cart Collection Routes
    app.post('/mybookmark', async (req, res) => {
      const bookmark = req.body;
      const result = await MyBookmarkCollection.insertOne(bookmark);
      res.send(result);
    });

    app.get('/mybookmarkAll', async (req, res) => {
      const result = await MyBookmarkCollection.find().toArray();
      res.send(result);
    });

    app.get('/mybookmark', async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const result = await MyBookmarkCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/enrolledClass', async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/paymentBookmark/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await MyBookmarkCollection.findOne(query);
      res.send(result);
    });

    app.delete('/mybookmarkDelete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await MyBookmarkCollection.deleteOne(query);
      res.send(result);
    });

    // Instructor Collection Routes
    app.get('/instractorclass', async (req, res) => {
      const result = await insClassCollection.find().toArray();
      res.send(result);
    });

    app.post('/addaclass', async (req, res) => {
      const newclass = req.body;
      const result = await insClassCollection.insertOne(newclass);
      res.send(result);
    });

    app.get('/instructorclasses', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await insClassCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/instructorclasses/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await insClassCollection.findOne(query);
      res.send(result);
    });

    app.patch('/classupdate/:id', async (req, res) => {
      const id = req.params.id;
      const updated = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          price: updated.price,
          className: updated.className,
          Availableseats: updated.Availableseats,
          image: updated.image
        },
      };
      const result = await insClassCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Admin Routes
    app.patch('/classupdateAdmin/:id', async (req, res) => {
      const id = req.params.id;
      const updated = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: updated.status
        },
      };
      const result = await insClassCollection.updateOne(filter, updateDoc);
      res.send(result);
    });


    app.patch('/AdminFeedback/:id', async (req, res) => {
      const id = req.params.id;
  
      const updated = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          Feedback: updated.Feedback

        },
      };
      const result = await insClassCollection.updateOne(filter, updateDoc);
    res.send(result);
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } finally {
    // Ensures that the client will close when the server is terminated
    // or when an error occurs
    // await client.close();
  }
}

run().catch(console.dir);
