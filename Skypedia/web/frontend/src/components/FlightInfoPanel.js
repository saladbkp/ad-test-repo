import React, { useEffect, useState } from 'react';
import SidePanel from './SidePanel';
import { getFlightById, getFlightPicture } from '../services/api';

export default function FlightInfoPanel({ open, setOpen, flightData, loggedIn, airports = [] }) {
  const [planeImg, setPlaneImg] = useState(null);

  // Helper to get airport long name
  const getAirportName = code => {
    const ap = airports.find(a => a.code === code);
    return ap ? ap.name : code;
  };

  // Load flight details (including cargo if permitted)
  useEffect(() => {
    if (!flightData || !flightData.id) {
      return;
    }
    getFlightById(flightData.id)
      .then(data => {
        if (data.cargo) {
          flightData.cargo = data.cargo; // Update flightData with cargo
        }
      })
      .catch(() => {});
  }, [flightData && flightData.id]);

  // Load plane picture when flightData changes
  useEffect(() => {
    if (!flightData || !flightData.id) {
      setPlaneImg(null);
      return;
    }
    let revoked = false;
    getFlightPicture(flightData.id)
      .then(url => {
        if (!revoked) setPlaneImg(url);
      })
      .catch(() => setPlaneImg(null));
    return () => {
      revoked = true;
      if (planeImg) URL.revokeObjectURL(planeImg);
    };
    // eslint-disable-next-line
  }, [flightData && flightData.id]);

  if (!flightData) return null;

  return (
    <SidePanel open={open} setOpen={setOpen} zIndex={1500} width={420}>
      <div
        style={{
          background: '#f7fafd',
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          padding: 0,
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        {/* Flight number at the top */}
        <div style={{
          background: '#1976d2',
          color: '#fff',
          fontSize: 26,
          fontWeight: 700,
          padding: '18px 24px 10px 24px',
          letterSpacing: 1,
        }}>
          {flightData.flight_number}
        </div>
        {/* Owner under flight number */}
        <div style={{
          color: '#1976d2',
          fontWeight: 500,
          fontSize: 16,
          padding: '0 24px 10px 24px',
        }}>
          {flightData.owner}
        </div>
        {/* Plane picture from API */}
        <div style={{
          width: '100%',
          height: 120,
          background: 'linear-gradient(90deg, #e3eafc 60%, #f7fafd 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
          overflow: 'hidden',
          position: 'relative'
        }}>
          {planeImg ? (
            <img
              src={planeImg}
              alt="Plane"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                display: 'block'
              }}
            />
          ) : (
            <span style={{
              color: '#b0b0b0',
              fontSize: 32,
              fontStyle: 'italic'
            }}>
              [Plane picture here]
            </span>
          )}
        </div>
        {/* From/To section */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: '0 24px 0 24px',
          alignItems: 'center',
          marginBottom: 10,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{flightData.origin}</div>
            <div style={{ color: '#666', fontSize: 13 }}>{getAirportName(flightData.origin)}</div>
          </div>
          <div style={{ fontSize: 22, color: '#1976d2', margin: '0 10px' }}>→</div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{flightData.destination}</div>
            <div style={{ color: '#666', fontSize: 13 }}>{getAirportName(flightData.destination)}</div>
          </div>
        </div>
        {/* Departure/Arrival */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: '0 24px 0 24px',
          marginBottom: 10,
        }}>
          <div>
            <div style={{ color: '#888', fontSize: 12 }}>Departure</div>
            <div style={{ fontWeight: 500 }}>{new Date(flightData.departure).toLocaleString()}</div>
          </div>
          <div>
            <div style={{ color: '#888', fontSize: 12, textAlign: 'right' }}>Arrival</div>
            <div style={{ fontWeight: 500 }}>{new Date(flightData.arrival).toLocaleString()}</div>
          </div>
        </div>
        {/* Cargo */}
        {loggedIn && flightData.cargo && flightData.cargo.length > 0 && (
          <div style={{
            background: '#f2f7fb',
            borderTop: '1px solid #e3eafc',
            padding: '16px 24px 10px 24px',
            marginTop: 8,
          }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Cargo</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {flightData.cargo.map(c => (
                <li key={c.id} style={{ marginBottom: 4 }}>
                  {c.description} ({c.weight}kg)
                  {c.is_dangerous ? <span style={{ color: 'red', marginLeft: 6 }}>Dangerous</span> : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
        {loggedIn && (!flightData.cargo || flightData.cargo.length === 0) && (
          <div style={{
            background: '#f2f7fb',
            borderTop: '1px solid #e3eafc',
            padding: '16px 24px 10px 24px',
            marginTop: 8,
            color: '#888'
          }}>
            <strong>No cargo for this flight.</strong>
          </div>
        )}
      </div>
    </SidePanel>
  );
}