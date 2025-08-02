import React, { useEffect, useState } from 'react';

function MyBookings() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return alert("Please log in to view your bookings.");

        try {
            const res = await fetch(`http://localhost:5000/api/events/bookings/${user.id}`);
            const data = await res.json();
            setBookings(data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
        }
    };



    const cancelBooking = async (bookingId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/events/cancel/${bookingId}`, {
                method: 'DELETE',
            });

            const data = await res.json();
            if (res.ok) {
                alert('Booking cancelled!');
                fetchBookings(); // Refresh the list
            } else {
                alert(data.error || 'Cancellation failed');
            }
        } catch (err) {
            alert('Error cancelling booking');
            console.error(err);
        }
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2>My Bookings</h2>
            {bookings.length === 0 ? (
                <p>No bookings yet.</p>
            ) : (
                <ul>
                    {bookings.map((b) => {
                        const eventDate = new Date(b.date);
                        const now = new Date();
                        const canCancel = eventDate > now;

                        return (
                            <li key={b.id} style={{ marginBottom: '1rem' }}>
                                <strong>{b.title}</strong><br />
                                📅 {b.date.split('T')[0]} at{' '}
                                {eventDate.toLocaleTimeString('en-US', {
                                    timeZone: 'UTC',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                })}{' '}
                                UTC
                                <br />
                                🎟️ Seats: {b.seats}
                                <br />
                                {canCancel && (
                                    <button
                                        onClick={() => cancelBooking(b.id)}
                                        style={{ marginTop: '8px' }}
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default MyBookings;
