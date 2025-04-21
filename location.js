// Import Firebase dependencies
import { db } from "./index.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import {auth } from "./index.js";

// ========================== Global Variables ==========================
const VGULocation = [106.61332538342361, 11.107187043321616]; // VGU Canteen Location [lng, lat]
let map; // Mapbox map instance
let isTracking = false; // Tracking status
let userMarker; // Marker for the user's location

// ========================== Mapbox Initialization ==========================
mapboxgl.accessToken = 'pk.eyJ1IjoibWFyc3oxOTciLCJhIjoiY204cGRkNm1pMDlxNDJxcG42OWZwMzhlZiJ9.zB2O5s9zGGtpIBzCRUKX7g'; // Replace with your token

function initMap() {
    // Initialize the map
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: VGULocation,
        zoom: 15
    });

    // Add VGU marker
    const vguMarker = new mapboxgl.Marker({ color: "#FF0000" })
        .setLngLat(VGULocation)
        .setPopup(new mapboxgl.Popup().setHTML("VGU Canteen"))
        .addTo(map);

    document.getElementById("vguLocation").innerHTML = `VGU Location: ${VGULocation}`;

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl());

    // Initialize GeolocateControl
    const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
    });
    map.addControl(geolocateControl);

    // Add event listener for "Get Location" button
    document.getElementById("get-location").addEventListener("click", () => handleGetLocation(geolocateControl));
}

// ========================== Geolocation Functions ==========================
async function handleGetLocation(geolocateControl) {
    if ("geolocation" in navigator) {
        if (!isTracking) {
            // Start tracking
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const userLocation = [position.coords.longitude, position.coords.latitude];
                    const distance = calculateDistance(userLocation, VGULocation);
                    const timeTravel = await calculateTravelTime(userLocation, VGULocation);
                    geolocateControl.trigger(); // Trigger geolocation to get the user's location
                    updateMap(userLocation);
                    updateUI(userLocation, distance, timeTravel);
                    saveUserData(userLocation,distance, timeTravel);

                    // Start real-time distance checking
                    startRealTimeDistanceCheck(geolocateControl);
                },
                (error) => {
                    console.error("Error getting current position:", error.message);
                }
            );
        } else {
            stopTracking(geolocateControl);
        }
    }
}

async function startRealTimeDistanceCheck(geolocateControl) {
    const watchId = navigator.geolocation.watchPosition(
        async (position) => {
            const currentLocation = [position.coords.longitude, position.coords.latitude];
            const currentDistance = calculateDistance(currentLocation, VGULocation);
            const currentTimeTravel = await calculateTravelTime(currentLocation, VGULocation);
            // Check if the user is near the destination (within 3 meters)
            if (currentDistance <= 3) {
                alert("You are very close to the destination (within 3 meters)!");
                navigator.geolocation.clearWatch(watchId); // Stop watching once the user is near
                stopTracking(geolocateControl);
            }

            // Update distance in the UI
            updateUI(currentLocation, currentDistance, currentTimeTravel);
        },
        (error) => {
            console.error("Error getting current position:", error.message);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
        }
    );
}

function stopTracking(geolocateControl) {
    isTracking = false;
    document.getElementById("get-location").innerHTML = "Get Location";
    // Remove the user marker if it exists
    if (userMarker) {
        userMarker.remove();
    }
    // Remove the GeolocateControl from the map
    geolocateControl.on('trackuserlocationend',() => {console.log("Tracking stopped.");})
}

// ========================== Helper Functions ==========================
function calculateDistance(location1, location2) {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const R = 6371e3; // Earth's radius in meters

    const lat1 = toRadians(location1[1]);
    const lat2 = toRadians(location2[1]);
    const deltaLat = toRadians(location2[1] - location1[1]);
    const deltaLng = toRadians(location2[0] - location1[0]);

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

async function calculateTravelTime(origin, destination) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?access_token=${mapboxgl.accessToken}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
            const travelTime = data.routes[0].duration; // Duration in seconds
            localStorage.setItem("travelTime", JSON.stringify(travelTime)); // Save travel time to local storage
            return travelTime;
        } else {
            throw new Error("Unable to calculate travel time.");
        }
    } catch (error) {
        console.error(error);
        return "N/A";
    }
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainedSeconds = Math.round(seconds - minutes * 60);
    if (minutes < 60) {
        return `${minutes} mins and ${remainedSeconds} seconds`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} mins`;
    }
}

function updateMap(userLocation) {
    map.flyTo({
        center: userLocation,
        essential: true,
    });

    // Add marker for user location
    if (userMarker) {
        userMarker.remove(); // Remove the previous marker if it exists
    }
    userMarker = new mapboxgl.Marker()
        .setLngLat(userLocation)
        .setPopup(new mapboxgl.Popup().setHTML("Your Location"))
        .addTo(map);
}

function updateUI(userLocation, distance, timeTravel) {
    const vguLocationElement = document.getElementById("vguLocation");
    const foodTime = JSON.parse(localStorage.getItem("previousFoodTime")) || 0;
    if (!vguLocationElement.innerHTML.includes("Your Location")) {
        vguLocationElement.innerHTML += `<br><br/>Your Location: ${userLocation}`;
    }

    isTracking = true;
    document.getElementById("get-location").innerHTML = "Stop Tracking";
    document.getElementById("distance&time").innerHTML = `Distance: ${distance.toFixed(2)} meters<br>Total Time: ${formatDuration(timeTravel+foodTime*60)}`;
}

async function saveUserData(location,distance, timeTravel) {
    const currentTime = new Date();
    const userData = {
        date: currentTime.toISOString(),
        location: location,
        distance: distance,
        timeTravel: timeTravel,
    };
    localStorage.setItem("userData", JSON.stringify(userData));

    const user = auth.currentUser; // Ensure Firebase Auth is used
    if (user) {
        const userDataRef = doc(db, "users", user.uid);
        await setDoc(userDataRef, { userData }, { merge: true });
    }
}
document.getElementById("copyVGU-location").addEventListener("click", () => {
    navigator.clipboard.writeText(VGULocation).then(() => {
        console.log("Location copied to clipboard:", VGULocation);
        alert("Location copied to clipboard!");
    }).catch((error) => {
        console.error("Error copying location:", error);
    });
});
document.getElementById("copyUser-location").addEventListener("click", () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    
    if (userData && userData.location) {
        navigator.clipboard.writeText(userData.location).then(() => {
            console.log("Location copied to clipboard:", userData.location);
            alert("Location copied to clipboard!");
        }).catch((error) => {
            console.error("Error copying location:", error);
        });
    } else {
        console.error("User data or location is not available.");
        alert("Failed to copy location: User data is missing.");
    }
});
// ========================== Initialize ==========================
document.addEventListener('DOMContentLoaded', initMap);

