import { db } from "./index.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Global VGU location
const VGULocation = [106.61332538342361, 11.107187043321616]; // Mapbox uses [lng, lat] format

// Declare map in the global scope
let map;

// Initialize Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoibWFyc3oxOTciLCJhIjoiY204cGRkNm1pMDlxNDJxcG42OWZwMzhlZiJ9.zB2O5s9zGGtpIBzCRUKX7g'; // Replace with your token

// Function to calculate distance between two points (Haversine formula - unchanged)
function calculateDistance(location1, location2) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const R = 6371e3; // Earth's radius in meters

  const lat1 = toRadians(location1[1]); // Note: changed to array index access
  const lat2 = toRadians(location2[1]);
  const deltaLat = toRadians(location2[1] - location1[1]);
  const deltaLng = toRadians(location2[0] - location1[0]);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Function to calculate travel time using Mapbox Directions API
async function calculateTravelTime(origin, destination) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?access_token=${mapboxgl.accessToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      const duration = data.routes[0].duration; // Duration in seconds
      return formatDuration(duration);
    } else {
      throw new Error("Unable to calculate travel time.");
    }
  } catch (error) {
    console.error(error);
    return "N/A";
  }
}

// Helper function to format duration (seconds to human-readable)
function formatDuration(seconds) {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} mins`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} mins`;
  }
}


// Initialize map (called when page loads)
function initMap() {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: VGULocation,
    zoom: 15
  });

  // Add VGU marker
  const vguMarker = new mapboxgl.Marker({
    color: "#FF0000",
  })
    .setLngLat(VGULocation)
    .setPopup(new mapboxgl.Popup().setHTML("VGU Canteen"))
    .addTo(map);
  document.getElementById("vguLocation").innerHTML = `VGU Location: ${VGULocation}`;

  // Add navigation controls
  map.addControl(new mapboxgl.NavigationControl());

  // Initialize GeolocateControl
  let geolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true,
  });
  map.addControl(geolocateControl);
  // Add event listeners for geolocation events
  geolocateControl.on('geolocate', () => {
    console.log("User location updated");
  });

  geolocateControl.on('trackuserlocationend', () => {
    console.log("User tracking ended");
  });
  document.getElementById("get-location").addEventListener("click", async () => {
    if ("geolocation" in navigator) {
      let currentTime = new Date();

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLocation = [
            position.coords.longitude,
            position.coords.latitude
          ];

          let distance = calculateDistance(userLocation, VGULocation);
          let timeTravel = await calculateTravelTime(userLocation, VGULocation);

          // Update map
          map.flyTo({
            center: userLocation,
            essential: true
          });

          // Add marker for user location
          new mapboxgl.Marker()
            .setLngLat(userLocation)
            .setPopup(new mapboxgl.Popup().setHTML("Your Location"))
            .addTo(map);

          // Update UI only if user's location is not already displayed
          const vguLocationElement = document.getElementById("vguLocation");
          if (!vguLocationElement.innerHTML.includes("Your Location")) {
            vguLocationElement.innerHTML += `<br><br/>Your Location: ${userLocation}`;
          }
          //tracking status
          let isTracking = false;
          if (isTracking) {
            // Stop tracking
            isTracking = false;
            document.getElementById("get-location").innerHTML = "Show My Location";
            // Remove the geolocate control to stop tracking
            map.removeControl(geolocateControl);
          } else {
            // Start tracking
            isTracking = true;
            document.getElementById("get-location").innerHTML = "Stop Tracking";
            geolocateControl.trigger();
          }
          // Update distance and travel;
          document.getElementById("distance&time").innerHTML = `Distance: ${distance.toFixed(2)} meters<br>Travel Time: ${timeTravel}`;

          // Save data locally
          let userData = {
            date: currentTime.toISOString(),
            distance: distance,
            timeTravel: timeTravel,
          };
          localStorage.setItem("userData", JSON.stringify(userData));

          // Save data to Firestore
          const user = auth.currentUser; // Ensure Firebase Auth is used
          if (user) {
            const userDataRef = doc(db, "users", user.uid);
            await setDoc(userDataRef, { userData }, { merge: true });
          }

          console.log("User location:", userLocation);

        },
        (error) => {
          console.error(error.message);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  });
}

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', initMap);

