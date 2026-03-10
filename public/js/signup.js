// URL se role nikalna (Student/Admin)
const params = new URLSearchParams(window.location.search);
const role = params.get("role") || "Student";

// Agar koi manually Admin signup karne ki koshish kare
if (role.toLowerCase() === 'admin') {
    alert("Administrative accounts cannot be created manually.");
    window.location.href = "login.html?role=Admin";
}

function signup() {
    // HTML elements ko pakarna
    const username = document.getElementById('username');
    const pass = document.getElementById('pass');
    const session = document.getElementById('session');

    // Basic Validation: Check karna ke koi field khali na ho
    if (!username.value || !pass.value || !session.value) {
        alert("All fields are required! Please fill Roll Number, Session, and Password.");
        return;
    }

    // Backend (Server) ko data bhejna
    fetch("/signup", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({
            username: username.value, 
            password: pass.value,
            session: session.value,
            role: "Student" // Hamesha Student hi register hoga
        })
    })
    .then(async response => {
        // Server se JSON response pakarna
        const data = await response.json();

        if (response.ok) {
            // Agar registration successful ho jaye
            alert("Account Created Successfully! Redirecting to Dashboard...");
            
            // User data ko local storage mein save karna taake dashboard pe nazar aaye
            localStorage.setItem("user", JSON.stringify(data.user || { Username: username.value, Role: "Student" }));
            
            // Dashboard par bhej dena
            window.location.href = "student-dashboard.html";
        } else {
            // Agar server koi error de (e.g. User already exists)
            alert("Error: " + (data.message || "Registration failed. Please try again."));
        }
    })
    .catch(error => {
        console.error("Signup Error:", error);
        alert("Server is not responding! Make sure your Node.js server is running on port 3000.");
    });
}