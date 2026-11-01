// Dynamic Base URL Configuration
const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://hrgenius-backend.onrender.com/api";

// User Login Function
async function loginUser() {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    try {
        const response = await fetch(`${API}/auth/login`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        console.log("Login Response:", data);

        if (!response.ok) {
            alert(data.message || "Invalid email or password");
            return;
        }

        if (!data.token || !data.user) {
            alert("Login response is incomplete");
            return;
        }

        // Token aur user details save karke dashboard par redirect karein
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "dashboard.html";

    } catch (error) {
        console.error("Login Error:", error);
        alert("Server connection error");
    }
}