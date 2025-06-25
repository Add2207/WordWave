import { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import BlogPosts from './components/BlogPost';
import NavBar from './components/NavBar';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <Router>
      <NavBar currentUser={currentUser} onLogout={handleLogout} />
      <LoginPage onLogin={handleLogin} />
      <Routes>
        <Route
          path="/"
          element={
            currentUser ? (
              <BlogPosts currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <div>Please log in to view your blog.</div>
            )
          }
        />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
