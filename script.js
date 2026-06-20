const geojsonUrl = 'https://raw.githubusercontent.com/cfwang-cmyk/ROP/refs/heads/main/data/2_Points_1_Trail.geojson';

const map = new mapboxgl.Map({
  accessToken: 'pk.eyJ1IjoiancyMDA2IiwiYSI6ImNtcThmbjN0ejBhNHQycHB3OXFtOHA3Z3gifQ.uT9TiSthEqqnlScWtrEcYA',
  container: 'map',
  zoom: 12,
  center: [-120.94, 38.95],
  pitch: 75,
  bearing: 35,
  style: 'mapbox://styles/mapbox/satellite-streets-v12'
});

map.on('style.load', () => {
  map.addSource('mapbox-dem', {
    type: 'raster-dem',
    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
    tileSize: 512,
    maxzoom: 14
  });

  map.setTerrain({
    source: 'mapbox-dem',
    exaggeration: 1.5
  });

  map.addSource('rop-sites', {
    type: 'geojson',
    data: geojsonUrl
  });

  map.addLayer({
    id: 'rop-trail',
    type: 'line',
    source: 'rop-sites',
    slot: 'top',
    filter: ['==', ['geometry-type'], 'LineString'],
    paint: {
      'line-color': '#ffb000',
      'line-width': 5,
      'line-opacity': 0.95
    }
  });

  map.addLayer({
    id: 'rop-points',
    type: 'circle',
    source: 'rop-sites',
    slot: 'top',
    filter: ['==', ['geometry-type'], 'Point'],
    paint: {
      'circle-radius': 8,
      'circle-color': '#00d1b2',
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2
    }
  });

  map.addLayer({
    id: 'rop-labels',
    type: 'symbol',
    source: 'rop-sites',
    slot: 'top',
    layout: {
      'text-field': ['coalesce', ['get', 'rop_renaming_new_name'], ['get', 'title']],
      'text-size': 14,
      'text-offset': [0, 1.3],
      'text-anchor': 'top',
      'text-allow-overlap': false
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#000000',
      'text-halo-width': 1.5
    }
  });
});
function getCameraSettings() {
  const center = map.getCenter();

  return {
    lng: Number(center.lng.toFixed(6)),
    lat: Number(center.lat.toFixed(6)),
    zoom: Number(map.getZoom().toFixed(2)),
    bearing: Number(map.getBearing().toFixed(2)),
    pitch: Number(map.getPitch().toFixed(2))
  };
}

function updateCameraDebug() {
  const camera = getCameraSettings();

  document.getElementById('debug-lat').textContent = camera.lat;
  document.getElementById('debug-lng').textContent = camera.lng;
  document.getElementById('debug-zoom').textContent = camera.zoom;
  document.getElementById('debug-bearing').textContent = `${camera.bearing}°`;
  document.getElementById('debug-pitch').textContent = `${camera.pitch}°`;
}

map.on('load', updateCameraDebug);
map.on('move', updateCameraDebug);
map.on('zoom', updateCameraDebug);
map.on('rotate', updateCameraDebug);
map.on('pitch', updateCameraDebug);

document.getElementById('copy-camera').addEventListener('click', async () => {
  const camera = getCameraSettings();

  const text = `center: [${camera.lng}, ${camera.lat}],
zoom: ${camera.zoom},
pitch: ${camera.pitch},
bearing: ${camera.bearing}`;

  await navigator.clipboard.writeText(text);

  document.getElementById('copy-camera').textContent = 'Copied';
  setTimeout(() => {
    document.getElementById('copy-camera').textContent = 'Copy camera settings';
  }, 1200);
});