// --- SESSION CHECK ---
let userData = JSON.parse(localStorage.getItem("user"));
if (!userData) window.location.href = "index.html";

window.onload = load;

async function load() {
    // Admin info check
    if(userData) {
        const sideName = document.getElementById("adminSideName");
        const profName = document.getElementById("admin-user-display");
        if(sideName) sideName.innerText = "Welcome, " + (userData.Username || "Admin");
        if(profName) profName.innerText = userData.Username;
    }

    try {
        const res = await fetch("/admin-complaints"); 
        const data = await res.json();

        if (Array.isArray(data)) {
            // Dashboard Stats Update (image_b5d870.png ke mutabiq)
            // Check karein ke HTML mein ye IDs hain: count-total, count-resolved, count-users
            if(document.getElementById('count-total')) document.getElementById('count-total').innerText = data.length;
            if(document.getElementById('count-resolved')) document.getElementById('count-resolved').innerText = data.filter(x => x.Status === 'Resolved').length;
            
            const uniqueStudents = [...new Set(data.map(x => x.SubmittedBy))].length;
            if(document.getElementById('count-users')) document.getElementById('count-users').innerText = uniqueStudents;

            // Complaint List Generate
            const list = document.getElementById("list");
            if(list) {
                list.innerHTML = data.map(x => `
                    <div class="card" style="margin-bottom:15px; padding:20px; border-radius:12px; border-left: 5px solid #4f46e5; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:bold; color:#1e1b4b;">ID: #${x.ComplaintID} - ${x.Title} (By: ${x.Username})</span>
                            <span class="status-badge ${x.Status.toLowerCase().replace(/\s+/g, '-')}">${x.Status}</span>
                        </div>
                        <p style="font-size:14px; color:#64748b; margin: 10px 0;">${x.Description}</p>
                        <button onclick="goToUpdate(${x.ComplaintID})" style="background:#4f46e5; color:white; border:none; padding:5px 15px; border-radius:5px; cursor:pointer;">Quick Edit</button>
                    </div>
                `).join("");
            }
        }
    } catch (err) {
        console.error("Failed to load admin data", err);
    }
}
function showSection(id, element) {
    const sections = ['dashboard', 'viewAll', 'updateStatus', 'settings', 'adminProfile'];
    sections.forEach(s => {
        const el = document.getElementById(s);
        if(el) el.style.display = 'none';
    });
    
    const target = document.getElementById(id);
    if(target) target.style.display = 'block';
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(element) element.classList.add('active');
    
    if(id === 'dashboard' || id === 'viewAll') load();
}

function toggleAccountMenu() {
    const menu = document.getElementById("account-submenu");
    menu.style.display = (menu.style.display === "none") ? "block" : "none";
}

async function updateAdminPassword() {
    const oldPass = document.getElementById("oldPassInput").value;
    const newPass = document.getElementById("newPassInput").value;
    const confirmPass = document.getElementById("confirmPassInput").value;

    if (!oldPass || !newPass || !confirmPass) return alert("Validation Error: All fields are required.");
    if (newPass !== confirmPass) return alert("Error: New passwords do not match.");

    try {
        const res = await fetch("/update-password", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userData.UserID || userData.id, oldPassword: oldPass, newPassword: newPass })
        });
        const result = await res.json();
        if (res.ok) {
            alert("Success: Password updated successfully.");
            location.reload();
        } else {
            alert("Error: " + result.message);
        }
    } catch (err) {
        alert("System Error: Server connection failed.");
    }
}

function updateStatusManual() {
    const id = document.getElementById('targetId').value;
    const status = document.getElementById('newStatus').value;
    if(!id) return alert("Please enter a Complaint ID.");

    fetch("/status/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status })
    }).then(res => {
        if(res.ok) {
            alert("Success: Status updated to " + status);
            showSection('viewAll', document.getElementById('menu-view'));
        } else {
            alert("Error: Could not update status.");
        }
    });
}

function goToUpdate(id) {
    document.getElementById('targetId').value = id;
    showSection('updateStatus', document.getElementById('menu-update'));
}

function logout() { 
    if(confirm("Are you sure you want to sign out?")) {
        localStorage.clear(); 
        location.href = "index.html"; 
    }
}
async function handleAdminLogin() {
    const user = document.getElementById("adminUser").value;
    const pass = document.getElementById("adminPass").value;

    const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            username: user, 
            password: pass, 
            role: "Admin"
        })
    });
    
    if(res.ok) {
        const data = await res.json();
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "admin_dashboard.html";
    } else {
        alert("only admin can login here");
    }
}