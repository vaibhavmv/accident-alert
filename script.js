let map;
let marker;
let dangerZones = [];
let isInDangerZone = false;

// Fixed pin location
const fixedLocation = [12.87348973, 74.95139172];

// Accident-prone coordinates
const dangerPoints = [
    [12.87046004, 74.88314843],
    [12.87808856, 74.88125038],
    [12.87816384, 74.88933563],
    [12.87197375, 74.8925972],
    [12.8696335, 74.89800453],
    [12.87005176, 74.90738472],
    [12.87217302, 74.88572735],
    [12.87049903, 74.89578077],
    [12.88163357, 74.87688331],
    [12.86855551, 74.93087769],
    [12.87348963, 74.95139122]
];

function initMap() {
    // Create map centered on the fixed location
    map = L.map('map').setView(fixedLocation, 14);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create draggable marker at fixed location
    marker = L.marker(fixedLocation, {
        draggable: true,
        title: "Drag me!"
    }).addTo(map);

    // Create danger zones for each coordinate
    dangerPoints.forEach(point => {
        const circle = L.circle(point, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.35,
            radius: 200
        }).addTo(map);
        dangerZones.push(circle);
    });

    // Get current location just for reference (will add a different marker)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = [
                    position.coords.latitude,
                    position.coords.longitude
                ];
                // Add a blue marker for current location (non-draggable)
                L.marker(pos, {
                    icon: L.divIcon({
                        className: 'current-location',
                        html: '📍',
                        iconSize: [25, 25],
                        iconAnchor: [12, 24]
                    })
                }).addTo(map);
            },
            () => {
                handleLocationError(true);
            }
        );
    } else {
        handleLocationError(false);
    }

    // Add marker drag event listener
    marker.on('drag', checkDangerZones);
}

function checkDangerZones() {
    const messageBox = document.getElementById("message");
    const markerPosition = marker.getLatLng();
    
    let isNearAnyZone = false;
    
    for (let zone of dangerZones) {
        const dangerCenter = zone.getLatLng();
        const distance = markerPosition.distanceTo(dangerCenter);

        if (distance <= zone.getRadius()) {
            isNearAnyZone = true;
            break;
        }
    }

    if (isNearAnyZone && !isInDangerZone) {
        messageBox.style.display = "block";
        messageBox.textContent = "Warning: Entering accident-prone zone!";
        isInDangerZone = true;
    } else if (!isNearAnyZone && isInDangerZone) {
        messageBox.style.display = "none";
        isInDangerZone = false;
    }
}

function handleLocationError(browserHasGeolocation) {
    console.log(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
}

// Initialize the map when the page loads
window.onload = initMap;