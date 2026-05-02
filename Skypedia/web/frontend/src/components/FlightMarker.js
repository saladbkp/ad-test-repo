import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// Custom plane icon as a larger, rotatable emoji
const planeIcon = (heading = 0) =>
  new L.DivIcon({
    html: `<span style="font-size: 1.5rem; display: inline-block; transform: rotate(${heading - 45}deg);">✈️</span>`,
    className: '',
    iconAnchor: [24, 24],
  });

export default function FlightMarker({ flight, onClick }) {
  const heading = flight.heading || 0;

  return (
    <Marker
      position={[flight.latitude, flight.longitude]}
      icon={planeIcon(heading)}
      interactive={true}
      eventHandlers={onClick ? { click: () => onClick(flight) } : undefined}
    >
      <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent={false}>
		<strong>{flight.flight_number}</strong>
      </Tooltip>
    </Marker>
  );
}
