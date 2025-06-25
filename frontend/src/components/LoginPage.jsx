import { useState } from "react";
import "../styles/LoginPage.css";

export default function LoginPage({ onLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.email = "please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      const userData = {
        username: formData.username,
        email: formData.email,
        loginTime: new Date().toISOString(),
        id: Date.now(),
      };

      localStorage.setItem("currentUser", JSON.stringify(userData));

      onLogin(userData);

      setIsLoading(false);
    }, 1000);
  };

  const handleQuickLogin = (username, email) => {
    setFormData({ username, email });
    const userData = {
      username,
      email,
      loginTime: new Date().toISOString(),
      id: Date.now(),
    };
    localStorage.setItem("currentUser", JSON.stringify(userData));
    onLogin(userData);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <h1>🌊 Welcome to WordWave</h1>
          <p>Sign in to access your personal blog space</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={errors.username ? 'error' : ''}
              placeholder="Enter your username"
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Login Options */}
        <div className="quick-login">
          <p>Quick Login (Demo):</p>
          <div className="quick-login-buttons">
            <button 
              onClick={() => handleQuickLogin('Aaditya', 'aaditya@wordwave.com')}
              className="quick-btn"
            >
              Login as Aaditya
            </button>
            <button 
              onClick={() => handleQuickLogin('Sarah', 'sarah@wordwave.com')}
              className="quick-btn"
            >
              Login as Sarah
            </button>
            <button 
              onClick={() => handleQuickLogin('Mike', 'mike@wordwave.com')}
              className="quick-btn"
            >
              Login as Mike
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="login-info">
          <h3>How Your Personal Blog Works:</h3>
          <ul>
            <li>🔐 Each user gets their own personal blog space</li>
            <li>💾 Your posts are saved locally in your browser</li>
            <li>🔄 Your content persists between sessions</li>
            <li>👤 Switch users to see different personal blogs</li>
            <li>🗑️ Each user can manage their own posts independently</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
