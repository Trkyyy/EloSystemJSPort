// highlightedMap is declared and set in maps.js

const team1Drop = document.getElementById("team1Wins");
const team2Drop = document.getElementById("team2Wins");
const draws = document.getElementById("draws");

team1Drop.addEventListener("change", (event) => {
  updateDropdown(team2Drop, team1Drop.value);
  updateDraws();
});

team2Drop.addEventListener("change", (event) => {
  updateDropdown(team1Drop, team2Drop.value);
  updateDraws();
});

// Function to update drop down to have map length - other dropdown value
function updateDropdown(drop, changeDropValue) {
  // Remove all options after the first one
  // If less options present than needed, add back, else remove excess
  if (highlightedMap.Maps - changeDropValue > drop.options.length - 1) {
    // Add a number of options equal to the integer var
    for (
      let i = drop.options.length;
      i <= highlightedMap.Maps - changeDropValue;
      i++
    ) {
      const option = document.createElement("option");
      option.text = i.toString();
      option.value = i.toString();
      drop.add(option);
    }
  } else {
    while (drop.options.length - 1 > highlightedMap.Maps - changeDropValue) {
      drop.remove(drop.options.length - 1);
    }
  }
}

function updateDraws() {
  if ((team1Drop.value.trim() != "" && team2Drop.value.trim() != "") || highlightedMap.Maps - team1Drop.value == 0 || highlightedMap.Maps - team2Drop.value == 0) {
    draws.options[0].text = highlightedMap.Maps - team1Drop.value - team2Drop.value;
  } else {
    draws.options[0].text = "Draws";
  }
}

// Submission - Migration time 
// So it begins...


