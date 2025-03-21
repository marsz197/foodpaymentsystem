import{db} from './index.js'
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js'
// Function to calculate distance between two points using the Haversine formula
function calculateDistance(location1, location2) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const R = 6371e3; // Earth's radius in meters

  const lat1 = toRadians(location1.lat);
  const lat2 = toRadians(location2.lat);
  const deltaLat = toRadians(location2.lat - location1.lat);
  const deltaLng = toRadians(location2.lng - location1.lng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Function to calculate travel time using Google Maps Directions API
function calculateTravelTime(origin, destination) {
  const apiKey = "AIzaSyCV49Xr9GECNH5O9jWt0Nib4AyWNPxXUkA";
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${apiKey}`;

  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "OK") {
        const route = data.routes[0];
        const leg = route.legs[0];
        return leg.duration.text; // Travel time as a string (e.g., "15 mins")
      } else {
        throw new Error("Unable to calculate travel time.");
      }
    });
}
document.getElementById('get-location').addEventListener('click', async () => {
  if ("geolocation" in navigator) {
    let currentTime = new Date()
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      },
      (error) => {
        console.error(error.message)
      }
    )
    let distance = calculateDistance(VGULocation, userLocation)
    let timeTravel = calculateTravelTime(userLocation, VGULocation)
    map.setCenter(userLocation)
    userMarker = new google.maps.Marker({
      position: userLocation,
      map: map,
      title: "Your Location",
    })
    document.getElementById('distance&time').innerHTML = `Distance: ${distance.toFixed(2)} meters<br>Travel Time: ${timeTravel}'`
    userData = {
      date: currentTime,
      distance: distance,
      timeTravel: timeTravel
    }
    localStorage.setItem("userData", JSON.stringify(userData))
    const userDataRef = doc(db, "users", user.uid);
    await setDoc(userDataRef,{userData},{merge:true});
    console.log("User location:", userLocation)

  } else {
    alert("Geolocation is not supported by this browser.")
  }
});

//init map
function initMap(VGULocation) {
  const VGULocation = { lat: 11.1072691, lng: 106.6130784 }
  // Create a map centered at the default location
  const map = new google.maps.Map(document.getElementById("map"), {
    center: VGULocation,
    zoom: 15,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }], // Hide points of interest labels
      },
      {
        featureType: "transit",
        elementType: "labels",
        stylers: [{ visibility: "off" }], // Hide transit labels
      },
    ],
  });

  // Add a marker at the default location
  new google.maps.Marker({
    position: VGULocation,
    map: map,
    title: "VGU Canteen",
  });
}
