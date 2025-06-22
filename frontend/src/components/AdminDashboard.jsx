
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      {/* LEFT SIDE: LOGIN & ADD USER FORMS */}
      <div className="forms-section">
        <div className="form-box">
          <h2>Login</h2>
          <input placeholder="Username" />
          <input placeholder="Password" type="password" />
          <button>Login</button>
        </div>

        <div className="form-box">
          <h2>Add New User</h2>
          <input placeholder="Username" />
          <input placeholder="Password" type="password" />
          <input placeholder="First Name" />
          <input placeholder="Last Name" />
          <input placeholder="Email" />
          <button>Add User</button>
        </div>
      </div>

      {/* RIGHT SIDE: USERS DISPLAY */}
      <div className="users-section">
        <h2>All Users</h2>
        <ul className="user-list">
          {/* Fake users for layout */}
          <li>
            <span>john_doe — John Doe</span>
            <div>
              <button>Edit</button>
              <button>Delete</button>
            </div>
          </li>
          <li>
            <span>jane_smith — Jane Smith</span>
            <div>
              <button>Edit</button>
              <button>Delete</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
