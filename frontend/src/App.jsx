import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import BlogPosts from './components/BlogPost';
import NavBar from './components/NavBar';


function App() {
  return (
    <Router>
      <NavBar />

      <Routes>
        <Route path="/" element={<BlogPosts />} />
        {/* <Route path="/blog" element={<BlogPosts />} /> */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
