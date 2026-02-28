let userData = JSON.parse(localStorage.getItem("user"));
if (!userData) window.location.href = "index.html";

window.onload = load;

async function load() {
    // Admin info in sidebar
    if(userData) {
        document.getElementById("adminSideName").innerText = "👤 " + userData.Username;
        if(document.getElementById("admin-user-display")) {
            document.getElementById("admin-user-display").innerText = userData.Username;
        }
    }

    try {
        // Fetching data for stats
        const res = await fetch("/complaints");
        const data = await res.json();

        if (Array.isArray(data)) {
            // Update Dashboard Stats
            document.getElementById('count-total').innerText = data.length;
            document.getElementById('count-resolved').innerText = data.filter(x => x.Status === 'Resolved').length;
            
            // Count unique students by their SubmittedBy ID
            const uniqueStudents = [...new Set(data.map(x => x.SubmittedBy))].length;
            document.getElementById('count-users').innerText = uniqueStudents;

            // Generate Complaint List
            const list = document.getElementById("list");
            list.innerHTML = data.map(x => `
                <div class="card" style="margin-bottom:10px; padding:15px; border:1px solid #ddd;">
                    <div style="display:flex; justify-content:space-between;">
                        <b>ID: #${x.ComplaintID} - ${x.Title}</b>
                        <span class="status-badge ${x.Status.replace(/\s+/g, '-')}">${x.Status}</span>
                    </div>
                    <p style="font-size:14px; color:#666;">${x.Description}</p>
                    <button onclick="goToUpdate(${x.ComplaintID})">Quick Edit</button>
                </div>
            `).join("");
        }
    } catch (err) {
        console.error("Failed to load admin data");
    }
}

function showSection(id, element) {
    const sections = ['dashboard', 'viewAll', 'updateStatus', 'settings', 'adminProfile'];
    sections.forEach(s => document.getElementById(s).style.display = 'none');
    document.getElementById(id).style.display = 'block';
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(element) element.classList.add('active');
    load();
}

function toggleAccountMenu() {
    const menu = document.getElementById("account-submenu");
    menu.style.display = (menu.style.display === "none") ? "block" : "none";
}

async function updateAdminPassword() {
    const oldPass = document.getElementById("oldPassInput").value;
    const newPass = document.getElementById("newPassInput").value;
    const confirmPass = document.getElementById("confirmPassInput").value;

    if (!oldPass || !newPass || !confirmPass) return alert("⚠️ All fields required!");
    if (newPass !== confirmPass) return alert("❌ New passwords mismatch!");

    const res = await fetch("/update-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData.UserID, oldPassword: oldPass, newPassword: newPass })
    });
    const result = await res.json();
    if (res.ok) {
        alert("✅ " + result.message);
        location.reload();
    } else {
        alert("❌ " + result.message);
    }
}

function updateStatusManual() {
    const id = document.getElementById('targetId').value;
    const status = document.getElementById('newStatus').value;
    fetch("/status/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: status })
    }).then(res => {
        if(res.ok) {
            alert("✅ Status Updated!");
            showSection('viewAll', document.getElementById('menu-view'));
        }
    });
}

function goToUpdate(id) {
    document.getElementById('targetId').value = id;
    showSection('updateStatus', document.getElementById('menu-update'));
}

function logout() { localStorage.clear(); location.href = "index.html"; }