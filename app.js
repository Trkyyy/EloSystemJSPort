const express = require("express");
const axios = require("axios");
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017"; // Replace with your MongoDB URI
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Instantiate db instance
const db = client.db("eloSystem");

// Local hosting
const app = express();
const PORT = 3000; // You can use any port number you prefer

app.use(express.static("public"));

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: "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",
});

// ---------------------------------- PLAYER API METHODS --------------------------------------

// Get specific player and return - ?playername=
app.get("/api/getSpecificPlayerStats", async (req, res) => {
  try {
    const playerName = req.query.playerName
    // Get playerStats collection
    const collection = db.collection("Players");
    // Return player stats as JSON object,
    // particular player can be found with Data.find(item => item.PlayerName === 'player name')
    const data = await collection.find({}).toArray();
    //Send response
    res.json(data.find(item => item.PlayerName === playerName));
  } catch (error) {
    console.error("Error when retrieving Player table: " + error);
  }
});

// Get all player stats and return
app.get("/api/getPlayerStats", async (req, res) => {
  try {
    // Get playerStats collection
    const collection = db.collection("Players");
    // Return player stats as JSON object,
    // particular player can be found with Data.find(item => item.PlayerName === 'player name')
    const data = await collection.find({}).toArray();
    //Send response
    res.json(data);
  } catch (error) {
    console.error("Error when retrieving Player table: " + error);
  }
});

// Update PlayerElo for a specific player
app.put("/api/updatePlayerElo", async (req, res) => {
  try {
    const playerName = req.query.playerName;
    const playerElo = req.query.playerElo; 

    // Get playerStats collection
    const collection = db.collection("Players");

    // Find the player with the given playerName and update the PlayerElo field
    const result = await collection.updateOne(
      { PlayerName: playerName },
      { $set: { PlayerElo: playerElo } }
    );

    if (result.modifiedCount === 1) {
      // If the player was found and the PlayerElo field was updated successfully
      res.json({ success: true, message: "PlayerElo updated successfully." });
    } else {
      // If the player with the given name was not found
      res.json({ success: false, message: "Player not found." });
    }
  } catch (error) {
    console.error("Error when updating PlayerElo: " + error);
    res.json({ success: false, message: "Error when updating PlayerElo." });
  }
});

// Reset all player stats


// Get all player stats and return
app.get("/api/resetPlayerStats", async (req, res) => {
  try {
    // Get playerStats collection
    const playerCollection = db.collection("Player");

    // Update the "PlayerElo" field for all documents in the "Player" collection
    const updateResult = await playerCollection.updateMany({}, { $set: { PlayerElo: 1500 } });
    // Log modified count
    const totalObj = playerCollection.countDocuments();
    console.log(`${updateResult.modifiedCount}/${totalObj} players updated successfully.`);
    //Send response
    res.json(data);
  } catch (error) {
    console.error("Error when retrieving Player table: " + error);
  }
});

// ------------------------------------ MAPS API Methods ---------------------------------------

// Get all maps and return
app.get("/api/getMaps", async (req, res) => {
  try {
    // console.log("Retreiving all Maps from collection");
    // Get maps collection
    const collection = db.collection("Maps");
    // console.log("Got maps colleciton from DB");
    // Return data as JSON object,
    // particular object can be found with Data.find(item => item.MapName === 'map name')
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (error) {
    console.error("Error when retrieving Maps table: " + error);
  }
});

// ----------------------------------- MATCHES API METHODS -------------------------------------

// Get all matches and return
app.get("/api/getMatches", async (req, res) => {
  try {
    // Get matches collection
    const collection = db.collection("Match");
    // Return data as JSON object,
    // particular player can be found with playerData.find(item => item.MapName === 'player name')
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (error) {
    console.error("Error when retrieving Maps table: " + error);
  }
});


// --------------------------------- MongoDB things ----------------------------------------------

//Mongo db connection
client.connect((err) => {
  if (err) {
    console.error("Error connecting to MongoDB:", err);
  } else {
    console.log("Connected to MongoDB successfully!");
    // Perform database operations here
  }
});

// Closing the db client - Make a function for this
// client.close((err) => {
//     if (err) {
//       console.error('Error closing MongoDB connection:', err);
//     } else {
//       console.log('MongoDB connection closed successfully!');
//     }
//   });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//
