let map;
let service;
let infowindow;
let autocompleteService;
let directionsService;
let directionsRenderer;
let currentLocation; // Store the user's current location
let routeVisible = false; // Track whether the route is currently visible
let currentLocationMarker; // Store the current location marker
let currentLocationVisible = false; // Track whether the current location marker is visible
let eventMarkers = []; // Array to store event markers
let eventLocationsVisible = false; // Track whether event locations are visible

window.initMap = function() {
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

    // Add event listener for the search input
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", function () {
        const query = searchInput.value;
        if (query) {
            getAutocompleteSuggestions(query);
        } else {
            clearAutocompleteList();
        }
    });

    // Add event listener for the show/hide route button
    document.getElementById("show-route").addEventListener("click", function() {
        if (routeVisible) {
            hideRoute();
        } else {
            showRoute();
        }
    });

    // Add event listener for the show/hide current location button
    document.getElementById("show-current").addEventListener("click", function() {
        if (currentLocationVisible) {
            hideCurrentLocation();
        } else {
            showCurrentLocation();
        }
    });

    // Add event listener for the show/hide event locations button
    document.getElementById("show-event").addEventListener("click", function() {
        if (eventLocationsVisible) {
            hideEventLocations();
        } else {
            showEventLocations();
        }
    });
};

function getAutocompleteSuggestions(query) {
    const request = {
        input: query,
    };

    autocompleteService.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            displayAutocompleteList(predictions);
        } else {
            clearAutocompleteList();
        }
    });
}

function displayAutocompleteList(predictions) {
    const autocompleteList = document.getElementById("autocomplete-list");
    autocompleteList.innerHTML = ''; // Clear previous suggestions
    autocompleteList.style.display = 'block'; // Show the list

    predictions.forEach(prediction => {
        const listItem = document.createElement("div");
        listItem.textContent = prediction.description;
        listItem.style.cursor = "pointer";
        listItem.onclick = () => {
            selectPlace(prediction);
        };
        autocompleteList.appendChild(listItem);
    });
}

function clearAutocompleteList() {
    const autocompleteList = document.getElementById("autocomplete-list");
    autocompleteList.innerHTML = ''; // Clear suggestions
    autocompleteList.style.display = 'none'; // Hide the list
}

function selectPlace(prediction) {
    const placeId = prediction.place_id;

    // Get place details
    service.getDetails({ placeId: placeId }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Center the map on the selected place
            map.setCenter(place.geometry.location);
            // Optionally, add a marker or show an info window
            const marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location,
            });
            infowindow.setContent(place.name);
            infowindow.open(map, marker);
            clearAutocompleteList(); // Clear suggestions after selection

            // Store the selected place location
            const destination = place.geometry.location;

            // Get user's current location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    currentLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    // Center the map on the user's location
                    map.setCenter(currentLocation);
                }, () => {
                    console.error("Geolocation service failed.");
                });
            } else {
                console.error("Your browser doesn't support geolocation.");
            }
        }
    });
}

function showRoute() {
    if (!currentLocation) {
        alert("Please select a place first.");
        return;
    }

    // Create a Directions request
    const request = {
        origin: currentLocation,
        destination: map.getCenter(), // Use the last selected place's location
        travelMode: google.maps.TravelMode.WALKING // Change to WALKING, BICYCLING, etc. as needed
    };

    // Calculate and display the route
    directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            routeVisible = true; // Set route visibility to true
            document.getElementById("show-route").textContent = "Hide route"; // Change button text
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
    {
        name: "Meeting at Blanch",
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

            // Add click event listener to the marker
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(`
                    <div>
                        <h3>${event.name}</h3>
                        <p><strong>Time:</strong> ${new Date(event.time).toLocaleString()}</p>
                        <p><strong>Location:</strong> ${event.location}</p>
                        <p><strong>Notes:</strong> ${event.notes}</p>
                    </div>
                 `);
                infowindow.open(map, marker);
            });

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




