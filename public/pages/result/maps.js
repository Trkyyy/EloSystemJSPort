let highlightedCell = null; // Variable to store the currently highlighted cell

async function getMaps() {
    try{
        // Call API
        const response = await fetch('/api/getMaps');
        // Convert response to JSON object
        const data = await response.json();
        //Log response for debuging - Working well so commenting log
        // console.debug("Get all player stats API response: " + JSON.stringify(data));
        createMapsTable(data);
    }catch(error){
        console.error("Error while fetching maps \n"+ error); 
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    // Call method to call API and get maps (which then calls method to populate table (jank ik))
    getMaps();
});
    

async function createMapsTable(maps) {
    const itemTable = document.getElementById('itemTable');
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
                const imageSrc = 'maps/' + mapName + '.webp';

                // Create table cell content (MapName and image)
                cell.innerHTML = `
                    <p>${mapName}</p>
                    <img src="${imageSrc}" alt="${mapName}">
                `;

                // Set ID of cell for reference in below
                cell.id = dataIndex;

                cell.addEventListener('click', (event) => {
                    if(highlightedCell != null) {
                        if(highlightedCell.id == cell.id){
                            cell.classList.remove('highlighted');
                        }else{
                            highlightedCell.classList.remove('highlighted');
                            cell.classList.add('highlighted');
                            highlightedCell = cell;
                        }
                    }else{
                        cell.classList.add('highlighted');
                        highlightedCell = cell;
                    }
                })
            }
        }
    }
}
