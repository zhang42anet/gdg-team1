let map;
let service;
let infowindow;
let autocompleteService;
let currentMarker;
let directionsService;
let directionsRenderer;
let currentLocation;
let routeVisible = false; 
let currentLocationMarker; 
let currentLocationVisible = false; 
let eventMarkers = []; 
let eventLocationsVisible = false; 


//Set MHC as center of map
window.initMap = function () {
    const MHC = { lat: 42.2550, lng: -72.5770 };
    map = new google.maps.Map(document.getElementById("map"), {
        center: MHC,
        zoom: 17,
    });

    infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
    autocompleteService = new google.maps.places.AutocompleteService();
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Automatically show current location on map load
    showCurrentLocation();

    // Add event listener for the show/hide current location button
    document.getElementById("show-current").addEventListener("click", function () {
        if (currentLocationVisible) {
            hideCurrentLocation();
        } else {
            showCurrentLocation();
        }
    });
};

document.addEventListener('DOMContentLoaded', function () {
    // Initialize autocomplete for all input fields
    initializeAutocomplete("search-input", "autocomplete-list");
    initializeAutocomplete("start-location", "autocomplete-list2");
    initializeAutocomplete("destination", "autocomplete-list3");

    // Add event listener for the show route button
    document.getElementById("show-route").addEventListener("click", toggleRoute);
});

// Function to initialize autocomplete for a given input and list
function initializeAutocomplete(inputId, listId) {
    const inputField = document.getElementById(inputId);
    const autocompleteList = document.getElementById(listId);

    inputField.addEventListener("input", function () {
        const query = inputField.value;
        if (query) {
            getAutocompleteSuggestions(query, autocompleteList, inputField);
        } else {
            clearAutocompleteList(inputField);
        }
    });

    // Add click event listener for the list items
    autocompleteList.addEventListener("click", function (event) {
        if (event.target && event.target.matches("div")) {
            const placeId = event.target.getAttribute("data-place-id");
            selectPlaceById(placeId, autocompleteList); 
        }
    });
}

// Function to get autocomplete suggestions
function getAutocompleteSuggestions(query, list, inputField) {
    const request = {
        input: query,
    };

    autocompleteService.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            displayAutocompleteList(predictions, list, inputField);
        } else {
            clearAutocompleteList(list);
        }
    });
}

// Function to display suggestions in the list
function displayAutocompleteList(predictions, list, inputField) {
    list.innerHTML = ''; // Clear previous suggestions
    list.style.display = 'block'; // Show the list

    // Position the list below the input field
    const rect = inputField.getBoundingClientRect();
    list.style.left = `${rect.left}px`;
    list.style.top = `${rect.bottom}px`;
    list.style.width = `${rect.width}px`; // Match the width of the input field

    predictions.forEach(prediction => {
        const item = document.createElement("div");
        item.textContent = prediction.description; // Display the description
        item.setAttribute("data-place-id", prediction.place_id); // Store place_id in a data attribute
        list.appendChild(item);
    });
}

// Function to clear the autocomplete list
function clearAutocompleteList(list) {
    list.innerHTML = ''; // Clear suggestions
    list.style.display = 'none'; // Hide the list
}

function selectPlaceById(placeId,autocompleteList) {
    // Create a new PlacesService instance
    const service = new google.maps.places.PlacesService(map);

    // Get place details using the placeId
    service.getDetails({ placeId: placeId }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Center the map on the selected place
            map.setCenter(place.geometry.location);

            // Remove the current marker if it exists
            if (currentMarker) {
                currentMarker.setMap(null); // Remove the marker from the map
            }

            // Create a new marker for the selected place
            currentMarker = new google.maps.Marker({
                map: map,
                position: place.geometry.location,
            });

            // Show the info window for the new marker
            infowindow.setContent(place.name); // Set the content of the info window
            infowindow.open(map, currentMarker); // Open the info window on the marker
            clearAutocompleteList(autocompleteList);

        } else {
            console.error('Error fetching place details:', status);
        }
    });
}

function showRoute() {
    const startLocation = document.getElementById("start-location").value;
    const destination = document.getElementById("destination").value;

    if (!startLocation || !destination) {
        alert("Please enter both start location and destination.");
        return;
    }

    // Get coordinates for the start location
    getPlaceCoordinates(startLocation)
        .then(startCoords => {
            // Log start coordinates correctly
            console.log("Start Coordinates: lat =", startCoords.lat(), "lng =", startCoords.lng());

            // Get coordinates for the destination
            return getPlaceCoordinates(destination).then(destinationCoords => {
                // Now we have both start and destination coordinates
                calculateRoute(startCoords, destinationCoords);
            });
        })
        .catch(error => {
            console.error(error);
            alert("Could not find one of the locations. Please check your input.");
        });
}

