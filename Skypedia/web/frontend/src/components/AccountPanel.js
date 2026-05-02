import React, { useState, useEffect } from 'react';
import {
  register,
  login,
  createGroup,
  createFlight,
  addCargo,
  getGroups,
  getMyFlights,
  uploadFlightPicture,
} from '../services/api';
import SidePanel from './SidePanel';
import FlightInfoPanel from './FlightInfoPanel';

const MAX_PICTURE_SIZE = 10240; // 10KB

export default function AccountPanel({ open, setOpen, airports, groups, setFlights, loggedIn, setLoggedIn }) {
  // Auth state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [groupToken, setGroupToken] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [activeTab, setActiveTab] = useState('login');

  // Group creation
  const [newGroupName, setNewGroupName] = useState('');
  const [groupCreateMsg, setGroupCreateMsg] = useState('');
  const [groupList, setGroupList] = useState(groups || []);

  // Flight creation
  const [flightNumber, setFlightNumber] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [flightMsg, setFlightMsg] = useState('');
  const [flightPicture, setFlightPicture] = useState(null); // <-- new state

  // Cargo creation
  const [flightId, setFlightId] = useState('');
  const [cargoDesc, setCargoDesc] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [cargoDanger, setCargoDanger] = useState(false);
  const [cargoMsg, setCargoMsg] = useState('');

  // Fetch user's flights
  const [myFlights, setMyFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null); // State for selected flight

  // Refresh group list on open
  useEffect(() => {
    if (open) {
      getGroups().then(setGroupList);
    }
  }, [open]);

  useEffect(() => {
    if (loggedIn && (activeTab === 'flight' || activeTab === 'cargo')) {
      getMyFlights().then(setMyFlights).catch(() => setMyFlights([]));
    }
  }, [loggedIn, activeTab]);

  // Handle login
  const handleLogin = async e => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await login({ username, password });
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', username);
        setLoggedIn(true);
        setActiveTab('flight');
      } else {
        setLoginError(res.error || 'Login failed');
      }
    } catch (err) {
      setLoginError('Login failed');
    }
  };

  // Handle register
  const handleRegister = async e => {
    e.preventDefault();
    setRegisterError('');
    try {
      const res = await register({ username, password, token: groupToken });
      if (res.username) {
        setActiveTab('login');
      } else {
        setRegisterError(res.error || 'Register failed');
      }
    } catch (err) {
      setRegisterError('Register failed');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setLoggedIn(false);
    setActiveTab('login');
  };

  // Handle group creation
  const handleGroupCreate = async e => {
    e.preventDefault();
    setGroupCreateMsg('');
    try {
      const res = await createGroup(newGroupName);
      if (res.token) {
        setGroupCreateMsg(`Group created! Token: ${res.token}`);
        getGroups().then(setGroupList);
      } else {
        setGroupCreateMsg(res.error || 'Group creation failed');
      }
    } catch (err) {
      setGroupCreateMsg('Group creation failed');
    }
  };

  // Handle flight creation (with picture upload)
  const handleFlightCreate = async e => {
    e.preventDefault();
    setFlightMsg('');
    try {
      const res = await createFlight({
        flightNumber,
        origin,
        destination,
        departure,
        arrival,
      });
      if (res.id) {
        let picMsg = '';
        if (flightPicture) {
          try {
            const picRes = await uploadFlightPicture(res.id, flightPicture);
            if (picRes && picRes.message) {
              picMsg = ' Picture uploaded!';
            } else if (picRes && picRes.error) {
              picMsg = ' Picture upload failed: ' + picRes.error;
            }
          } catch (err) {
            picMsg = ' Picture upload failed.';
          }
        }
        setFlightMsg(`Flight created! ID: ${res.id}.${picMsg}`);
        getMyFlights().then(setMyFlights).catch(() => setMyFlights([])); // Refetch flights
      } else {
        setFlightMsg(res.error || 'Flight creation failed');
      }
    } catch (err) {
      setFlightMsg('Flight creation failed');
    }
  };

  // Handle cargo creation
  const handleCargoCreate = async e => {
    e.preventDefault();
    setCargoMsg('');
    try {
      const res = await addCargo(flightId, {
        description: cargoDesc,
        weight: Number(cargoWeight),
        isDangerous: cargoDanger,
      });
      if (res.id) {
        setCargoMsg('Cargo added!');
      } else {
        setCargoMsg(res.error || 'Cargo creation failed');
      }
    } catch (err) {
      setCargoMsg('Cargo creation failed');
    }
  };

  // Show only the first 7 groups and a link to view all groups in JSON format
  const renderGroupList = () => {
    if (groupList.length <= 7) {
      return groupList.map(g => (
        <li key={g.name || g}>{g.name || g}</li>
      ));
    }
    return (
      <>
        {groupList.slice(0, 7).map(g => (
          <li key={g.name || g}>{g.name || g}</li>
        ))}
        <li>
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              const jsonWindow = window.open();
              jsonWindow.document.write('<pre>' + JSON.stringify(groupList, null, 2) + '</pre>');
              jsonWindow.document.close();
            }}
            style={{ color: '#1976d2', cursor: 'pointer' }}
          >
            Show all
          </a>
        </li>
      </>
    );
  };

  // Tab buttons
  const tabBtn = (tab, label) => (
    <button
      onClick={() => setActiveTab(tab)}
      style={{
        padding: '6px 16px',
        marginRight: 8,
        border: activeTab === tab ? '2px solid #1976d2' : '1px solid #ccc',
        background: activeTab === tab ? '#e3f0ff' : '#fff',
        borderRadius: 4,
        cursor: 'pointer',
        fontWeight: activeTab === tab ? 'bold' : 'normal',
        marginBottom: 6
      }}
      disabled={activeTab === tab}
    >
      {label}
    </button>
  );

  return (
    <SidePanel open={open} setOpen={setOpen} zIndex={1300}>
      <div
        style={{
          background: '#f7fafd',
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          padding: '20px 18px 18px 18px',
          marginBottom: 12,
        }}
      >
        {/* Session row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          {!loggedIn ? (
            <div style={{ display: 'flex', gap: 8 }}>
              {tabBtn('login', 'Login')}
              {tabBtn('register', 'Register')}
            </div>
          ) : (
            <button
              onClick={handleLogout}
              style={{
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '6px 10px',
                cursor: 'pointer',
                color: '#1976d2',
                fontWeight: 600
              }}
            >
              Logout ({localStorage.getItem('username')})
            </button>
          )}
        </div>
        {/* Functionality row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {tabBtn('group', 'Groups')}
          {loggedIn && tabBtn('flight', 'Create Flight')}
          {loggedIn && tabBtn('cargo', 'Add Cargo')}
        </div>
        {/* Panels */}
        {!loggedIn && activeTab === 'login' && (
          <form onSubmit={handleLogin}>
            <h3 style={{ color: '#1976d2', margin: '0 0 10px 0' }}>Login</h3>
            <input
              type="text"
              placeholder="Username"
              value={username}
              autoComplete="username"
              onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', marginBottom: 8, borderRadius: 6, padding: 4, boxSizing: 'border-box', height: 36 }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              autoComplete="current-password"
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', marginBottom: 8, borderRadius: 6, padding: 4, boxSizing: 'border-box', height: 36 }}
            />
            <button type="submit" style={{ width: '100%', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', padding: 8 }}>Login</button>
            {loginError && <div style={{ color: 'red', marginTop: 8 }}>{loginError}</div>}
          </form>
        )}
        {!loggedIn && activeTab === 'register' && (
          <form onSubmit={handleRegister}>
            <h3 style={{ color: '#1976d2', margin: '0 0 10px 0' }}>Register</h3>
            <input
              type="text"
              placeholder="Username"
              value={username}
              autoComplete="username"
              onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', marginBottom: 8, borderRadius: 6, padding: 4, boxSizing: 'border-box', height: 36 }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              autoComplete="new-password"
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', marginBottom: 8, borderRadius: 6, padding: 4, boxSizing: 'border-box', height: 36 }}
            />
            <input
              type="text"
              placeholder="Group token (optional)"
              value={groupToken}
              onChange={e => setGroupToken(e.target.value)}
              style={{ width: '100%', marginBottom: 8, borderRadius: 6, padding: 4, boxSizing: 'border-box', height: 36 }}
            />
            <button type="submit" style={{ width: '100%', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', padding: 8 }}>Register</button>
            {registerError && <div style={{ color: 'red', marginTop: 8 }}>{registerError}</div>}
          </form>
        )}
        {activeTab === 'group' && (
          <form onSubmit={handleGroupCreate}>
            <h3 style={{ color: '#1976d2', margin: '0 0 10px 0' }}>Create Group</h3>
            <input
              type="text"
              placeholder="Group Name (A-Z, 3-10 chars)"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              style={{ width: '100%', marginBottom: 8, borderRadius: 6, padding: 4, boxSizing: 'border-box', height: 36 }}
            />
            <button type="submit" style={{ width: '100%', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', padding: 8 }}>Create Group</button>
            {groupCreateMsg && <div style={{ color: groupCreateMsg.startsWith('Group created!') ? 'green' : 'red', marginTop: 8 }}>{groupCreateMsg}</div>}
            <div style={{ marginTop: 12 }}>
              <strong>Available Groups:</strong>
              <ul>
                {renderGroupList()}
              </ul>
            </div>
          </form>
        )}
        {loggedIn && activeTab === 'flight' && (
          <form
            onSubmit={e => {
              e.preventDefault();
              if (flightPicture && flightPicture.size > MAX_PICTURE_SIZE) {
                alert('File too large! Max 100KB.');
                return;
              }
              handleFlightCreate(e);
            }}
          >
            <h3 style={{ color: '#1976d2', margin: '0 0 10px 0' }}>Create Flight</h3>
            {/* Origin and Destination on the same line */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <select
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                style={{ flex: 1, borderRadius: 6, padding: 4 }}
              >
                <option value="">Origin</option>
                {airports.map(a =>
                  <option key={a.code} value={a.code}>{a.code}</option>
                )}
              </select>
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                style={{ flex: 1, borderRadius: 6, padding: 4 }}
              >
                <option value="">Destination</option>
                {airports.map(a =>
                  <option key={a.code} value={a.code}>{a.code}</option>
                )}
              </select>
            </div>
            {/* Departure and Arrival on the same line */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="datetime-local"
                placeholder="Departure"
                value={departure}
                onChange={e => setDeparture(e.target.value)}
                style={{ flex: 1, borderRadius: 6, padding: 4, minWidth: 0 }}
              />
              <input
                type="datetime-local"
                placeholder="Arrival"
                value={arrival}
                onChange={e => setArrival(e.target.value)}
                style={{ flex: 1, borderRadius: 6, padding: 4, minWidth: 0 }}
              />
            </div>
            {/* Flight number and file input on the same line, styled */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Flight Number"
                value={flightNumber}
                onChange={e => setFlightNumber(e.target.value)}
                style={{
                  flex: 1,
                  borderRadius: 6,
                  padding: 4,
                  boxSizing: 'border-box',
                  height: 36,
                  minWidth: 0
                }}
              />
              <label
                htmlFor="flight-picture-upload"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 36,
                  background: '#f3f3f3',
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  color: '#444',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: 14,
                  minWidth: 0,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  position: 'relative'
                }}
                title={`Optional: Upload a plane picture (max ${MAX_PICTURE_SIZE / 1024}kb)`}
              >
                <span style={{ flex: 1, textAlign: 'center', pointerEvents: 'none', display: 'block' }}>
                  {flightPicture ? (
                    <>
                      Selected: {flightPicture.name} ({Math.round(flightPicture.size / 1024)} KB)
                      <br />
                      <span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>
                        optional, max {MAX_PICTURE_SIZE / 1024}KB
                      </span>
                    </>
                  ) : (
                    <>
                      Choose file
                      <br />
                      <span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>
                        optional, max {MAX_PICTURE_SIZE / 1024}KB
                      </span>
                    </>
                  )}
                </span>
                <input
                  id="flight-picture-upload"
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file && file.size > MAX_PICTURE_SIZE) {
                      alert('File too large! Max 100KB.');
                      e.target.value = '';
                      setFlightPicture(null);
                    } else {
                      setFlightPicture(file);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                  tabIndex={-1}
                />
              </label>
            </div>
            <button type="submit" style={{ width: '100%', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', padding: 8 }}>Create Flight</button>
            {flightMsg && (
              <div
                style={{
                  color: flightMsg.startsWith('Flight created!') ? 'green' : 'red',
                  marginTop: 8
                }}
              >
                {flightMsg}
              </div>
            )}
          </form>
        )}
        {loggedIn && activeTab === 'cargo' && (
          <form onSubmit={handleCargoCreate}>
            <h3 style={{ color: '#1976d2', margin: '0 0 10px 0' }}>Add Cargo</h3>
            <input
              type="text"
              placeholder="Flight ID"
              value={flightId}
              onChange={e => setFlightId(e.target.value)}
              style={{ width: '100%', marginBottom: 8, borderRadius: 6, padding: 4, boxSizing: 'border-box', height: 36 }}
            />
            <input
              type="text"
              placeholder="Description"
              value={cargoDesc}
              onChange={e => setCargoDesc(e.target.value)}
              style={{ width: '100%', marginBottom: 8, borderRadius: 6, padding: 4, boxSizing: 'border-box', height: 36 }}
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              value={cargoWeight}
              onChange={e => setCargoWeight(e.target.value)}
              style={{ width: '100%', marginBottom: 8, borderRadius: 6, padding: 4, boxSizing: 'border-box', height: 36 }}
            />
            <label style={{ marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={cargoDanger}
                onChange={e => setCargoDanger(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Dangerous
            </label>
            <button type="submit" style={{ width: '100%', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', padding: 8 }}>Add Cargo</button>
            {cargoMsg && <div style={{ color: cargoMsg === 'Cargo added!' ? 'green' : 'red', marginTop: 8 }}>{cargoMsg}</div>}
          </form>
        )}

        {/* My Flights Section */}
        {loggedIn && (activeTab === 'flight' || activeTab === 'cargo') && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ color: '#1976d2', margin: '0 0 10px 0' }}>My Flights</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {myFlights.map(f => (
                <li
                  key={f.id}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e3eafc',
                    borderRadius: 6,
                    marginBottom: 8,
                    cursor: 'pointer',
                    background: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                  }}
                  onClick={() => setSelectedFlight(f)}
                >
                  {f.id} - {f.flight_number}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Flight Info Panel */}
        {selectedFlight && (
          <FlightInfoPanel
            open={!!selectedFlight}
            setOpen={() => setSelectedFlight(null)}
            flightData={selectedFlight}
            loggedIn={loggedIn}
            airports={airports}
          />
        )}
        {!loggedIn && (
          <div style={{ marginTop: 16, color: '#888', fontSize: 14 }}>
            Not logged in.
          </div>
        )}
      </div>
    </SidePanel>
  );
}