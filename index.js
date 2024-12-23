// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// const app = express();
// const port = process.env.PORT || 5000;
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// //Middleware
// app.use(cors());
// app.use(express.json());




// const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y15rh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");




//     //jobs related api
//     const carsCollection = client.db('carRent').collection('cars')
//     const bookingCarCollection = client.db('carRent').collection('cars-booking')

//     app.get('/cars', async(req, res) => {
//       const cursor = carsCollection.find();
//       const result = await cursor.toArray();
//       res.send(result);
//     })



//     //add car
//     app.post('/cars', async(req, res)=>{
//       const newCar = req.body;
//       const result = await carsCollection.insertOne(newCar)
//       res.send(result)
//     })


//     app.post('/cars-booking', async(req, res)=>{
//       const booking = req.body;
//       const result = await bookingCarCollection.insertOne(booking)
//       res.send(result)
//     })


//     //car details
//     app.get('/cars/:id', async(req, res) =>{
//       const id = req.params.id;
//       const query = {_id: new ObjectId(id)}
//       const result = await carsCollection.findOne(query)
//       res.send(result);
//     })




//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);




// app.get('/', (req, res) =>{
//     res.send('Car hire for any kind of trip')
// })

// app.listen(port, ()=>{
//     console.log(`Car rent added at: ${port}`)
// })




























const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y15rh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Database Collections
    const carsCollection = client.db('carRent').collection('cars');
    const bookingCarCollection = client.db('carRent').collection('cars-booking');

    // Get all cars
    app.get('/cars', async (req, res) => {
      const cursor = carsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Add a car
    app.post('/cars', async (req, res) => {
      const newCar = req.body;
      const result = await carsCollection.insertOne(newCar);
      res.send(result);
    });



    // Get car details by ID
    app.get('/cars/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carsCollection.findOne(query);
      res.send(result);
    });

    // Book a car
    app.post('/cars-booking', async (req, res) => {
      const booking = req.body;
      const result = await bookingCarCollection.insertOne(booking);
      res.send(result);
    });    

  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}

run().catch(console.dir);

// Default route
app.get('/', (req, res) => {
  res.send('Car hire for any kind of trip');
});

// Start the server
app.listen(port, () => {
  console.log(`Car rent app running on port: ${port}`);
});
