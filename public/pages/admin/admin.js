// Global vars
var allPlayers = [];


document.addEventListener("DOMContentLoaded", async function () {
    allPlayers = await getPlayers()
    createPlayerTable(allPlayers);
});

// Submit button
const rerunBtn = document.getElementById("rerunBtn");
rerunBtn.addEventListener("click", async (event) => {
    rerunAllGames();
});

// Function which will grab all previous matchs and rerun them with current system configuration
// Used mainly for testing changes to elo
async function rerunAllGames() {
    // Get all previous matches
    const matchesResponse = await fetch("/api/getMatches");
    const matches = await matchesResponse.json();
    
    // Reset all player elo to 1500
    resetPlayerStats();
    // Iterate over each match
    matches.forEach(match => {
        // Set teams for match
        let teams = [
            {
                id: 0,
                players: [],
                teamRating: 1500,
                expectedOutcome: 0.5
            },
            {
                id: 1,
                players: [],
                teamRating: 1500,
                expectedOutcome: 0.5
            }
        ];

        // Populate team 1
        match.team1.forEach(player => {
            teams[0].players.push(findPlayerLocal(player));
        });
        // Populate team 2
        match.team2.forEach(player => {
            teams[1].players.push(findPlayerLocal(player));
        });
        
        // Calculate teamRating and expectedOutcome
        for(let t = 0; t < 2; t++){
            // Team rating calculateAverageElo sits within shared.js
            teams[t].teamRating = calculateAverageElo(teams[t].players);
        }
        // Split them up as team rating is required on the below
        for(let t = 0; t < 2; t++){
            // Expected outcome - calculateExpectedOutcome sits within shared.js
            var expectedOutcome = calculateExpectedOutcome(teams);
            if(t == 0){
                teams[t].expectedOutcome = expectedOutcome
            }else{
                teams[t].expectedOutcome = 1 - expectedOutcome
            }
        }

        // 0 is draw, > 0 is team 1 win, and < 0 is team 2 win
        const matchResult = match.result[0] - match.result[1];

        //  Apply player changes
        if(matchResult != 0){
            // Set teams, better readability
            const winningTeam = teams[(matchResult > 0) ? 0 : 1];
            const losingTeam = teams[(matchResult > 0) ? 1 : 0];
            
            // Apply winning player elo changes to allPlayers
            winningTeam.players.forEach(player => {
                const eChange = winnerEquation(winningTeam.expectedOutcome, player.PlayerElo, losingTeam.teamRating);

                // Find player in all players and update
                const allPlayersReference = allPlayers.find(fPlayer => fPlayer.PlayerName === player.PlayerName);
                allPlayersReference.PlayerElo = parseFloat(allPlayersReference.PlayerElo) + parseFloat(eChange);
            });

            // Apply winning player elo changes to allPlayers
            losingTeam.players.forEach(player => {
                const eChange = loserEquation(losingTeam.expectedOutcome, player.PlayerElo, winningTeam.teamRating);

                // Find player in all players and update
                const allPlayersReference = allPlayers.find(fPlayer => fPlayer.PlayerName === player.PlayerName);
                allPlayersReference.PlayerElo = parseFloat(allPlayersReference.PlayerElo) + parseFloat(eChange);
            });
        }else {
            for(var t = 0; t < 2; t++){
                teams[t].players.forEach(player => {
                    const eChange = drawerEquation(teams[t].expectedOutcome, player.PlayerElo, teams[1-t].teamRating);

                    // Find player in all players and update
                    const allPlayersReference = allPlayers.find(fPlayer => fPlayer.PlayerName === player.PlayerName);
                    allPlayersReference.PlayerElo = parseFloat(allPlayersReference.PlayerElo) + parseFloat(eChange);
                });
            }
        }
    });

    allPlayers.forEach(player => {
        // This method sits within result.js
        updatePlayerElo(player.PlayerName, player.PlayerElo)
    });

    createPlayerTable(allPlayers);
}

async function resetPlayerStats() {
    try{
        allPlayers.forEach(player => {
            player.PlayerElo = 1500;
        })
        console.log("Reset player stats");
    }catch(error){
        console.log("Error reseting player stats: " + error)
    }
}

// player has one kv pair, .name
// Finds player in allPlayers file (has their elo)
function findPlayerLocal(player){
    return allPlayers.find(x => x.PlayerName === player.name);
}

/* Response example: 
[{
    "_id":"64b9827ce1190d6afe53548d",
    "idPlayer":1,
    "PlayerName":"Aron",
    "PlayerElo":1115
},
...etc
*/
async function getPlayers() {
  try {
    // Call API
    const response = await fetch("/api/getPlayerStats");
    // Convert response to JSON object
    const data = await response.json();
    //Log response for debuging - Working well so commenting log
    // console.debug("Get all player stats API response: " + JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Error while fetching player stats \n" + error);
  }
}


async function createPlayerTable(players) {
    // Sort players by elo
    players.sort(function (a, b) {
      return parseFloat(b.PlayerElo) - parseFloat(a.PlayerElo);
    });
  
    // Grab maps table
    const itemTable = document.getElementById("itemTable");
    itemTable.innerHTML = '';
  
    // Calculate the number of rows
    const numRows = Math.ceil(players.length / 6);
  
    // Loop through each row
    for (let i = 0; i < numRows; i++) {
      const row = itemTable.insertRow();
  
      // Loop through each column (6 columns)
      for (let j = 0; j < 6; j++) {
        const cell = row.insertCell();
  
        // Calculate the index of the current item in the data array
        const dataIndex = i * 6 + j;
  
        if (dataIndex < players.length) {
          const item = players[dataIndex];
  
          // Create table cell content (MapName and image)
          const playerName = item.PlayerName;
          const playerElo = item.PlayerElo;
  
          // Create table cell content (MapName and image)
          cell.innerHTML = `
                      <p>${playerName}</p>
                      <p>Elo: ${Math.round(playerElo)}</p>
                  `;
        }
      }
    }
  }



// ----------------------------------- Add New player ----------------------------------------------
// Get elements from the DOM
const inputStringElement = document.getElementById('inputString');
const logButton = document.getElementById('logButton');

// Add click event listener to the button
logButton.addEventListener('click', () => {
  // Get the entered string
  const enteredString = inputStringElement.value;
  //Remove any whitespace
  addPlayer(enteredString.replace(/\s/g,''))
});


async function addPlayer(playerName){
    try{
        const res = await fetch("/api/addPlayer?playerName=" + playerName, {
          method: "PUT",
        });

        allPlayers.push({
            PlayerName: playerName,
            PlayerElo: 1500
        });
        createPlayerTable(allPlayers);
        console.log('Added new player: ' + playerName);
        alert('Added new player: ' + playerName);
      } catch(error){
        console.error('Error calling the API:', error);
      }
}