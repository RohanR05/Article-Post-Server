const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 222;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fxlcgfl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const articlesCollections = client
      .db("assignment-11")
      .collection("articles");

    app.get("/articles", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }

      const cursor = articlesCollections.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/articles", async (req, res) => {
      const newArticle = req.body;
      console.log(newArticle);
      const result = await articlesCollections.insertOne(newArticle);
      res.send(result);
    });

    app.get("/articles/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await articlesCollections.findOne(query);
      res.send(result);
    });

    app.put("/articles/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const user = req.body;

      const updateArticle = {
        $set: {
          name: user.name,
          email: user.email,
        },
      };
      const options = { upsert: true };
      console.log(user);
      const result = await articlesCollections.updateOne(
        filter,
        updateArticle,
        options
      );
      res.send(result);
    });

    app.delete("/articles/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await articlesCollections.deleteOne(query);
      res.send(result);
    });

    // app.get("/aritclesByEmail", async (req, res) => {
    //   const email = req.query.email;
    //   const query = { email: email };
    //   const result = await articlesCollections.find(query).toArray();
    //   res.send(result);
    // });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
  res.send("assignment-11");
});

app.listen(port, () => {
  console.log(`assignment-11 is running on port ${port}`);
});
