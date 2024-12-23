const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;


//Middleware
app.use(cors());
app.use(express.json());


app.get('/', (req, res) =>{
    res.send('Car hire for any kind of trip')
})

app.listen(port, ()=>{
    console.log(`Car rent added at: ${port}`)
})