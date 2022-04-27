const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

//MiddleWares
app.use(cors());
app.use(express.json());

//MongoDB Info
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qcpvv.mongodb.net?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
//Parent function
async function run() {
  try {
    //DB connection
    await client.connect();
    const usersColl = client.db("UsersData").collection("UsersCollection");

    // Create Users Data
    app.post("/adduser", async (req, res) => {
      const user = req.body;
      await usersColl.insertOne(user);
      res.send(user);
    });
    //Read Users data
    app.get("/", async (req, res) => {
      const query = {};
      const cursor = usersColl.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });
    //Update Users data
    app.put("/:id", async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedData = {
        $set: {
          name: updatedUser.uName,
          email: updatedUser.uEmail,
          description: updatedUser.uDescription,
        },
      };
      await usersColl.updateOne(filter, updatedData, options);
      res.send(updatedData.$set);
    });
    //Delete user
    app.delete("/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersColl.deleteOne(query);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

//Listen to the port
app.listen(port, () => console.log("Listning to port", port));
