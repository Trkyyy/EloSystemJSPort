// Track the number of players in each team
let team1Count = 0;
let team2Count = 0;

// Function to fetch player list from the API
async function fetchPlayerList() {
  try {
    const response = await fetch("/api/getPlayerStats");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching player list:", error);
    return [];
  }
}

// Function to create and render player list with checkboxes
function renderPlayerList(players) {
  const playerListTable = document.getElementById("playerListTable");
  const numRows = Math.ceil(players.length / 8);

  for (let i = 0; i < numRows; i++) {
    const row = playerListTable.insertRow();
    for (let j = 0; j < 8; j++) {
      row.insertCell();
    }
  }

  players.forEach((player, index) => {
    const rowIndex = Math.floor(index / 8);
    const cellIndex = index % 8;

    const row = playerListTable.rows[rowIndex];
    const cell = row.cells[cellIndex];
    const checkbox1 = createCheckbox(player.PlayerName, "1");
    const checkbox2 = createCheckbox(player.PlayerName, "2");

    cell.textContent = player.PlayerName;
    cell.appendChild(document.createElement("br"));
    cell.appendChild(createCheckboxLabel("Team 1", checkbox1));
    cell.appendChild(document.createElement("br"));
    cell.appendChild(createCheckboxLabel("Team 2", checkbox2));
  });
}

// Function to create a checkbox for a player
function createCheckbox(playerName, teamNumber) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.name = `team${teamNumber}Checkbox`;
  checkbox.value = playerName;

  checkbox.addEventListener("change", function () {
    handleCheckboxChange(checkbox, teamNumber);
  });

  return checkbox;
}

// Function to create a label for a checkbox
function createCheckboxLabel(labelText, checkbox) {
  const label = document.createElement("label");
  label.textContent = labelText;
  label.appendChild(checkbox);
  return label;
}

// Function to handle checkbox change event
function handleCheckboxChange(checkbox, teamNumber) {
  const playerName = checkbox.value;
  const oppositeTeamNumber = teamNumber === "1" ? "2" : "1";
  const oppositeTeamTable = document
    .getElementById(`team${oppositeTeamNumber}Table`)
    .getElementsByTagName("tbody")[0];

  if (checkbox.checked) {
    // Uncheck the checkbox in the opposite team if it was checked
    const oppositeCheckbox = document.querySelector(
      `input[value="${playerName}"][name="team${oppositeTeamNumber}Checkbox"]`
    );
    if (oppositeCheckbox && oppositeCheckbox.checked) {
      oppositeCheckbox.checked = false;
      removePlayerFromTeam(oppositeCheckbox.value, oppositeTeamNumber);
    }

    // Remove the player from the current team if they were present
    removePlayerFromTeam(playerName, teamNumber);

    // Add the player to the selected team table
    const teamTable = document
      .getElementById(`team${teamNumber}Table`)
      .getElementsByTagName("tbody")[0];
    const newRow = teamTable.insertRow(0);
    const cell = newRow.insertCell(0);
    cell.textContent = playerName;
    deleteRowWithEmptyCell(teamTable);

    // If 4 players selected, disable other checkboxes
    const rows = teamTable.getElementsByTagName("tr");
    const teamCheckboxes = document.querySelectorAll(
        `input[name="team${teamNumber}Checkbox"]`
    );
    var numPlayers = 0;
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
    
        for (let j = 0; j < cells.length; j++) {
          const cell = cells[j];
    
          if (cell.textContent.trim() != "") {
            // Delete the row
            numPlayers = numPlayers + 1;
          }
        }
      }

    if(rows.length > 0){
        teamCheckboxes.forEach(checkbox => {
            if(!checkbox.checked){
                if(numPlayers == 4){
                    checkbox.disabled = true;
                }else{
                    checkbox.disabled = false;
                }
            }
        });
    }
  } else {
    // If the checkbox was unchecked, remove the player from the team
    removePlayerFromTeam(playerName, teamNumber);
  }
}

// Function to remove a player from a team table
function removePlayerFromTeam(playerName, teamNumber) {
    //Enable all teamx checkboxes
    const teamCheckboxes = document.querySelectorAll(
        `input[name="team${teamNumber}Checkbox"]`
    );
    teamCheckboxes.forEach(checkbox => {
        checkbox.disabled = false;

    });

    const teamTable = document
    .getElementById(`team${teamNumber}Table`)
    .getElementsByTagName("tbody")[0];
  const teamRows = teamTable.getElementsByTagName("tr");
  for (let i = 0; i < teamRows.length; i++) {
    const cells = teamRows[i].getElementsByTagName("td");
    if (cells[0].textContent === playerName) {
      teamTable.deleteRow(i);
      const newRow = teamTable.insertRow();
      const cell = newRow.insertCell();
      cell.innerHTML = "&nbsp;";
      break;
    }
  }
}

function deleteRowWithEmptyCell(table) {
  const rows = table.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");

    for (let j = 0; j < cells.length; j++) {
      const cell = cells[j];

      if (cell.textContent.trim() === "") {
        // Delete the row
        rows[i].remove();
        return; // End the method after deleting the row
      }
    }
  }
}

// Fetch player list from the API and render the page
fetchPlayerList()
  .then((players) => {
    renderPlayerList(players);
  })
  .catch((error) => {
    console.error("Error initializing player list:", error);
  });
