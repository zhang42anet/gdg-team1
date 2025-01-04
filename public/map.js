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

    showCurrentLocation();

    document.getElementById("show-current").addEventListener("click", function () {
        if (currentLocationVisible) {
            hideCurrentLocation();
        } else {
            showCurrentLocation();
        }
    });
};

//add search boxes for location input 
document.addEventListener('DOMContentLoaded', function () {
    initializeAutocomplete("search-input", "autocomplete-list");
    initializeAutocomplete("start-location", "autocomplete-list2");
    initializeAutocomplete("destination", "autocomplete-list3");
    document.getElementById("show-route").addEventListener("click", toggleRoute);
});

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

    autocompleteList.addEventListener("click", function (event) {
        if (event.target && event.target.matches("div")) {
            const placeId = event.target.getAttribute("data-place-id");
            const inputId = inputField.id;
            selectPlaceById(placeId, autocompleteList, inputId); 
        }
    });
}

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

function displayAutocompleteList(predictions, list, inputField) {
    list.innerHTML = ''; 
    list.style.display = 'block'; 

    predictions.forEach(prediction => {
        const item = document.createElement("div");
        item.textContent = prediction.description; 
        item.setAttribute("data-place-id", prediction.place_id); 
        list.appendChild(item);
    });
}

function clearAutocompleteList(list) {
    list.innerHTML = ''; 
}

function selectPlaceById(placeId,autocompleteList, inputId) {
    const service = new google.maps.places.PlacesService(map);

    service.getDetails({ placeId: placeId }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            map.setCenter(place.geometry.location);

            if (currentMarker) {
                currentMarker.setMap(null); 
            }

            currentMarker = new google.maps.Marker({
                map: map,
                position: place.geometry.location,
            });

            infowindow.setContent(place.name);
            infowindow.open(map, currentMarker); 
            clearAutocompleteList(autocompleteList);
            document.getElementById(inputId).value = place.name;
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
    getPlaceCoordinates(startLocation)
        .then(startCoords => {
            return getPlaceCoordinates(destination).then(destinationCoords => {
                calculateRoute(startCoords, destinationCoords);
            });
        })
        .catch(error => {
            console.error(error);
            alert("Could not find one of the locations. Please check your input.");
        });

    routeVisible=true;
    document.getElementById("show-route").textContent = "Hide route";
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
            alert('Directions request failed due to ' + status);
        }
    });
}


function hideRoute() {
    directionsRenderer.setMap(null); 
    routeVisible = false;
    document.getElementById("show-route").textContent = "Show route"; // Change button text
}

function toggleRoute() {
    if (routeVisible) {
        hideRoute();
    } else {
        showRoute(); 
    }
}


function showCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

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

            infoWindow = new google.maps.InfoWindow({
                content: `
                <div style="width: 120px">
                    <p>You are here!</p>
                </div> 
            `});
            infoWindow.open(map, currentLocationMarker);
            map.setCenter(currentLocation);
            currentLocationVisible = true; 
            document.getElementById("show-current").textContent = "Hide"; 
        }, () => {
            console.error("Geolocation service failed.");
        });
    } else {
        console.error("Your browser doesn't support geolocation.");
    }
}

function hideCurrentLocation() {
    if (currentLocationMarker) {
        currentLocationMarker.setMap(null); 
    }
    currentLocationVisible = false; 
    document.getElementById("show-current").textContent = "Show"; 
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
                resolve(location); 
            } else {
                reject('Place not found: ' + status); 
            }
        });
    });
}

const events = [
    {name: "GDG weekly meeting",
        time: "2024-12-05",
        location: "Blanchard",
        notes: "Discuss project updates"
    },
];

async function showEventLocations() {
    for (const event of events) {
        try {
            const location = await getPlaceCoordinates(event.location); 
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
            eventMarkers.push(marker); 
        } catch (error) {
            console.error(error); 
        }
    }
    eventLocationsVisible = true; 
    document.getElementById("show-event").textContent = "Hide event locations"; 
}

function hideEventLocations() {
    eventMarkers.forEach(marker => {
        marker.setMap(null); 
    });
    eventMarkers = []; 
    eventLocationsVisible = false; 
    document.getElementById("show-event").textContent = "Show event locations"; 
}

/*Menu*/
document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.getElementById('menu-button');
    var menuList = document.getElementById('menu-list');

    menuButton.onclick = function (event) {
        event.stopPropagation(); 
        menuList.classList.toggle('hidden'); 
    };

    window.onclick = function (event) {
        if (!menuList.classList.contains('hidden') && !menuButton.contains(event.target)) {
            menuList.classList.add('hidden');
        }
    };
});

// Initialize the map
initMap();




