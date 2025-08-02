// middleware/logBooking.js
const fs = require('fs');
const path = require('path');

const logBooking = (req, res, next) => {
    const userId = req.body.user_id;
    const eventId = req.params.id;
    const timestamp = new Date().toISOString();

    const logLine = `[${timestamp}] Booking attempt - User: ${userId}, Event: ${eventId}, Seats: ${req.body.seats}\n`;

    fs.appendFile(
        path.join(__dirname, '../logs/bookings.log'),
        logLine,
        err => {
            if (err) console.error("Logging failed:", err);
        }
    );

    next();
};

module.exports = logBooking;
