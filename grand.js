document.addEventListener("DOMContentLoaded", () => {
  // Handle search bar functionality with suggestions
  const searchBar = document.getElementById("search-bar");
  const dropdownList = document.getElementById("dropdown-list");

  const suggestions = [
    "Pizza",
    "Burger",
    "Pasta",
    "Sushi",
    "Salad",
    "Tacos",
    "Ice Cream",
    "Steak",
    "Fried Chicken",
    "Noodles",
  ];

  // Function to display suggestions based on the user's input
  searchBar.addEventListener("input", function (event) {
    const query = event.target.value.toLowerCase();
    dropdownList.innerHTML = ""; // Clear previous results

    if (query.length > 0) {
      const filteredSuggestions = suggestions.filter((item) =>
        item.toLowerCase().includes(query)
      );

      // If there are suggestions, show the dropdown
      if (filteredSuggestions.length > 0) {
        filteredSuggestions.forEach((suggestion) => {
          const listItem = document.createElement("li");
          listItem.textContent = suggestion;
          listItem.addEventListener("click", function () {
            searchBar.value = suggestion;
            dropdownList.innerHTML = ""; // Clear dropdown after selection
            dropdownList.style.display = "none"; // Hide dropdown after selection
          });
          dropdownList.appendChild(listItem);
        });

        dropdownList.style.display = "block"; // Show the dropdown
      } else {
        dropdownList.style.display = "none"; // Hide if no suggestions
      }
    } else {
      dropdownList.style.display = "none"; // Hide the dropdown if search is empty
    }
  });

  // Close the dropdown when clicking outside
  document.addEventListener("click", function (event) {
    if (!searchBar.contains(event.target) && !dropdownList.contains(event.target)) {
      dropdownList.style.display = "none";
    }
  });

  // Fetch the 'name' parameter from the URL and update the sidebar
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get("name");

  if (name) {
    // Update the sidebar with the user's name
    const userNameElement = document.getElementById("user-name");
    if (userNameElement) {
      userNameElement.textContent = `Welcome, ${name}`;
    }

    // Optionally update the page title with the user's name
    document.title = `${name}'s Dashboard`;
  }

  // Add search functionality (Optional additional search logic can be added here)
  if (searchBar) {
    searchBar.addEventListener("input", function (event) {
      console.log("Search:", event.target.value);
      // Add your custom search logic here
    });
  }
});
