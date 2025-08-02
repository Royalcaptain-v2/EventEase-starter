import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}


function Admin() {
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        category: '',
        location: 'Online',
        capacity: ''
    });
    const [events, setEvents] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/events');
            const data = await res.json();
            setEvents(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingId
                ? `http://localhost:5000/api/events/${editingId}`
                : 'http://localhost:5000/api/events';

            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert(editingId ? 'Event updated!' : 'Event created!');
                setFormData({
                    title: '',
                    date: '',
                    category: '',
                    location: 'Online',
                    capacity: ''
                });
                setEditingId(null);
                fetchEvents();
            } else {
                alert('Failed to save event');
            }
        } catch (err) {
            console.error(err);
            alert('Error occurred');
        }
    };

    const handleEdit = (event) => {
        setEditingId(event.id);
        setFormData({
            title: event.title,
            date: formatDate(event.date),
            category: event.category,
            location: event.location,
            capacity: event.capacity
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this event?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/events/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('Event deleted');
                fetchEvents();
            } else {
                alert('Delete failed');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const showAttendees = async (eventId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/events/${eventId}/attendees`);
            const data = await res.json();
            setAttendees(data);
            setSelectedEventId(eventId);
        } catch (err) {
            console.error('Error fetching attendees:', err);
            alert('Failed to load attendees');
        }
    };

    const getEventStatus = (dateString) => {
        const now = new Date();
        const eventDate = new Date(dateString);
        if (eventDate.toDateString() === now.toDateString()) return 'Ongoing';
        if (eventDate > now) return 'Upcoming';
        return 'Completed';
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h2>{editingId ? 'Edit Event' : 'Create a New Event'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px' }}>
                <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
                <input name="date" type="date" value={formData.date} onChange={handleChange} required />
                <input name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
                <select name="location" value={formData.location} onChange={handleChange}>
                    <option value="Online">Online</option>
                    <option value="In-Person">In-Person</option>
                </select>
                <input name="capacity" type="number" placeholder="Capacity" value={formData.capacity} onChange={handleChange} required />
                <button type="submit" style={{ marginTop: '1rem', padding: '0.5rem' }}>
                    {editingId ? 'Update Event' : 'Create Event'}
                </button>
            </form>

            <h3 style={{ marginTop: '2rem' }}>All Events</h3>
            {events.map(event => (
                <div key={event.id} style={{ borderBottom: '1px solid #ccc', padding: '1rem 0' }}>
                    <strong>{event.title}</strong><br />
                    📅 {formatDate(event.date)}<br />
                    📌 Category: {event.category} | 📍 {event.location} | 🎟️ Capacity: {event.capacity}<br />
                    🆔 ID: <strong>{event.id}</strong> | 🧾 Code: <strong>{event.event_code || 'N/A'}</strong><br />
                    Status: <strong>{getEventStatus(event.date)}</strong><br />
                    <button onClick={() => handleEdit(event)} style={{ marginRight: '0.5rem' }}>Edit</button>
                    <button onClick={() => handleDelete(event.id)} style={{ marginRight: '0.5rem', color: 'red' }}>Delete</button>
                    <button onClick={() => showAttendees(event.id)}>View Attendees</button>
                </div>
            ))}

            {selectedEventId && (
                <div style={{ marginTop: '2rem' }}>
                    <h4>Attendees for Event ID: {selectedEventId}</h4>
                    {attendees.length === 0 ? (
                        <p>No attendees yet.</p>
                    ) : (
                        <ul>
                            {attendees.map((a, i) => (
                                <li key={i}>{a.name} ({a.email}) — {a.seats} seat(s)</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default Admin;
