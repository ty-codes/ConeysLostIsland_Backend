const express = require('express')
const bodyParser = require('body-parser');
const cors = require("cors")
// const bcrypt = require('bcrypt');


const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
app.use(cors())
var port = 8000;
app.use(express.static(__dirname));


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://admin:damilare123@cluster0.xbvn4o3.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);


// The database to use
const dbName = "ConeysLost";

app.post('/admin', async (req, res) => {
  // console.log(req.body, 'body')
  const { image, location, name, description } = req.body;
  if (name && location && description && image) {
    try {
      await client.connect();
      console.log("post admin, Connected correctly to server");
      const db = client.db(dbName);
      // Use the collection "people"
      const col = db.collection("items");
      // Construct a document                                                                                                                                                              
      let newDocument = {
        "name": name,
        "image": image,
        "description": description,
        "dateCreated": new Date(),
        "location_lost": location

      }
      // Insert a single document, wait for promise so we can read it back
      const p = await col.insertOne(newDocument);
      // Find one document
      // const myDoc = await col.findOne();
      // Print to the console
      // console.log(myDoc);
      res.status(200).send(p)
    } catch (err) {
      console.log(err.stack);
    }

    finally {
      // await client.close();
    }

  } else {
    res.status(400).send('Insufficient data!');
  }

})


app.get('/home', async (req, res) => {
  console.log("getting public items")
  try {
    await client.connect();
    console.log("home get, Connected correctly to server");
    const db = client.db(dbName);
    const col = db.collection("items");
    // Get all documents
    await col.find({}).toArray(function(err, result) {
      if(err) throw err;
      // console.log(result);
      res.status(200).send(result);
    })
    
  } catch (err) {
    console.log(err.stack);
  }

  finally {
    // await client.close();
  }
})

app.delete('/remove', async (req, res) => {
  const { image, location_lost, name, description  } = req.body;
  if (name && location_lost && description && image) {
    console.log('responsive')

    await client.connect();
    console.log(" delete, Connected correctly to server");
    
    try {
      const db = client.db(dbName);
      const col = db.collection("items");
      // Query for a movie that has title "Annie Hall"
      const query = {
        name,
        location_lost, description, image
      };
      // console.log("query",query);
      const result = await col.deleteOne(query);
      if (result.deletedCount === 1) {
        console.log("Successfully deleted one document.");
        res.status(200).send("Successfully deleted entry")
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
      }
    } finally {
      await client.close();
    }
  } else {
    res.status(400).send('Insufficient data!');
  }
})



// app.put('/edit', async (req, res) => {
//     console.log('editing car details')
//     console.log(req.body);
//     const {model, make, year, registration_number,
//        color, description, image, hash, createdAt, updatedAt} = req.body
//     try {
//         await Cars.upsert({
//           uniqueKey: registration_number,
//           model: model,
//           make: make,
//           year: year,
//           color: color,
//           description: description,
//           image: image,
//           registration_number: registration_number,
//           createdAt: createdAt,
//           updatedAt: updatedAt,
//           hash: bcrypt.hashSync(registration_number, make.length)
//         }).then(resp => {
//           console.log('updated', resp)
//         })
//     } catch(err) {
//       console.log('couldnt update db', err)
//     }
//     res.end()
// })

app.listen(port, () => {
  console.log(`server started. listening on ${port}`)
})
