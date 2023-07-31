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

/*
---------------------------- Begining revision -  31/07/2023 ---------------------------------------
Made the decision to redesign the entire system from the ground up. 

In this new system we don't take the severity of a win/loss into account
This will keep the system straightforward
If this proves to be ineffective or unfair then it can be readded, but for now I think this is best.

Initial elo will now be 1500. Due to the sparatic nature of our play I have decided on a K-factor
of 32 which should lead to a high level of volatility, though this can be adjusted easily.
On the topic of volaitility, I am also removing our concept of time based volatitity as it is no
longer fit for purpose given the infrequency of our play.

A teams expected outcome is calculated with 1 / (1 + 10^((Team 1 Rating - Team 2 Rating) / 400))

A winning players elo change is calculated with:
    K * (1 - expectedOutcome) * (1 - 1/(1+10^(playerElo - enemeyTeamElo)/400))

A losing players elo change is calculated with:
    -K * (1 - expectedOutcome) * (1/(1+10^(playerElo - enemeyTeamElo)/400))

A drawing players elo change is calculated with:
    K * (0.5 - expectedOutcome) * (1 + 1/(1+10^(enemeyTeamElo - playerElo)/400))


The above are a first draft of the revision, changes can/will be made.
*/

// K-factor
const kfac = 32 ;
// Initial Elo
const initElo = 1500;

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
    for(let t = 0; t < 2; t++){
        // Get t+1 checkboxes (1 and 2)
        const checkboxes = document.querySelectorAll(
            `input[name="team${t+1}Checkbox"]`
        );    
        
        // Check if each checkbox is checked, if so get player from db and add to team players array 
        checkboxes.forEach(async checkbox => {
            if(checkbox.checked){
                const res = await fetch("api/getSpecificPlayer?playerName=" + checkbox.value);
                teams[t].players.push(res.json());
            }
        });
    }

    // Calculate teamRating and expectedOutcome
    for(let t = 0; t < 2; t++){
        // Team rating
        teams[t].teamRating = calculateAverageElo(teams[t].players);
    }
    // Split them up as team rating is required on the below
    for(let t = 0; t < 2; t++){
        // Expected outcome
        teams[t].expectedOutcome = 1 / (1 + 10^((teams[1-t].teamRating - teams[t].teamRating) / 400));
    }
}

async function calculateAverageElo(players){
    return (players.reduce((sum, player) => sum + player.PlayerElo, 0))/4;
}

// Function to calculate and apply (to the updatedTeams object) the elo changes of
// each player in the winning team
function calculateAndApplyWinnerEloChange(teamId){
  // Get teams, makes referecning later easier
  winningTeam = teams[teamId];
  losingTeam = teams[1 - teamId];

  // Calculation
  winningTeam.players.forEach(player => {
    const eChange = kfac * (1 - winningTeam.expectedOutcome) * (1 - 1/(1+10^(player.playerElo - losingTeam.teamRating)/400));
    player.PlayerElo = player.PlayerElo + eChange;
    updatedTeams[teamId].players.push(player);
  });

  // Calculate updated teams average elo, incase we want to use it at some point
  updatedTeams[teamId].teamRating = calculateAverageElo( updatedTeams[teamId].players);
}

// Function to calculate and apply (to the updatedTeams object) the elo changes of
// each player in the losing team
function calculateAndApplyLoserEloChange(teamId){
  // Get teams, makes referecning later easier
  losingTeam = teams[teamId];
  winningTeam = teams[1 - teamId];

  // Calculation
  losingTeam.players.forEach(player => {
    const eChange = (-1 * kfac) * (1 - losingTeam.expectedOutcome) * (1/(1+10^(player.playerElo - winningTeam.teamRating)/400));
    player.PlayerElo = player.PlayerElo + eChange;
    updatedTeams[teamId].players.push(player);
  });

  // Calculate updated teams average elo, incase we want to use it at some point
  updatedTeams[teamId].teamRating = calculateAverageElo( updatedTeams[teamId].players);
}

// Function to calculate and apply (to the updatedTeams object) the elo changes of
// each player in a drawing team
function calculateAndApplyDrawerEloChange(teamId){
  // Get teams, makes referecning later easier
  teamToUpdate = teams[teamId];
  otherTeam = teams[1 - teamId];

  // Calculation
  teamToUpdate.players.forEach(player => {
    const eChange = kfac * (0.5 - teamToUpdate.expectedOutcome) * (1/(1 + 10^( otherTeam.teamRating -player.playerElo)/400));
    player.PlayerElo = player.PlayerElo + eChange;
    updatedTeams[teamId].players.push(player);
  });

  // Calculate updated teams average elo, incase we want to use it at some point
  updatedTeams[teamId].teamRating = calculateAverageElo( updatedTeams[teamId].players);
}

// Function to gather result and orchestrate logic to update player elos and log match
function handleResult(){

}


// Submit button
const submitBtn = document.getElementById("submitBtn");
submitBtn.addEventListener("click", (event) => {

});