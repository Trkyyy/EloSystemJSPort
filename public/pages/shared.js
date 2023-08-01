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

// Call API to update player 
async function updatePlayerElo(playerName, playerElo){
    try{
      const res = await fetch("/api/updatePlayerElo?playerName=" + playerName + "&playerElo=" + playerElo, {
        method: "PUT",
      });
      console.log('Updated Elo of ' + playerName + ' to ' + playerElo);
    } catch(error){
      console.error('Error calling the API:', error);
    }
}

// Calculate average elo of set of 4 players
async function calculateAverageElo(players){
    return (players.reduce((sum, player) => sum + player.PlayerElo, 0))/4;
}

// Calculate expected outcome of two teams.
function calculateExpectedOutcome(teams, t){
  return 1 / (1 + 10^((teams[1-t].teamRating - teams[t].teamRating) / 400));
}

// Draw equation

function drawerEquation(expectedOutcome, playerElo, otherTeamRating){
    return kfac * (0.5 - expectedOutcome) * (1/(1 + 10^(otherTeamRating - playerElo)/400));
}

function loserEquation(expectedOutcome, playerElo, winningTeamRating){
    return (-1 * kfac) * (1 - expectedOutcome) * (1/(1+10^(playerElo - winningTeamRating)/400));
}

function winnerEquation(expectedOutcome, playerElo, losingTeamRating){
    return kfac * (1 - expectedOutcome) * (1 - 1/(1+10^(playerElo - losingTeamRating)/400));
}