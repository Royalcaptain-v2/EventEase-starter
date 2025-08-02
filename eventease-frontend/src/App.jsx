import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import MyBookings from './pages/MyBookings';

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function Home({ user }) {
  const [events, setEvents] = useState([]);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/events');
      const data = await res.json();
      setEvents(data.map(event => ({ ...event, selectedSeats: 1 })));
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const bookEvent = async (eventId, seats) => {
    if (!user) return alert("Please log in to book an event.");

    try {
      const res = await fetch(`http://localhost:5000/api/events/book/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, seats })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Booking successful!');
        fetchEvents();
      } else {
        alert(data.error || 'Booking failed');
      }
    } catch (err) {
      alert('Error booking event');
      console.error(err);
    }
  };

  const handleSeatChange = (eventId, seats) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId ? { ...event, selectedSeats: parseInt(seats) } : event
      )
    );
  };

  const getStatus = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    if (eventDate.toDateString() === now.toDateString()) return 'Ongoing';
    if (eventDate > now) return 'Upcoming';
    return 'Completed';
  };

  const filteredEvents = events.filter(event => {
    const matchesCategory = category === '' || event.category === category;
    const matchesLocation = location === '' || event.location === location;
    const eventDate = new Date(event.date);
    const afterStart = !startDate || eventDate >= new Date(startDate);
    const beforeEnd = !endDate || eventDate <= new Date(endDate);
    return matchesCategory && matchesLocation && afterStart && beforeEnd;
  });

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Available Events</h2>

      <div style={{ margin: "1rem 0" }}>
        <label>
          Category:
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ marginRight: '1rem' }}>
            <option value="">All</option>
            <option value="Music">Music</option>
            <option value="Technology">Technology</option>
            <option value="Health">Health</option>
            <option value="Business">Business</option>
          </select>
        </label>
        <label>
          Location:
          <select value={location} onChange={e => setLocation(e.target.value)} style={{ marginRight: '1rem' }}>
            <option value="">All</option>
            <option value="Online">Online</option>
            <option value="In-Person">In-Person</option>
          </select>
        </label>
        <label>
          Start Date:
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ marginRight: '1rem' }} />
        </label>
        <label>
          End Date:
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </label>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {filteredEvents.map(event => (
          <div key={event.id} style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: 'grey',
            color: 'white',
            maxWidth: '400px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <h3>{event.title}</h3>
            <p>📅 {formatDate(event.date)} at {new Date(event.date).toLocaleTimeString('en-US', {
              timeZone: 'UTC',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })} UTC</p>
            <p>🏷️ {event.category}</p>
            <p>📍 {event.location}</p>
            <p>Seats: {event.capacity}</p>
            <p>Status: <strong>{getStatus(event.date)}</strong></p>
            <div>
              <label>Seats:</label>
              <select
                value={event.selectedSeats}
                onChange={(e) => handleSeatChange(event.id, e.target.value)}
                style={{ marginRight: '0.5rem' }}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
              <button onClick={() => bookEvent(event.id, event.selectedSeats)} style={{
                marginTop: '12px',
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const linkStyle = {
  marginRight: '1rem',
  textDecoration: 'none',
  color: '#007bff'
};

const AdminRoute = ({ children, user }) => {
  if (!user || user.role !== 'admin') {
    alert("Access denied: Admins only");
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      const parsed = stored ? JSON.parse(stored) : null;
      setUser(parsed && typeof parsed === 'object' ? parsed : null);
    } catch {
      localStorage.removeItem('user');
      setUser(null);
    }

    const syncUser = () => {
      try {
        const latest = localStorage.getItem('user');
        const parsed = latest ? JSON.parse(latest) : null;
        setUser(parsed && typeof parsed === 'object' ? parsed : null);
      } catch {
        localStorage.removeItem('user');
        setUser(null);
      }
    };

    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <Router>
      <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
        <h1>EventEase - An Event Booking Platform</h1>
        <h3>Book Webinars, Conferences, and Workshops — All in one place.</h3>
        <nav>
          <Link to="/" style={linkStyle}>Home</Link> |{" "}
          {!user ? (
            <>
              <Link to="/login" style={linkStyle}>Login</Link> |{" "}
              <Link to="/register" style={linkStyle}>Register</Link>
            </>
          ) : (
            <>
              <Link to="/mybookings" style={linkStyle}>My Bookings</Link> |{" "}
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" style={linkStyle}>Admin</Link> |{" "}
                  <span style={{ marginRight: '1rem', color: '#28a745' }}>Admin Mode</span>
                </>
              )}
              {user.role === 'user' && (
                <span style={{ marginRight: '1rem', color: '#17a2b8' }}>User Mode</span>
              )}
              <button
                onClick={handleLogout}
                style={{
                  ...linkStyle,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Logout
              </button>
            </>
          )}
        </nav>


        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin"
            element={
              <AdminRoute user={user}>
                <Admin />
              </AdminRoute>
            }
          />
          <Route path="/mybookings" element={<MyBookings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
