const params = new URLSearchParams(window.location.search);
const role = params.get("role") || "Student";

if (role.toLowerCase() === 'admin') {
    alert("Administrative accounts cannot be created manually.");
    window.location.href = "login.html?role=Admin";
}

function signup() {
    const username = document.getElementById('username');
    const pass = document.getElementById('pass');
    const session = document.getElementById('session');

    if (!username.value || !pass.value) {
        alert("All fields required");
        return;
    }

    // Backend ke "/signup" route ko hit kar rahe hain
    fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: username.value, 
            password: pass.value,
            session: session.value,
            role: "Student"
        })
    })
    .then(async r => {
        const data = await r.json(); // Ab JSON hi milega, HTML nahi
        if (!r.ok) throw new Error(data.message);
        
        alert("Account Created Successfully!");
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "student-dashboard.html";
    })
    .catch(e => {
        console.error(e);
        alert("Error: " + e.message);
    });
}