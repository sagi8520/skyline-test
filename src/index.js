// The URL on your server where CesiumJS's static files are hosted.
import { Cartesian3, createOsmBuildingsAsync, Ion, Math as CesiumMath, Terrain, Viewer } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";

const zoomedOut=200;

window.CESIUM_BASE_URL = '/static/Cesium/';

Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZTdhZTAzYi0xMmU2LTQxMGEtYTUwYy1jYmFjMWU4MTJlMjQiLCJpZCI6MTgzMTUzLCJpYXQiOjE3MDE5NTk3MzN9.HujK24558HaTWySsqKTScmKfJKKclQ7JClfACFYMu2E';

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Viewer('cesiumContainer', {
  terrain: Terrain.fromWorldTerrain(),
});

// Add Cesium OSM Buildings, a global 3D buildings layer.
const buildingTileset = await createOsmBuildingsAsync();
viewer.scene.primitives.add(buildingTileset);

// Convert the camera coordinates to pixels
function cesiumCoordsToPixel(longitude, latitude, globeWidth, globeHeight) {
  const x = (longitude + 180) * (globeWidth / 360);
  const y = (90 - latitude) * (globeHeight / 180);
  return { x, y };
}

// Convert the pixels to camera coordinates 
function pixelToCesiumCoords(x, y, globeWidth, globeHeight) {
  const longitude = (x / globeWidth) * 360 - 180;
  const latitude = 90 - (y / globeHeight) * 180;
  return { longitude, latitude };
}

// Move the camera to the clicked location
function flyToLocationInCesium(longitude, latitude) {
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(longitude, latitude,zoomedOut),
  });
}

// Move the arrow to the camera location
function moveArrowToCesiumCameraPosition() {
  const cameraPositionCartographic = viewer.camera.positionCartographic;

  const longitude = CesiumMath.toDegrees(cameraPositionCartographic.longitude);
  const latitude = CesiumMath.toDegrees(cameraPositionCartographic.latitude);

  const globe = document.getElementById('globe');
  const globeWidth = globe.clientWidth;
  const globeHeight = globe.clientHeight;

  const pixelCoords = cesiumCoordsToPixel(longitude, latitude, globeWidth, globeHeight);

  const arrow = document.getElementById('arrow');
  arrow.style.left = `${pixelCoords.x}px`;
  arrow.style.top = `${pixelCoords.y}px`;
}

//Listener if the camera moves
viewer.camera.moveEnd.addEventListener(moveArrowToCesiumCameraPosition);

// Listener if there's a click on the globe
document.getElementById('globe').addEventListener('click', function (event) {
  const globeRect = this.getBoundingClientRect();
  const x = event.clientX - globeRect.left; // x position within the element.
  const y = event.clientY - globeRect.top;  // y position within the element.

  const globeWidth = this.clientWidth;
  const globeHeight = this.clientHeight;

  // Convert clicked pixel coordinates to geographic coordinates
  const { longitude, latitude } = pixelToCesiumCoords(x, y, globeWidth, globeHeight);

  // Move the arrow to the clicked location
  const arrow = document.getElementById('arrow');
  arrow.style.left = `${x}px`;
  arrow.style.top = `${y}px`;

  // Move the Cesium camera to the clicked location
  flyToLocationInCesium(longitude, latitude);
});
