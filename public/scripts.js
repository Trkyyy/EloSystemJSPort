//Call needed functions when page loads
document.addEventListener("DOMContentLoaded", async function() {
    // Get a reference to the button element
    const goToAnotherPageButton = document.getElementById("goToAnotherPageButton");
      
    // Add a click event listener to the button
    goToAnotherPageButton.addEventListener("click", function() {
    // Change the current location to the URL of the other page
    window.location.href = "pages/generate/generate.html";
    });
});


