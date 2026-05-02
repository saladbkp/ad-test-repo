const API_BASE = '/'

// Utility function to format date with timezone
function formatDateWithTimezone(datetimeLocalString) {
    if (!datetimeLocalString) return datetimeLocalString;
    
    // Create a Date object from the datetime-local string
    const date = new Date(datetimeLocalString);
    
    // Format as ISO string with timezone information
    return date.toISOString();
}

// Helper for authenticated requests
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    return fetch(API_BASE + url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
}

// Public APIs
export async function getAirports() {
    const res = await fetch(API_BASE + 'airports');
    return res.json();
}

export async function getFlights() {
    const res = await fetch(API_BASE + 'flights');
    return res.json();
}

export async function register({ username, password, token }) {
    const res = await fetch(API_BASE + 'register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, token }),
    });
    return res.json();
}

export async function login({ username, password }) {
    const res = await fetch(API_BASE + 'login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    return res.json();
}

// Authenticated APIs

export async function createFlight(flight) {
    // Format dates with timezone information
    const formattedFlight = {
        ...flight,
        departure: formatDateWithTimezone(flight.departure),
        arrival: formatDateWithTimezone(flight.arrival),
    };
    
    const res = await authFetch('flights', {
        method: 'POST',
        body: JSON.stringify(formattedFlight),
    });
    return res.json();
}

export async function getFlightById(id) {
    const res = await authFetch(`flights/${id}`);
    return res.json();
}

export async function addCargo(flightId, cargo) {
    const res = await authFetch(`flights/${flightId}/cargo`, {
        method: 'POST',
        body: JSON.stringify(cargo),
    });
    return res.json();
}

export async function getGroups() {
    const res = await fetch(API_BASE + 'groups');
    return res.json();
}

export async function createGroup(name) {
    const res = await authFetch('groups', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
    return res.json();
}

export async function getFlightPicture(id) {
    const res = await fetch(API_BASE + `flights/${id}/picture`);
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
}

export async function uploadFlightPicture(flightId, file) {
	const formData = new FormData();
	formData.append('picture', file);
	const token = localStorage.getItem('token');
	const res = await fetch(API_BASE + `flights/${flightId}/picture`, {
		method: 'POST',
		headers: {
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			// Do not set 'Content-Type', browser will set it automatically for FormData
		},
		body: formData,
	});
	return res.json();
}

export async function getMyFlights() {
    const res = await authFetch('my-flights');
    return res.json();
}