
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

    //car booking
    app.get('/cars-booking', async (req, res) => {
      const cursor = bookingCarCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Add a car
    app.post('/cars', async (req, res) => {
      const newCar = req.body;
      const result = await carsCollection.insertOne(newCar);
      res.send(result);
    });



    // Update
    app.put('/cars/:id', async(req, res) =>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true}
      const updateCars = req.body;
      const cars = {
        $set:{
          model: updateCars.model,
          dailyRentalPrice: updateCars.dailyRentalPrice,
          availability: updateCars.availability,
          registrationNumber: updateCars.registrationNumber,
          features: updateCars.features,
          description: updateCars.description,
          images: updateCars.images,
          additionalInfo: updateCars.additionalInfo,
        }
      }
      const result = await carsCollection.updateOne(filter, cars, options);
      res.send(result)
    })


    // delete
    app.delete('/cars/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await carsCollection.deleteOne(query)
      res.send(result)
    })


    // delete 
    app.delete('/cars-booking/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await bookingCarCollection.deleteOne(query)
      res.send(result)
    })


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
      // //count
      const id = booking._id;
      const query = {_id: new ObjectId(id)}
      const book = await bookingCarCollection.findOne(query)
      let newCount = 0;
      if(book.bookingCount){
        newCount = book.bookingCount + 1;
      }
      else{
        newCount = 1;
      }

      //update
      const filter = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: {
          bookingCount: newCount
        }
      }
      const updateResult = await bookingCarCollection.updateOne(filter, updatedDoc)
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
