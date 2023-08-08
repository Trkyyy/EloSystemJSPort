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

/* 
---------------------------- eOutcome Revision -  02/08/2023 ---------------------------------------
Expected outcome is causing issues, the current equation is:
      1 / (1 + 10^((teams[1-t].teamRating - teams[t].teamRating) / 400));

When the teams are very close, which they often are (whole point of the system),
then we end up with numbers very close to 0 or 1. 

I will try the following in its place:
       1 / (1 + e^(-c * Team Rating Difference))

c is a positive value, the higher is value the more sensitive the adjustment, 
I will try 0.5 initially

The above is also no good, I am going to try that of the original system:
      1 / (1 + Math.Pow(10, (-(team1 - team2) / 600)));

All of the above suck big time. I believe my use of the return value from expected outcome
was incorrect, I have adjusted it and it seems to be performing better now.

I would like wins to mean more for someone of a lower elo 
and loses to hurt more for someone of higher

Input teams array
Calculates the elo difference and maps it to a range between 0 and the max (set to 400)
We use this mapped value instead of the team difference in conjunction with our original equation:
      1 / (1 + 10^((mappedDifference) / 400));

Using this map gives better results as it means that expected outcome lies closer 
to 0.5 (as it should)

*/

/*
------------- the "i've been clawing my eyes out over nothing" revision -  02/08/2023 -------------
Turns out 10^() just sucks, using Math.pow(10, x) works far better. Expected outcome is now working
as I have expected it too, yipee

I have adjusted the equation to devide by 200 instead of 400, a difference of 100 in this case 
gives one team a 0.75 chance of winning 
*/

// K-factor
const kfac = 32 ;
// Initial Elo
const initElo = 1500;

const c = 0.5;

// Call API to update player 
async function updatePlayerElo(playerName, playerElo, code){
  try{
    const res = await fetch("/api/updatePlayerElo?playerName=" + playerName + "&playerElo=" + playerElo + "&code=" + code, {
      method: "PUT",
    });
    console.log('Updated Elo of ' + playerName + ' to ' + playerElo);
  } catch(error){
    console.error('Error calling the API:', error);
  }
}

// Calculate average elo of set of 4 players
function calculateAverageElo(players){
  var totalElo = 0;
  players.forEach(player => {
    totalElo = parseFloat(totalElo) + parseFloat(player.PlayerElo);
  });
  var averageElo = parseFloat(totalElo)/4;
  return averageElo;
}

// Calculate expected outcome of two teams.
function calculateExpectedOutcome(teams){

  // Calculate the absolute Elo difference between the teams
  const eloDifference = Math.abs(teams[0].teamRating - teams[1].teamRating);

  // Calculate the expected outcome for Team A
  const expectedOutcomeTeamA = 1 / (1 + Math.pow(10, eloDifference / 200));

  return expectedOutcomeTeamA;
}

// Draw equation

function drawerEquation(expectedOutcome, playerElo, otherTeamRating){
    return kfac * (0.5 - expectedOutcome);
}

function loserEquation(expectedOutcome, playerElo, winningTeamRating){
    //If player elo is over 1700, kfac is doubled, if under 1300 it is halved
    return (-1 * (playerElo > 1700 ? kfac * 2 : (playerElo < 1300 ? kfac * 0.5 : kfac))) * (1 - (1-expectedOutcome))
}

function winnerEquation(expectedOutcome, playerElo, losingTeamRating){
  //If player elo is over 1700, kfac is halved, if under 1300 - double it
  return (playerElo > 1700 ? kfac * 0.5 : (playerElo < 1300 ? kfac * 2 : kfac)) * (1 - expectedOutcome) 
}

// Function to adjust kfac to reduce the K-factor the further you get from 1500
// 1400-1600 kfac = full
// 1200-1400 and 1600-1800 kfac = 75%
// <1200 or >1800 kfac = 50%
function adjustKfac(playerElo){
  var updatedKfac;
  if((playerElo >= 1200 && playerElo < 1400) || (playerElo >= 1600 && playerElo < 1800)){
    updatedKfac = kfac * 0.75;
  }else if(playerElo < 1200 || playerElo > 1800){
    updatedKfac = kfac * 0.5;
  }else{
    updatedKfac = kfac;
  }
  return updatedKfac;
}