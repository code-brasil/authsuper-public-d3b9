document.addEventListener('DOMContentLoaded', () => {
    // User Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            try {
                const response = await fetch('http://localhost:8000/functions/authsuper/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    window.location.href = 'dashboard.html';
                } else {
                    document.getElementById('error').innerText = data.message;
                }
            } catch (error) {
                document.getElementById('error').innerText = 'An error occurred.';
            }
        });
    }

    // Admin Login
    const adminLoginForm = document.querySelector('#loginSection form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            try {
                const response = await fetch('http://localhost:8000/functions/authsuper/admin_login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                if (data.token) {
                    localStorage.setItem('adminToken', data.token);
                    loadAdminPanel();
                } else {
                    document.getElementById('adminError').innerText = data.message;
                }
            } catch (error) {
                document.getElementById('adminError').innerText = 'An error occurred.';
            }
        });
    }

    // Admin Logout
    const adminLogoutBtn = document.getElementById('adminLogout');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            document.getElementById('adminPanel').classList.add('hidden');
            document.getElementById('loginSection').classList.remove('hidden');
        });
    }

    // User Logout
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }

    // Load Admin Panel
    async function loadAdminPanel() {
        const token = localStorage.getItem('adminToken');
        if (!token) return;
        try {
            const response = await fetch('http://localhost:8000/functions/authsuper/verify_admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            const data = await response.json();
            if (data.valid) {
                document.getElementById('loginSection').classList.add('hidden');
                document.getElementById('adminPanel').classList.remove('hidden');
                fetchUsers();
                fetchOnlineUsers();
                fetchStatistics();
            } else {
                document.getElementById('adminError').innerText = 'Invalid credentials.';
            }
        } catch (error) {
            document.getElementById('adminError').innerText = 'An error occurred.';
        }
    }

    // Fetch Users
    async function fetchUsers() {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch('http://localhost:8000/functions/authsuper/get_users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            const data = await response.json();
            const userTable = document.getElementById('userTable');
            userTable.innerHTML = '';
            data.users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="border px-4 py-2">${user.id}</td>
                    <td class="border px-4 py-2">${user.username}</td>
                    <td class="border px-4 py-2">${user.role}</td>
                    <td class="border px-4 py-2">
                        <button onclick="editUser(${user.id})" class="bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-2 rounded">Edit</button>
                        <button onclick="deleteUser(${user.id})" class="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded">Delete</button>
                    </td>
                `;
                userTable.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    // Fetch Online Users
    async function fetchOnlineUsers() {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch('http://localhost:8000/functions/authsuper/get_online_users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            const data = await response.json();
            const onlineUsersList = document.getElementById('onlineUsers');
            onlineUsersList.innerHTML = '';
            data.online_users.forEach(user => {
                const li = document.createElement('li');
                li.innerText = user.username;
                onlineUsersList.appendChild(li);
            });
        } catch (error) {
            console.error('Error fetching online users:', error);
        }
    }

    // Fetch Statistics
    async function fetchStatistics() {
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch('http://localhost:8000/functions/authsuper/get_statistics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            const data = await response.json();
            document.getElementById('totalUsers').innerText = data.total_users;
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    }

    // Edit User (To be implemented)
    window.editUser = function(id) {
        // Implement edit functionality
        alert('Edit user with ID: ' + id);
    }

    // Delete User
    window.deleteUser = async function(id) {
        const token = localStorage.getItem('adminToken');
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            const response = await fetch('http://localhost:8000/functions/authsuper/delete_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, user_id: id })
            });
            const data = await response.json();
            if (data.success) {
                fetchUsers();
                fetchStatistics();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }
});