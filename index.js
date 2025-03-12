// const express = require("express")
// const app = express()
// const port = process.env.PORT || 5000;

// const cros = require('cors')
// // middelware
// app.use(cros());
// app.use(express.json());

// app.get("/", (req, res) => {
//     res.send('Hello World!')
// })


// // mongodb configuration

// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = "mongodb+srv://AhmedHassan:Ahmed073433@cluster0.idlt4.mongodb.net/mern book?retryWrites=true&w=majority&appName=Cluster0";

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

//     // create a collection of documents
//     const bookCollections = client.db("BookInventory").collection("books");

//     // insert a book to the db: post method

//     app.post('/upload-book', async(req, res) => {
//         const data = req.body;
//         const result = await bookCollections.insertOne(data);
//         res.send(result);
//     })

//     // // get all books from database
//     // app.get("/all-books", async(req, res) => {
//     //     const books = bookCollections.find();
//     //     const result = await books.toArray();
//     //     res.send(result);
//     // })

//     // update a book data: patch or update method
//     app.patch('/update-book/:id', async(req, res) => {
//       const id = req.params.id;
//       // console.log(id);
//       const updateBookdata = req.body;
//       const filter = { _id: new ObjectId(id) };
//       const updateDoc = {
//         $set: {
//           ...updateBookdata,
//         },
//       }
//        const options = { upsert: true };
//       // update 
//       const result = await bookCollections.updateOne(filter, updateDoc, options);
//       res.send(result);

//     })

//     //delete a book data
//     app.delete('/book/:id', async(req, res) => {
//       const id = req.params.id;
//       const filter = { _id: new ObjectId(id) };
//       const result = await bookCollections.deleteOne(filter);
//       res.send(result);
//     })

//     // find by category
//     app.get("/all-books", async(req, res) => {
//         let query = {};
//         if(req.query?.category){
//           query = { category: req.query.category }
//         }
//         const result = await bookCollections.find(query).toArray();
//         res.send(result);

//   })

//  // to get single book data
// app.get("/book/:id", async (req, res) => {
//   const id = req.params.id; 
//   const filter = { _id: new ObjectId(id) };
//   const result = await bookCollections.findOne(filter);
//   res.send(result);
// });


//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);


// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
// })




const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = "mongodb+srv://AhmedHassan:Ahmed073433@cluster0.idlt4.mongodb.net/mern_book?retryWrites=true&w=majority&appName=Cluster0";
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
    console.log("✅ Successfully connected to MongoDB!");

    // Collection reference
    const bookCollections = client.db("mern_book").collection("books");

    // ✅ Home Route
    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    // ✅ Upload a book (POST)
    app.post("/upload-book", async (req, res) => {
      try {
        const data = req.body;
        const result = await bookCollections.insertOne(data);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to upload book", error });
      }
    });

    // ✅ Get all books (GET)
    app.get("/all-books", async (req, res) => {
      try {
        const query = req.query.category ? { category: req.query.category } : {};
        const result = await bookCollections.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch books", error });
      }
    });

    // ✅ Get single book by ID (GET)
    app.get("/book/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await bookCollections.findOne(filter);
        if (!result) {
          return res.status(404).send({ message: "Book not found" });
        }
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error fetching book", error });
      }
    });

    // ✅ Update book (PATCH)
    app.patch("/update-book/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateBookdata = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = { $set: { ...updateBookdata } };
        const options = { upsert: true };

        const result = await bookCollections.updateOne(filter, updateDoc, options);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to update book", error });
      }
    });

    // ✅ Delete book (DELETE)
    app.delete("/book/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await bookCollections.deleteOne(filter);
        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Book not found" });
        }
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to delete book", error });
      }
    });

    // ✅ Graceful shutdown
    process.on("SIGINT", async () => {
      await client.close();
      console.log("❌ MongoDB connection closed.");
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Failed", error);
  }
}
run();

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
