import { NavLink } from 'react-router-dom';
import '../styles/NavBar.css'; 

export default function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <span className="logo">WordWave</span>
        <ul className="nav-links">
          <li><NavLink to="/" className="nav-link">Home</NavLink></li>
          <li><NavLink to="/admin" className="nav-link">Admin Dashboard</NavLink></li>
        </ul>
      </div>
    </nav>
  );
}

