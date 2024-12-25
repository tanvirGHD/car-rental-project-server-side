
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());


const verifyToken = (req, res, next) =>{
  const token = req.cookies?.token;
  
  if(!token){
    return res.status(401).send({message: 'unauthorized access'});
  }

  // verify the token 
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if(err){
      return res.status(401).send({message: 'unauthorized access'});
    }
    
    next();
  })
}



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


    //Auth related API
    app.post('/jwt', (req, res) =>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '5h'});

      res.cookie('token', token, {
        httpOnly: true,
        secure: false
      })
      .send({success: true})
    })


    app.post('/logout', (req, res)=>{
      res.clearCookie('token', {
        httpOnly: true,
        secure: false
      })
      .send({success: true})
    })



    // Get all cars
    app.get('/cars', verifyToken, async (req, res) => {
      const cursor = carsCollection.find();
      // console.log(req.cookies?.token);
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
