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
        players: [],
        teamRating: 1500,
        expectedOutcome: 0.5
    },
    {
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
        team[t].teamRating = calculateAverageElo(team[t].players);

        // Expected outcome
        team[t].expectedOutcome = 1 / (1 + 10^((team[1-t] - team[t]) / 400))
    }


}

function calculateAverageElo(players){
    return (players.reduce((sum, player) => sum + player.PlayerElo, 0))/4;
}




// Submit button
const submitBtn = document.getElementById("submitBtn");
submitBtn.addEventListener("click", (event) => {

});