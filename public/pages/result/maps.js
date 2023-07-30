let highlightedCell = null; // Variable to store the currently highlighted cell
var highlightedMap = null;

async function getMaps() {
  try {
    // Call API
    const response = await fetch("/api/getMaps");
    // Convert response to JSON object
    const data = await response.json();
    //Log response for debuging - Working well so commenting log
    // console.debug("Get all player stats API response: " + JSON.stringify(data));
    createMapsTable(data);
  } catch (error) {
    console.error("Error while fetching maps \n" + error);
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  // Call method to call API and get maps (which then calls method to populate table (jank ik))
  getMaps();
});

async function createMapsTable(maps) {
  // Sort Maps by length
  maps.sort(function (a, b) {
    return parseFloat(b.Maps) - parseFloat(a.Maps);
  });

  // Grab maps table
  const itemTable = document.getElementById("itemTable");

  // Calculate the number of rows
  const numRows = Math.ceil(maps.length / 6);

  // Loop through each row
  for (let i = 0; i < numRows; i++) {
    const row = itemTable.insertRow();

    // Loop through each column (6 columns)
    for (let j = 0; j < 6; j++) {
      const cell = row.insertCell();

      // Calculate the index of the current item in the data array
      const dataIndex = i * 6 + j;

      if (dataIndex < maps.length) {
        const item = maps[dataIndex];

        // Create table cell content (MapName and image)
        const mapName = item.MapName;
        const numMaps = item.Maps;
        const imageSrc = "maps/" + mapName + ".webp";

        // Create table cell content (MapName and image)
        cell.innerHTML = `
                    <p>${mapName.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p>Maps: ${numMaps}</p>
                    <img src="${imageSrc}" alt="${mapName}">
                `;

        // Set ID of cell for reference in below
        cell.id = dataIndex;

        cell.addEventListener("click", (event) => {
          if (highlightedCell != null) {
            if (highlightedCell.id == cell.id) {
              cell.classList.remove("highlighted");
            } else {
              highlightedCell.classList.remove("highlighted");
              cell.classList.add("highlighted");
              highlightedCell = cell;
              highlightedMap = item;

              //Update UI
              updateUI(item);
            }
          } else {
            cell.classList.add("highlighted");
            highlightedCell = cell;
            highlightedMap = item;

            //Update UI
            updateUI(item);
          }
        });
      }
    }
  }
}

function updateUI(map){
    updateDropDowns(map.Maps, "team1Wins");
    updateDropDowns(map.Maps, "team2Wins");
    updateMapAndLengthLabels(map);
}

function updateDropDowns(mapLength, elementId) {
  // Get the select element by its id
  const selectElement = document.getElementById(elementId);


  // Remove all options after the first one
  while (selectElement.options.length > 1) {
    selectElement.remove(selectElement.options.length - 1);
  }

  // Add a number of options equal to the integer var
  for (let i = 1; i <= mapLength; i++) {
    const option = document.createElement("option");
    option.text = i.toString();
    option.value = i.toString();
    selectElement.add(option);
  }
}

function updateMapAndLengthLabels(map) {
    // Get the select element by its id
    const mapElement = document.getElementById("resultMap");
    const lengthElement = document.getElementById("resultLength");
  
    mapElement.innerText = "Map: " + map.MapName.replace(/([A-Z])/g, ' $1').trim();
    lengthElement.innerText = "Length: " + map.Maps;
}
