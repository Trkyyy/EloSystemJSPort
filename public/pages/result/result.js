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