/* these will be like
{
    players: [{player object}],
    teamRating: averagePlayerElo
    expectedOutcome: 1 / (1 + 10^((Team 1 Rating - Team 2 Rating) / 400))
}
*/
const teams = [
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
// Second array of objects to track any changes
const updatedTeams = [
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


//Function to set teams
async function setTeams(){
  // Get both teams via text of checked boxes
  teams[0].players = [];
  teams[1].players = [];
  const promises = [];
  for(let t = 0; t < 2; t++){
    // Get t+1 checkboxes (1 and 2)
    const checkboxes = document.querySelectorAll(
        `input[name="team${t+1}Checkbox"]`
    );    
    
    // Check if each checkbox is checked, if so get player from db and add to team players array 
    for (let i = 0; i < checkboxes.length; i++) {
      const checkbox = checkboxes[i];
      if (checkbox.checked) {
        if(teams[t].players.find(item => item.PlayerName === checkbox.value) === undefined){
          const res = await fetch(
            "/api/getSpecificPlayerStats?playerName=" + checkbox.value
          );
          const data = await res.json();
          teams[t].players.push(data);
        }
      }
    }
  }
  

  // Calculate teamRating and expectedOutcome
  for(let t = 0; t < 2; t++){
      // Team rating
      teams[t].teamRating = calculateAverageElo(teams[t].players);
  }
  // Split them up as team rating is required on the below
  for(let t = 0; t < 2; t++){
      // Expected outcome
      var expectedOutcome = calculateExpectedOutcome(teams);
      if(t == 0){
          teams[t].expectedOutcome = expectedOutcome
      }else{
          teams[t].expectedOutcome = 1 - expectedOutcome
      }   
  }
}



// Function to calculate and apply (to the updatedTeams object) the elo changes of
// each player in the winning team
function calculateAndApplyWinnerEloChange(teamId){
  // Get teams, makes referecning later easier
  var winningTeam = teams[teamId];
  var losingTeam = teams[1 - teamId];

  // Calculation
  winningTeam.players.forEach(player => {
    const eChange = winnerEquation(winningTeam.expectedOutcome, player.PlayerElo, losingTeam.teamRating);
    player.eloChange = eChange;
    player.PlayerElo = parseFloat(player.PlayerElo) + parseFloat(eChange);
    updatedTeams[teamId].players.push(player);
  });

  // Calculate updated teams average elo, incase we want to use it at some point
  updatedTeams[teamId].teamRating = calculateAverageElo( updatedTeams[teamId].players);
}

// Function to calculate and apply (to the updatedTeams object) the elo changes of
// each player in the losing team
function calculateAndApplyLoserEloChange(teamId){
  // Get teams, makes referecning later easier
  var losingTeam = teams[teamId];
  var winningTeam = teams[1 - teamId];

  // Calculation
  losingTeam.players.forEach(player => {
    const eChange = loserEquation(losingTeam.expectedOutcome, player.PlayerElo, winningTeam.teamRating);
    player.eloChange = eChange;
    player.PlayerElo = parseFloat(player.PlayerElo) + parseFloat(eChange);
    updatedTeams[teamId].players.push(player);
  });

  // Calculate updated teams average elo, incase we want to use it at some point
  updatedTeams[teamId].teamRating = calculateAverageElo( updatedTeams[teamId].players);
}



// Function to calculate and apply (to the updatedTeams object) the elo changes of
// each player in both drawing teams
function calculateAndApplyDrawEloChange(){
  // Get teams, makes referecning later easier
  var team1 = teams[0];
  var team2 = teams[1];

  // Calculation
  team1.players.forEach(player => {
    const eChange = drawerEquation(team1.expectedOutcome, player.PlayerElo, team2.teamRating); 
    player.eloChange = eChange;
    player.PlayerElo = parseFloat(player.PlayerElo) + parseFloat(eChange);
    updatedTeams[0].players.push(player);
  });

  team2.players.forEach(player => {
    const eChange = drawerEquation(team2.expectedOutcome, player.PlayerElo, team1.teamRating);
    player.eloChange = eChange;
    player.PlayerElo = parseFloat(player.PlayerElo) + parseFloat(eChange);
    updatedTeams[1].players.push(player);
  });

  // Calculate updated teams average elo, incase we want to use it at some point
  updatedTeams[0].teamRating = calculateAverageElo( updatedTeams[0].players);
  updatedTeams[1].teamRating = calculateAverageElo( updatedTeams[1].players);
}



// Function to gather result and orchestrate logic to update player elos and log match
function handleResult(t1Wins, t2Wins){
  // If not draw, else draw
  if(t1Wins != t2Wins){
    // Determine winning and losing team
    const winningTeam = teams[(t1Wins - t2Wins > 0) ? 0 : 1];
    const losingTeam = teams[(t1Wins - t2Wins > 0) ? 1 : 0];
    // Reset players array
    updatedTeams[0].players = [];
    updatedTeams[1].players = [];

    //Calculate winning team elo changes
    calculateAndApplyWinnerEloChange(winningTeam.id);
    calculateAndApplyLoserEloChange(losingTeam.id);
    

  }else{
    calculateAndApplyDrawEloChange();
  }

  // Iterate over both teams players, apply change and display
  updatedTeams.forEach(team => {
    var table = document.getElementById("team" + (team.id + 1) + "Results")

    // Show results table
    table.style.display = "block";

    // Iterate over each player
    for(var t=0; t < 4; t++){
      var player = team.players[t];
      updatePlayerElo(player.PlayerName, player.PlayerElo);

      // Update results table
      // Get row
      var row = table.getElementsByTagName("tr")[t+1];
      var playerNameEl = row.getElementsByTagName("td")[0];
      var eloChangeEl = row.getElementsByTagName("td")[1];
      var finalEloEl = row.getElementsByTagName("td")[2];

      // Set player name
      playerNameEl.innerText = player.PlayerName;

      // Display old elo and elo change
      var eloChange = (player.eloChange > 0) ? (" + " +  Math.round(player.eloChange)) : (" - " +  Math.round(player.eloChange * -1));
      eloChangeEl.innerText = Math.round(parseFloat(player.PlayerElo) - parseFloat(player.eloChange)) + eloChange;
      finalEloEl.innerText = Math.round(player.PlayerElo);
    }
  })
}


// Submit button
const submitBtn = document.getElementById("submitBtn");
submitBtn.addEventListener("click", async (event) => {
  setTeams().then(response => handleResult(team1Drop.value, team2Drop.value));
});