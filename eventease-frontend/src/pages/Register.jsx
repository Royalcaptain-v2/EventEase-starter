import React, { useState } from 'react';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();
            if (res.ok) {
                alert(' Registered successfully! Now login.');
            } else {
                alert(` ${data.message || data.error}`);
            }
        } catch (err) {
            alert(' Server error');
        }
    };


    return (
        <div style={styles.container}>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={styles.input} />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} />
                <button type="submit" style={styles.button}>Register</button>
            </form>
        </div>
    );
}

const styles = {
    container: { padding: "2rem", fontFamily: "Arial" },
    input: { display: "block", margin: "10px 0", padding: "8px", width: "250px" },
    button: { padding: "10px 20px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px" }
};

export default Register;
