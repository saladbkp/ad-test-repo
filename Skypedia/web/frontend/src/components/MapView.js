import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import FlightMarker from './FlightMarker';

// Helper to get airport coordinates by code
function getAirportCoords(airports, code) {
  const ap = airports.find(a => a.code === code);
  if (!ap) return null;
  // coordinates: "'41.7992, 12.5977'"
  if (typeof ap.gps_coordinates === 'string') {
    const match = ap.gps_coordinates.match(/'?([-\d.]+),\s*([-\d.]+)'?/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      return [lat, lon];
    }
  }
  return null;
}

// Linear interpolation between two points
function interpolateCoords(start, end, t) {
  return [
    start[0] + (end[0] - start[0]) * t,
    start[1] + (end[1] - start[1]) * t,
  ];
}

function AttributionPrefix() {
  const map = useMap();
  useEffect(() => {
    map.attributionControl.setPrefix('<a href="https://leafletjs.com/" target="_blank" rel="noopener noreferrer">Leaflet</a>');
  }, [map]);
  return null;
}

export default function MapView({ flights, airports, onFlightClick }) {
  // Force rerender every 1 second
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const now = Date.now();

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 1,
      overflow: 'hidden'
    }}>
      <MapContainer
        center={[41.8719, 12.5674]} // Centered on Italy
        zoom={5}
        style={{ width: '100vw', height: '100vh' }}
        zoomControl={false}
        attributionControl={true}
      >
        <AttributionPrefix />
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {flights.map(flight => {
          const start = getAirportCoords(airports, flight.origin);
          const end = getAirportCoords(airports, flight.destination);
          if (!start || !end) return null;

          // Draw line
          const line = [start, end];

          // Calculate progress (0=start, 1=end)
          const dep = new Date(flight.departure).getTime();
          const arr = new Date(flight.arrival).getTime();
          let t = (now - dep) / (arr - dep);
          t = Math.max(0, Math.min(1, t)); // Clamp between 0 and 1

          // Current position
          const pos = interpolateCoords(start, end, t);

          // Heading in degrees
          const heading = Math.atan2(
            end[1] - start[1],
            end[0] - start[0]
          ) * (180 / Math.PI);

          return (
            <React.Fragment key={flight.id}>
              {/* <Polyline
                positions={line}
                pathOptions={{
                  color: '#888888',
                  dashArray: '8 8',
                  weight: 1,
                }}
              /> */}
              <FlightMarker
                flight={{
                  ...flight,
                  latitude: pos[0],
                  longitude: pos[1],
                  heading,
                }}
                onClick={() => onFlightClick && onFlightClick(flight)}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
