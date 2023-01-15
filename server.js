const express = require('express')
const bodyParser = require('body-parser');
const cors = require("cors");
require("dotenv").config();
const randomString = require("randomized-string");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
app.use(cors())
var port = process.env.PORT || 8000;
app.use(express.static(__dirname));


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://admin:${process.env.MONGODB_PASSWORD}@cluster0.xbvn4o3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

// The database to use
const dbName = "ConeysLost";

app.post('/admin', async (req, res) => {

  const bearer = req.headers.authorization;
  const [, token] = bearer && bearer.split(" ");
  const payload = token && jwt.verify(token, process.env.SECRET_KEY);

  if (!!payload) {
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
  } else {
    res.status(401).json({ message: "Unauthorized. Access is denied due to invalid credentials." })
  }
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // const isValid = bcrypt.compareSync(password, )
  if (username == process.env.ADMIN_USERNAME &&
    password == process.env.ADMIN_SECRET) {
    const payload = {
      sub: process.env.ADMIN_ID,
      iat: new Date().getTime()
    }

    const token = jwt.sign(payload, process.env.SECRET_KEY);
    res.status(200).json({ token })
  } else {
    res.status(400).json({ message: "Wrong credentials" })
  }

})

app.post('/claim', async (req, res) => {
  const claimToken = randomString.generate({
    range: 'abc123',
    length: 8
  })
  res.status(200).send({ claimToken });

  // could create an admin dashboard and add post item data + token
  // to list of claimed items for admins to view
})

app.get('/home', async (req, res) => {
  console.log("getting public items")
  try {
    await client.connect();
    console.log("home get, Connected correctly to server");
    const db = client.db(dbName);
    const col = db.collection("items");
    // Get all documents
    await col.find({}).toArray(function (err, result) {
      if (err) throw err;
      res.status(200).send(result);
    })

  } catch (err) {
    console.log(err.stack);
  }

  finally {
    // await client.close();
  }
})

app.get('/', (req, res) => {
  res.status(200).send("This is ConeysLostIsLandWebServer")
})


app.delete('/remove', async (req, res) => {

  const bearer = req.headers.authorization;
  const [, token] = bearer && bearer.split(" ");
  const payload = token && jwt.verify(token, process.env.SECRET_KEY);

  if (!!payload) {
    const { image, location_lost, name, description } = req.body;
    if (name && location_lost && description && image) {

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
  } else {
    res.status(401).json({ message: "Unauthorized. Access is denied due to invalid credentials." })
  }

})



// app.put('/edit', async (req, res) => {
//     console.log('editing car details')
// })

app.listen(port, () => {
  console.log(`server started. listening on ${port}`)
})
