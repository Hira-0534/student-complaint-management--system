**Student Complaint Management System**

A complete web application to allow students to file complaints, view status, and administrators to manage and resolve them efficiently. This is a full-stack student complaint system using HTML, CSS, JavaScript, Node.js, Express.js, and a database (e.g., MySQL or MongoDB).

**🧾 Project Overview**

This system allows students to:

✔ Register and login
✔ Submit complaints about academics, facilities, staff, etc.
✔ View the status of their complaints in real time

Administrators can:

✔ View all complaints
✔ Update complaint status
✔ Assign complaint to staff
✔ Delete or filter complaints

It helps improve communication, transparency, and efficiency in handling student issues.

**🛠️ Features**
**🧑‍🎓 Student Side**

Registration & Login

Submit complaint with title & description

View complaint history

Delete or edit complaint before resolution

**👨‍💼 Admin Side**

Admin login dashboard

View all complaints

Update status (resolved / pending)

Filter complaints by category

**📁 Project Structure**
student-complaint-management-system/
├── public/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   ├── css/
│   └── js/

├── db/
│   └── db.js
├── server.js
├── package.json
└── README.md
**🧩 Technologies Used**

✅ Node.js
✅ Express.js
✅ JavaScript
✅ HTML, CSS
✅ Relational Database – MySQL
✅ Client-side form validation

*🚀 How to Run Locally*

Clone the repo:

git clone https://github.com/Hira-0534/student-complaint-management--system.git

Install dependencies:

npm install

PORT=3000
DATABASE_URL=your_db_connection
JWT_SECRET=your_secret_key

*Start the server:*

npm start

Visit in browser:

http://localhost:3000
Screenshots (Optional)

Add screenshots of login, dashboard, complaint form etc.

**⚙️ Future Enhancements*

✔ Email notifications when complaint status changes
✔ Role-based access (student, admin, staff)
✔ Search & filter complaints
✔ Attach images with complaints

**📄 Author**

Hira-0534 — hira shahid

**📝 License**

This project is open-source and free to use.
