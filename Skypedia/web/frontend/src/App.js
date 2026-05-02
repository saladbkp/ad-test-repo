import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import FilterPanel from './components/FilterPanel';
import AccountPanel from './components/AccountPanel';
import FlightInfoPanel from './components/FlightInfoPanel';
import { getFlights, getAirports, getGroups, getFlightById } from './services/api';

export default function App() {
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  const [groups, setGroups] = useState([]);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    depAfter: '',
    depBefore: '',
    arrAfter: '',
    arrBefore: '',
    group: ''
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [flightInfoOpen, setFlightInfoOpen] = useState(false);
  const [flightInfoData, setFlightInfoData] = useState(null);
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));

  // Fetch data on mount
  useEffect(() => {
    getFlights().then(setFlights);
    getAirports().then(setAirports);
    getGroups().then(setGroups);
  }, []);

  // Move flights every second (force update)
  useEffect(() => {
    const interval = setInterval(() => {
      setFlights(prev => prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtering logic (client-side)
  const filteredFlights = flights.filter(f => {
    if (filters.from && f.origin !== filters.from) return false;
    if (filters.to && f.destination !== filters.to) return false;
    if (filters.depAfter && new Date(f.departure) < new Date(filters.depAfter)) return false;
    if (filters.depBefore && new Date(f.departure) > new Date(filters.depBefore)) return false;
    if (filters.arrAfter && new Date(f.arrival) < new Date(filters.arrAfter)) return false;
    if (filters.arrBefore && new Date(f.arrival) > new Date(filters.arrBefore)) return false;
    if (filters.group && f.owner && !f.owner.toLowerCase().includes(filters.group.toLowerCase())) return false;
    return true;
  });

  // Show flight info panel on marker click
  const handleFlightClick = async (flight) => {
    let data;
    if (loggedIn) {
      data = await getFlightById(flight.id);
    } else {
      data = flight;
    }
    setFlightInfoData(data);
    setFlightInfoOpen(true);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <MapView
        flights={filteredFlights}
        airports={airports}
        onFlightClick={handleFlightClick}
      />
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        width: 'calc(100vw - 40px)'
      }}>
        <button
          onClick={() => setFilterOpen(true)}
          style={{
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '6px 10px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
          aria-label="Show filters"
        >
          ☰ Filters
        </button>
        <button
          onClick={() => setAccountOpen(true)}
          style={{
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '6px 10px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
          aria-label="Show account"
        >
          👤 Account
        </button>
        <span style={{
          fontSize: 28,
          fontWeight: 700,
          color: 'white',
          letterSpacing: 1,
          textShadow: '0 2px 8px rgba(25,118,210,0.08)',
          fontFamily: 'Segoe UI, Arial, sans-serif'
        }}>
          Skypedia
        </span>
      </div>
      {/* dark gradient on top */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1000,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.0) 15%)'
        }}
      />
      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        airports={airports}
        groups={groups}
        open={filterOpen}
        setOpen={setFilterOpen}
        overlay
      />
      <AccountPanel
        open={accountOpen}
        setOpen={setAccountOpen}
        airports={airports}
        groups={groups}
        setFlights={setFlights}
        loggedIn={loggedIn}
        setLoggedIn={setLoggedIn}
      />
      <FlightInfoPanel
        open={flightInfoOpen}
        setOpen={setFlightInfoOpen}
        flightData={flightInfoData}
        loggedIn={loggedIn}
        airports={airports}
      />
    </div>
  );
}