function calculateRoute(startCoords, destinationCoords) {
    const request = {
        origin: startCoords,
        destination: destinationCoords,
        travelMode: google.maps.TravelMode.WALKING 
    };

    directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
        } else {
            console.error('Directions request failed due to ' + status);
        }
    });
}


function hideRoute() {
    directionsRenderer.setMap(null); // Hide the route
    routeVisible = false; // Set route visibility to false
    document.getElementById("show-route").textContent = "Show route"; // Change button text
}

function toggleRoute() {
    if (routeVisible) {
        hideRoute(); // Hide the route if it's currently visible
    } else {
        showRoute(); // Show the route if it's currently hidden
    }
}


function showCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // Create a red marker for the current location
            currentLocationMarker = new google.maps.Marker({
                position: currentLocation,
                map: map,
                title: "Current location!",
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "red",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "white"
                }
            });

            // Center the map on the user's current location
            infoWindow = new google.maps.InfoWindow({
                content: `
                <div style="width: 120px">
                    <p>You are here!</p>
                </div> 
            `});
            infoWindow.open(map, currentLocationMarker);
            map.setCenter(currentLocation);
            currentLocationVisible = true; // Set visibility to true
            document.getElementById("show-current").textContent = "Hide"; // Change button text
        }, () => {
            console.error("Geolocation service failed.");
        });
    } else {
        console.error("Your browser doesn't support geolocation.");
    }
}

function hideCurrentLocation() {
    if (currentLocationMarker) {
        currentLocationMarker.setMap(null); // Remove the marker from the map
    }
    currentLocationVisible = false; // Set visibility to false
    document.getElementById("show-current").textContent = "Show"; // Change button text
}

function getPlaceCoordinates(placeName) {
    return new Promise((resolve, reject) => {
        const service = new google.maps.places.PlacesService(map);
        service.findPlaceFromQuery({
            query: placeName,
            fields: ['geometry']
        }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results[0]) {
                const location = results[0].geometry.location;
                resolve(location); // Resolve the Promise with the location
            } else {
                reject('Place not found: ' + status); // Reject the Promise if not found
            }
        });
    });
}

const events = [
    {name: "Meeting at Blanch",
        time: "2023-10-01T10:00:00",
        location: "Blanchard",
        notes: "Discuss project updates."
    },
];

async function showEventLocations() {
    for (const event of events) {
        try {
            const location = await getPlaceCoordinates(event.location); // Get coordinates for the event location
            const marker = new google.maps.Marker({
                position: location,
                map: map,
                title: event.name,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "blue",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "white"
                }
            });


            infowindow.setContent(`
                    <div>
                        <h3>${event.name}</h3>
                        <p><strong>Time:</strong> ${new Date(event.time).toLocaleString()}</p>
                        <p><strong>Location:</strong> ${event.location}</p>
                        <p><strong>Notes:</strong> ${event.notes}</p>
                    </div>
                 `);
            infowindow.open(map, marker);
            eventMarkers.push(marker); // Store the marker in the array
        } catch (error) {
            console.error(error); // Handle errors (e.g., place not found)
        }
    }
    eventLocationsVisible = true; // Set visibility to true
    document.getElementById("show-event").textContent = "Hide event locations"; // Change button text
}

function hideEventLocations() {
    eventMarkers.forEach(marker => {
        marker.setMap(null); // Remove each marker from the map
    });
    eventMarkers = []; // Clear the markers array
    eventLocationsVisible = false; // Set visibility to false
    document.getElementById("show-event").textContent = "Show event locations"; // Change button text
}

/*Menu*/
document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.getElementById('menu-button');
    var menuList = document.getElementById('menu-list');

    // Show the menu when the button is clicked
    menuButton.onclick = function (event) {
        event.stopPropagation(); // Prevent affecting parent elements like the window
        menuList.classList.toggle('hidden'); // If the window is closed, open it, and vise versa
    };

    // Closing the menu when clicking anywhere outside of it in the window
    window.onclick = function (event) {
        //checks if menu is visable and if the click does not occur on menu button
        if (!menuList.classList.contains('hidden') && !menuButton.contains(event.target)) {
            menuList.classList.add('hidden');
        }
    };
});

// Initialize the map
initMap();




