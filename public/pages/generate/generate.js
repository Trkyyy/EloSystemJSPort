// Instaniate consts
const checkedPlayerNames = [];
var allPlayers = [];

// Call needed functions when page loads
document.addEventListener("DOMContentLoaded", async function () {
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
  try {
    // Call API
    const response = await fetch("/api/getPlayerStats");
    // Convert response to JSON object
    const data = await response.json();
    //Log response for debuging - Working well so commenting log
    // console.debug("Get all player stats API response: " + JSON.stringify(data));
    allPlayers = data;
    //Call method to add checkboxes
    appendCheckboxes(data);
  } catch (error) {
    console.error("Error while fetching player stats \n" + error);
  }
}

// Function to append checkboxes to the 'checkboxes' element
function appendCheckboxes(jsonData) {
  const checkboxesElement = document.getElementById("checkboxes");

  jsonData.forEach((player) => {
    const playerName = player.PlayerName;
    const checkbox = createCheckbox(playerName);
    checkbox
      .querySelector('input[type="checkbox"]')
      .addEventListener("click", handleCheckboxClick);
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
document.addEventListener("DOMContentLoaded", async function () {
  // Get a reference to the button element
  const genTeamsButton = document.getElementById("generateTeams");

  // Add a click event listener to the button
  genTeamsButton.addEventListener("click", function () {
    //Ensure 8 selected
    if (checkedPlayerNames.length == 8) {
      // Calculate best teams
      let closestEloTeams = findClosestEloTeams();
      // Log closest teams - Clogging logs so disabled
      // console.log("Closest three teams: " + JSON.stringify(closestEloTeams));
      // Call function to insert data to tables
      addTeamsToUI(closestEloTeams);
    } else {
      alert("Please select 8 players.");
    }
  });
});

// Define team class, helps with readability if nothing else

class Team {
  constructor(playerA, playerB, playerC, playerD) {
    this.players = [
      getPlayerObjectByName(playerA),
      getPlayerObjectByName(playerB),
      getPlayerObjectByName(playerC),
      getPlayerObjectByName(playerD),
    ];
  }

  // Checks if two teams have duplicate players or isnt unique
  sameTeam(otherTeam) {
    //This is terrible, but here we are - lots of trouble with bad teams
    if (
      this.findPlayerBool(otherTeam.players[0].PlayerName) &&
      this.findPlayerBool(otherTeam.players[1].PlayerName) &&
      this.findPlayerBool(otherTeam.players[2].PlayerName) &&
      this.findPlayerBool(otherTeam.players[3].PlayerName)
    ) {
      return true;
    } else {
      return false;
    }
  }

  uniqueTeams(otherTeam) {
    //This is terrible, but here we are - lots of trouble with bad teams
    if (
      this.findPlayerBool(otherTeam.players[0].PlayerName) ||
      this.findPlayerBool(otherTeam.players[1].PlayerName) ||
      this.findPlayerBool(otherTeam.players[2].PlayerName) ||
      this.findPlayerBool(otherTeam.players[3].PlayerName)
    ) {
      return true;
    } else {
      return false;
    }
  }

  // Calculate tean elo average
  calculateTeamEloAvg() {
    let sum = 0;
    let validPlayers = 0;

    for (const player of this.players) {
      if (player && player.PlayerElo !== undefined) {
        sum += player.PlayerElo;
        validPlayers++;
      }
    }

    return sum / validPlayers;
  }

  // Returns true if player in team
  findPlayer(player) {
    for (const obj of this.players) {
      if (obj.PlayerName === player) {
        return obj;
      }
    }
  }

  findPlayerBool(player) {
    for (const obj of this.players) {
      if (obj.PlayerName === player) {
        if (obj != null) {
          return true;
        } else {
          return false;
        }
      }
    }
  }
}

// Used for holding the Elo difference between two teams and the index of that team in the array
class EloDifferenceAndIndex {
  constructor(eloDiff, index) {
    this.eloDiff = eloDiff;
    this.index = index;
  }
}

function getPlayerObjectByName(playerName) {
  const player = allPlayers.find((player) => player.PlayerName === playerName);
  return player || null;
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

// This works - but needs logic to check that teamX, teamY and teamY, teamX combinations are the same
function findClosestEloTeams() {
  let allTeams = generateAllTeams(checkedPlayerNames);
  let closestTeams = [];
  let minEloDiff = Number.MAX_VALUE;

  for (let i = 0; i < allTeams.length; i++) {
    for (let j = 0; j < allTeams.length; j++) {
      let tA = allTeams[i];
      let tB = allTeams[j];

      if (!tA.uniqueTeams(tB)) {
        let eloDifference = Math.abs(
          tA.calculateTeamEloAvg() - tB.calculateTeamEloAvg()
        );
        //Ensure that oposite match doesnt exist
        // if(closestTeams.find(element => element == [tB,tA]) === undefined)
        // { This makes only 1 team be returned, but still needs fixed
        if (eloDifference < minEloDiff) {
          closestTeams = [[tA, tB]];
          minEloDiff = eloDifference;
        } else if (eloDifference === minEloDiff) {
          closestTeams.push([tA, tB]);
        }
        // }
      }
    }
  }

  return closestTeams.slice(0, Math.min(3, closestTeams.length));
}

/* Function to add team details to tables
[
    [{"players":["Aron","Adam","Aaron","JackS"]},{"players":["Bradley","Gorman","Mees","Scott"]}],
    [{"players":["Aron","Adam","Aaron","Bradley"]},{"players":["JackS","Gorman","Mees","Scott"]}],
    [{"players":["Aron","Adam","Aaron","Gorman"]},{"players":["JackS","Bradley","Mees","Scott"]}]
]
*/

// Function to set the text of an element by ID
function setTextById(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
}

function addTeamsToUI(teamsArray) {
  // Iterate over teamsArray
  for (let i = 0; i < teamsArray.length; i++) {
    const teamSet = teamsArray[i];
    // Iterate over each team (team1 and team2)
    for (let j = 0; j < 2; j++) {
      const team = teamSet[j];
      const players = team.players;

      // Iterate over each player and set the text inside corresponding elements
      for (let k = 0; k < 4; k++) {
        const nameElementId = `sort${i}team${j + 1}playerName${k + 1}`;
        const eloElementId = `sort${i}team${j + 1}playerElo${k + 1}`;
        setTextById(nameElementId, players[k].PlayerName);
        setTextById(eloElementId, players[k].PlayerElo);
      }

      // Set Average Elo
      let tempTeam = new Team(
        players[0].PlayerName,
        players[1].PlayerName,
        players[2].PlayerName,
        players[3].PlayerName
      );
      console.log(tempTeam);
      const elementId = `sort${i}team${j + 1}averageElo`;
      setTextById(elementId, tempTeam.calculateTeamEloAvg());
    }
  }
}
