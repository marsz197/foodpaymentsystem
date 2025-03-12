let sampleLocation = {
    "canteen":[{lat:11.1072691,lng:106.6130784}]
}
document.getElementById('get-location').addEventListener('click', () => {
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
        let distance = calculateDistance(sampleLocation.canteen,userLocation)
        let timeTravel = calculateTravelTime(userLocation,sampleLocation.canteen)
        
    } else {
        alert("Geolocation is not supported by this browser.")
    }
});
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
    const apiKey = "YOUR_GOOGLE_MAPS_API_KEY";
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
