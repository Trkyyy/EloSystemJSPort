// Instaniate consts
const checkedPlayerNames = [];

// Call needed functions when page loads
document.addEventListener("DOMContentLoaded", async function() {
    getPlayers();
});


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
    try{
        // Call API
        const response = await fetch('/api/getPlayerStats');
        // Convert response to JSON object
        const data = await response.json();
        //Log response for debuging
        console.debug("Get all player stats API response: " + JSON.stringify(data));
        //Call method to add checkboxes
        appendCheckboxes(data);
    }catch(error){
        console.error("Error while fetching player stats \n"+ error); 
    }
}

// Function to append checkboxes to the 'checkboxes' element
function appendCheckboxes(jsonData) {
    const checkboxesElement = document.getElementById("checkboxes");
  
    jsonData.forEach((player) => {
      const playerName = player.PlayerName;
      const checkbox = createCheckbox(playerName);
      checkbox.querySelector('input[type="checkbox"]').addEventListener('click', handleCheckboxClick);
      checkboxesElement.appendChild(checkbox);
    });
  }

// Function to create a Bootstrap-styled checkbox for a player
function createCheckbox(playerName) {
    const checkboxDiv = document.createElement("div");
    checkboxDiv.classList.add("form-check");
  
    const checkboxInput = document.createElement("input");
    checkboxInput.type = "checkbox";
    checkboxInput.classList.add("form-check-input");
  
    const checkboxLabel = document.createElement("label");
    checkboxLabel.classList.add("form-check-label");
    checkboxLabel.textContent = playerName;
  
    checkboxDiv.appendChild(checkboxInput);
    checkboxDiv.appendChild(checkboxLabel);
  
    return checkboxDiv;
}

// Function to handle checkbox click event
function handleCheckboxClick(event) {
    //Add player name to selected players array
    const playerName = event.target.nextSibling.textContent;
  
    if (event.target.checked) {
      // Add the playerName to the array if checked
      checkedPlayerNames.push(playerName);
    } else {
      // Remove the playerName from the array if unchecked
      const index = checkedPlayerNames.indexOf(playerName);
      if (index > -1) {
        checkedPlayerNames.splice(index, 1);
      }
    }
    // Ensure only 8 checkboxes can be selected, after others are greyed
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    let checkedCount = 0;
  
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checkedCount++;
      }
    });
  
    if (checkedCount >= 8) {
      checkboxes.forEach((checkbox) => {
        if (!checkbox.checked) {
          checkbox.disabled = true;
        }
      });
    } else {
      checkboxes.forEach((checkbox) => {
        checkbox.disabled = false;
      });
    }
}

// Team generation time

//Handle button click
//Call needed functions when page loads
document.addEventListener("DOMContentLoaded", async function() {
    // Get a reference to the button element
    const genTeamsButton = document.getElementById("generateTeams");
      
    // Add a click event listener to the button
    genTeamsButton.addEventListener("click", function() {
        //Ensure 8 selected
        if(checkedPlayerNames.length == 8){
            // Calculate best teams
            let closestEloTeams = findClosestEloTeams();
            // Log closest teams
            console.log("Closest two teams: " + JSON.stringify(closestEloTeams));
        }else
        {
            alert("Please select 8 players.");
        }
    });
});

// Define team class, helps with readability if nothing else

class Team {
    constructor(playerA, playerB, playerC, playerD) {
        this.players = [playerA, playerB, playerC, playerD];
    }

    // Checks if two teams have duplicate players or isnt unique
    sameTeam(otherTeam) {
        let thisPlayers = this.players;
        let otherPlayers = otherTeam.players;
        return (
            thisPlayers.includes(otherPlayers[0]) &&
            thisPlayers.includes(otherPlayers[1]) &&
            thisPlayers.includes(otherPlayers[2]) &&
            thisPlayers.includes(otherPlayers[3])
        );
    }

    // Calculate tean elo average
    calculateTeamEloAvg() {
        let sum = 0;
        for (const player of this.players) {
            sum += player.elo;
        }
        return sum / this.players.length;
    }

    // Returns true if player in team
    findPlayer(player) {
        return this.players.includes(player);
    }
}

// Used for holding the Elo difference between two teams and the index of that team in the array
class EloDifferenceAndIndex {
    constructor(eloDiff, index) {
        this.eloDiff = eloDiff;
        this.index = index;
    }
}

// Generates all possible teams
function generateAllTeams(playersInGameL) {
    let allTeams = [];

    for (let a = 0; a < 8; a++) {
        for (let b = a + 1; b < 8; b++) {
            for (let c = b + 1; c < 8; c++) {
                for (let d = c + 1; d < 8; d++) {
                    let testTeam = new Team(
                        playersInGameL[a],
                        playersInGameL[b],
                        playersInGameL[c],
                        playersInGameL[d]
                    );

                    let unique = true;
                    for (let i = 0; i < allTeams.length; i++) {
                        if (allTeams[i].sameTeam(testTeam)) {
                            unique = false;
                            break;
                        }
                    }

                    if (unique) {
                        allTeams.push(testTeam);
                    }
                }
            }
        }
    }

    return allTeams;
}

// 
function findClosestEloTeams() {
    let allTeams = generateAllTeams(checkedPlayerNames);
    let teamIndexes = [];
    let eloDiffAndIndex = [];

    for (let a = 0; a < allTeams.length; a++) {
        for (let b = 0; b < allTeams.length; b++) {
            let tA = allTeams[a];
            let tB = allTeams[b];
            // Ensure teams dont include duplicate players (maybe should be done earlier)
            let compute = true;
            compute = compute && !tB.findPlayer(tA.players[0]);
            compute = compute && !tB.findPlayer(tA.players[1]);
            compute = compute && !tB.findPlayer(tA.players[2]);
            compute = compute && !tB.findPlayer(tA.players[3]);
            
            if (compute) {
                let eloDifference = Math.abs(tA.calculateTeamEloAvg() - tB.calculateTeamEloAvg());
                let tempIndexArray = [a, b];
                teamIndexes.push(tempIndexArray);
                let tempDoubleArray = new EloDifferenceAndIndex(eloDifference, teamIndexes.length - 1);
                eloDiffAndIndex.push(tempDoubleArray);
            }
        }
    }

    eloDiffAndIndex.sort((x, y) => x.eloDiff - y.eloDiff);

    let closestTeams = [];

    for (let i = 0; i < Math.min(3, eloDiffAndIndex.length); i++) {
        let index = eloDiffAndIndex[i].index;
        let closestTeam1 = allTeams[teamIndexes[index][0]];
        let closestTeam2 = allTeams[teamIndexes[index][1]];
        closestTeams.push([closestTeam1, closestTeam2]);
    }

    return closestTeams;
}