const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://assignment-11-49577.web.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const logger = (req, res, next) => {
  console.log("inside the logger middleware");
  next();
};

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  console.log("cookie in the middleware", token);
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

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

    app.post("/jwt", async (req, res) => {
      const { email } = req.body;
      const userData = { email };
      const token = jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: true, //deplpy:true//
        sameSite: "none", //deplpy:"none"//
        maxAge: 3 * 24 * 60 * 60 * 1000,
      });
      res.send({ success: true });
    });

    app.get("/articles", verifyToken, logger, async (req, res) => {
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

    app.get("/articles/:id", verifyToken, logger, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await articlesCollections.findOne(query);
      res.send(result);
    });

    app.put("/articles/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedData = req.body;

      const updateArticle = {
        $set: {
          title: updatedData.title,
          content: updatedData.content,
          tags: updatedData.tags,
          category: updatedData.category,
          author_photo: updatedData.author_photo,
        },
      };

      const options = { upsert: false };

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
