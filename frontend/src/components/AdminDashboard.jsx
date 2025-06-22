import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loginForm, setLoginForm] = useState({ username: '', password: ''});
  const [addForm, setAddForm] = useState({username: '', password: '', first_name: '', last_name: '', email:''});
  const [loggedInUser, setLoggedInUser] = useState(null);

  const api = 'http://localhost:3000/api';

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${api}/users`);
      setUsers(res.data.users);
    } catch (error) {
      console.error(error);
    }
  }

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${api}/auth/login`, loginForm);
      setLoggedInUser(res.data.user);
      alert(`Login successful: Welcome ${res.data.user.username}`);
      fetchUsers();
      console.log(res.data);
    } catch (error) {
      console.log(error);
      alert('login failed');
    }
  }

  const handleAddUser = async () => {
    if (!loggedInUser) {
      alert('Please login first.');
      return;
    }
    try {
      await axios.post(`${api}/users`, {
        ...addForm,
        requester_id: loggedInUser.id,
        // By default, form does not ask for is_admin; only superadmin can add admin manually
        is_admin: false,
        is_superadmin: false,
      });
      alert('User added');
      fetchUsers();
      setAddForm({ username: '', password: '', first_name: '', last_name: '', email: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to add user');
    }
  };

  const handleEditUser = async (user) => {
    if (!loggedInUser) {
      alert('Please login first.');
      return;
    }

    const first_name = prompt('New First Name', user.first_name);
    const last_name = prompt('New Last Name', user.last_name);
    const username = prompt('New Username', user.username);

    if (!first_name || !last_name || !username) return;

    try {
      await axios.put(`${api}/users/${user.id}`, {
        first_name,
        last_name,
        username,
        requester_id: loggedInUser.id,
      });
      alert('User updated');
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!loggedInUser) {
      alert('Please login first.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${user.username}?`)) return;

    try {
      await axios.delete(`${api}/users/${user.id}`, {
        data: { requester_id: loggedInUser.id }
      });
      alert('User deleted');
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user');
    }
  };

  useEffect(() => {
    if (loggedInUser) fetchUsers();
  }, [loggedInUser]);

  return (
    <div className="admin-dashboard">
      {/* LEFT SIDE: LOGIN & ADD USER FORMS */}
      <div className="forms-section">
        <div className="form-box">
          <h2>Login</h2>
          <input
            placeholder="Username"
            value={loginForm.username}
            onChange={(e) =>
              setLoginForm({ ...loginForm, username: e.target.value })
            }
          />
          <input
            placeholder="Password"
            type="password"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
          />
          <button onClick={handleLogin}>Login</button>
        </div>

        <div className="form-box">
          <h2>Add New User</h2>
          <input
            placeholder="Username"
            value={addForm.username}
            onChange={(e) =>
              setAddForm({ ...addForm, username: e.target.value })
            }
          />
          <input
            placeholder="Password"
            type="password"
            value={addForm.password}
            onChange={(e) =>
              setAddForm({ ...addForm, password: e.target.value })
            }
          />
          <input
            placeholder="First Name"
            value={addForm.first_name}
            onChange={(e) =>
              setAddForm({ ...addForm, first_name: e.target.value })
            }
          />
          <input
            placeholder="Last Name"
            value={addForm.last_name}
            onChange={(e) =>
              setAddForm({ ...addForm, last_name: e.target.value })
            }
          />
          <input
            placeholder="Email"
            value={addForm.email}
            onChange={(e) =>
              setAddForm({ ...addForm, email: e.target.value })
            }
          />
          <button onClick={handleAddUser}>Add User</button>
        </div>
      </div>

      {/* RIGHT SIDE: USERS DISPLAY */}
      <div className="users-section">
        <h2>All Users</h2>
        <ul className="user-list">
          {users.map((user) => (
            <li key={user.id}>
              <span>
                {user.username} — {user.first_name} {user.last_name}
              </span>
              <div>
                <button onClick={() => handleEditUser(user)}>Edit</button>
                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
