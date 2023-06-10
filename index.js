const express = require('express');
const app = express();
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');


//milde wares//===========>>>>>>
app.use(cors());
app.use(express.json());

//mongodb start==================>>>>>>


const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.v4ogoz2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
  
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("DanceProjectDB");
    const AllusersCollection = database.collection("Allusers");
    const insClassCollection = database.collection("ClassCollection");
    const MyBookmarkCollection = database.collection("MyBookmarkCollection");


// userCollection===========>>>>>>

app.post('/allusers', async (req, res) =>{
   
    const user = req.body;
    const result = await AllusersCollection.insertOne(user);
    res.send(result);
})
app.post('/allusersGoogle', async (req, res) =>{
   
    const user = req.body;
    const email = user.email
    const query = {email : email}
    const exixtingUser = await AllusersCollection.findOne(query)
    if(exixtingUser){
      return res.send({"status": "Already have an account"})
    }
    else{
      const result = await AllusersCollection.insertOne(user);
    res.send(result);
    }
    
})

app.get('/allusers', async (req, res) => {
   const result = await AllusersCollection.find().toArray()
   res.send(result)
 })


app.patch('/allusers/instractor/:id', async (req, res) => {
   const id = req.params.id
   const filter = { _id: new ObjectId(id) }
   const updateDoc = {
     $set: {
       role: "instructor"
     },
   };
   const result = await AllusersCollection.updateOne(filter, updateDoc)
   res.send(result)
 })

app.patch('/allusers/admin/:id', async (req, res) => {
   const id = req.params.id
   const filter = { _id: new ObjectId(id) }
   const updateDoc = {
     $set: {
       role: "admin"
     },
   };
   const result = await AllusersCollection.updateOne(filter, updateDoc)
   res.send(result)
 })

// --------userCartcollection============>>>>

app.post('/mybookmark',async(req,res)=>{
const bookmark = req.body
// const oldId = req.body.oldId
// const query = {oldId : oldId }
// const exixtingbookMark = await MyBookmarkCollection.findOne(query)
// if(exixtingbookMark) {
//   return res.send({statusbar:'Already Bookmarked'})
// }
// else{
  const result = await MyBookmarkCollection.insertOne(bookmark)
  res.send(result)
// }
})
app.get('/mybookmarkAll',async (req,res)=>{
  const result = await MyBookmarkCollection.find().toArray()
  res.send(result)
})

app.get('/mybookmark',async (req,res)=>{
  const email = req.query.email
  console.log(email)
const query = { userEmail: email}

const result = await MyBookmarkCollection.find(query).toArray()

res.send(result)

})




// instractorCollection===========>>>>>>

app.get('/instractorclass', async (req, res) => {
  const result = await insClassCollection.find().toArray()
  res.send(result)
})











    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   //  await client.close();
  }
}
run().catch(console.dir);








//mongo End//============>>>
app.get('/', (req, res) => {
   res.send('hello');
});

app.listen(port, () => {
   console.log(`Server is running on port ${port}`);
});


