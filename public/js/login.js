// URL se role lena (e.g., login.html?role=Admin)
const params = new URLSearchParams(window.location.search);
const role = params.get("role") || "Student";

document.addEventListener("DOMContentLoaded", () => {
    const userField = document.getElementById('username');
    const resetUserField = document.getElementById('resetUser');
    const loginTitle = document.getElementById('loginTitle');
    const regGroup = document.getElementById('registerGroup'); // Registration section ki ID

    // --- Role Based Logic ---
    if (role === 'Admin') {
        // Admin View Settings
        if (userField) userField.placeholder = "Enter Admin Username";
        if (resetUserField) resetUserField.placeholder = "Enter Admin Username";
        if (loginTitle) loginTitle.innerText = "Admin Login";
        
        // 🚫 Admin ke liye register wala section khatam (hide)
        if (regGroup) {
            regGroup.style.display = 'none'; 
        }
    } else {
        // Student View Settings
        if (userField) userField.placeholder = "Enter Roll Number";
        if (resetUserField) resetUserField.placeholder = "Enter Roll Number";
        if (loginTitle) loginTitle.innerText = "Student Login";
        
        // Student ke liye register dikhao
        if (regGroup) {
            regGroup.style.display = 'block';
        }
    }
});

// --- UI Toggle (Login <-> Reset) ---
function showResetForm() {
    document.getElementById('loginCard').style.display = 'none';
    document.getElementById('resetCard').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('resetCard').style.display = 'none';
    document.getElementById('loginCard').style.display = 'block';
}

// --- Login Function ---
function login() {
    const username = document.getElementById('username').value;
    const pass = document.getElementById('pass').value;

    if (!username || !pass) {
        alert("⚠️ fill out all fiels");
        return;
    }

    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: pass, role: role })
    })
    .then(async r => {
        const data = await r.json();
        if (!r.ok) throw data.message || "Invalid Login";
        
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Dashboard redirection
        if (data.user.Role === "Admin") {
            window.location.href = "admin-dashboard.html";
        } else {
            window.location.href = "student-dashboard.html";
        }
    })
    .catch(e => alert("❌ " + e));
}

// --- Password Reset Function ---
function submitReset() {
    const username = document.getElementById('resetUser').value;
    const newPass = document.getElementById('newPass').value;
    const confirmPass = document.getElementById('confirmPass').value;

    if (!username || !newPass || !confirmPass) {
        alert("⚠️ please fill all fields");
        return;
    }

    if (newPass !== confirmPass) {
        alert("❌ Password not match.");
        return;
    }

    fetch("/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, newPassword: newPass })
    })
    .then(async r => {
        const data = await r.json();
        if (r.ok) {
            alert("✅ " + data.message);
            showLoginForm();
        } else {
            alert("❌ " + data.message);
        }
    })
    .catch(() => alert("⚠️ Server connection error. Restart your node server!"));
}