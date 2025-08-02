const express = require('express');
const db = require('../db');
const router = express.Router();

// Utility for generating event code
function generateEventCode(dateStr) {
    const date = new Date(dateStr);
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `EVT-${months[date.getMonth()]}${date.getFullYear()}-${random}`;
}

// Utility to format date as DD-MMM-YYYY
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Middleware: Log booking
const logBooking = async (req, res, next) => {
    const { user_id } = req.body;
    console.log(`[BOOKING LOG] User ${user_id} is attempting to book at ${new Date().toISOString()}`);
    next();
};

// GET all events with formatted date
router.get('/', async (req, res) => {
    try {
        const [events] = await db.query('SELECT * FROM events');
        const formatted = events.map(e => ({
            ...e,
            date: formatDate(e.date)
        }));
        res.json(formatted);
    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// CREATE a new event
router.post('/', async (req, res) => {
    const { title, date, category, location, capacity } = req.body;
    const eventCode = generateEventCode(date);

    try {
        await db.query(
            'INSERT INTO events (title, date, category, location, capacity, event_code) VALUES (?, ?, ?, ?, ?, ?)',
            [title, date, category, location, capacity, eventCode]
        );
        res.status(201).json({ message: 'Event created successfully', event_code: eventCode });
    } catch (err) {
        console.error('Event creation error:', err);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// BOOK an event (max 2 seats per user, capacity check)
router.post('/book/:id', logBooking, async (req, res) => {
    const eventId = req.params.id;
    const { user_id, seats } = req.body;
    const seatsNum = parseInt(seats);

    if (!user_id || !seatsNum) {
        return res.status(400).json({ error: 'Missing user_id or seats' });
    }

    if (seatsNum < 1 || seatsNum > 2) {
        return res.status(400).json({ error: 'You can only book 1 or 2 seats per event' });
    }

    try {
        const [[event]] = await db.query('SELECT capacity, booked_seats FROM events WHERE id = ?', [eventId]);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        if (event.booked_seats + seatsNum > event.capacity) {
            return res.status(400).json({ error: 'Not enough seats available' });
        }

        const [[userBooking]] = await db.query(
            'SELECT SUM(seats) AS total FROM bookings WHERE user_id = ? AND event_id = ?',
            [user_id, eventId]
        );
        const alreadyBooked = parseInt(userBooking.total) || 0;

        if (alreadyBooked + seatsNum > 2) {
            return res.status(400).json({
                error: `You can only book up to 2 seats for this event. You've already booked ${alreadyBooked}`
            });
        }

        await db.query('INSERT INTO bookings (user_id, event_id, seats) VALUES (?, ?, ?)', [user_id, eventId, seatsNum]);
        await db.query('UPDATE events SET booked_seats = booked_seats + ? WHERE id = ?', [seatsNum, eventId]);

        res.json({ message: 'Booking successful' });
    } catch (err) {
        console.error('Booking error:', err);
        res.status(500).json({ error: 'Booking failed' });
    }
});

// GET bookings for a user
router.get('/bookings/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const [bookings] = await db.query(
            `SELECT b.id, e.title, e.date, b.seats
             FROM bookings b
             JOIN events e ON b.event_id = e.id
             WHERE b.user_id = ?`,
            [userId]
        );
        const formatted = bookings.map(b => ({
            ...b,
            date: formatDate(b.date)
        }));
        res.json(formatted);
    } catch (err) {
        console.error('Error fetching user bookings:', err);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// CANCEL a booking
router.delete('/cancel/:bookingId', async (req, res) => {
    const bookingId = req.params.bookingId;

    try {
        const [[booking]] = await db.query(
            'SELECT event_id, seats FROM bookings WHERE id = ?',
            [bookingId]
        );
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        await db.query('DELETE FROM bookings WHERE id = ?', [bookingId]);
        await db.query('UPDATE events SET booked_seats = booked_seats - ? WHERE id = ?', [booking.seats, booking.event_id]);

        res.json({ message: 'Booking cancelled' });
    } catch (err) {
        console.error('Error cancelling booking:', err);
        res.status(500).json({ error: 'Cancellation failed' });
    }
});

// UPDATE event
router.put('/:id', async (req, res) => {
    const eventId = req.params.id;
    const { title, date, category, location, capacity } = req.body;

    try {
        await db.query(
            `UPDATE events 
             SET title = ?, date = ?, category = ?, location = ?, capacity = ? 
             WHERE id = ?`,
            [title, date, category, location, capacity, eventId]
        );
        res.json({ message: 'Event updated successfully' });
    } catch (err) {
        console.error('Error updating event:', err);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// DELETE event
router.delete('/:id', async (req, res) => {
    const eventId = req.params.id;

    try {
        await db.query('DELETE FROM events WHERE id = ?', [eventId]);
        res.json({ message: 'Event deleted' });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// GET attendees for a specific event
router.get('/:eventId/attendees', async (req, res) => {
    const eventId = req.params.eventId;

    try {
        const [attendees] = await db.query(
            `SELECT u.name, u.email, b.seats
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             WHERE b.event_id = ?`,
            [eventId]
        );
        res.json(attendees);
    } catch (err) {
        console.error('Error fetching attendees:', err);
        res.status(500).json({ error: 'Failed to fetch attendees' });
    }
});

module.exports = router;
