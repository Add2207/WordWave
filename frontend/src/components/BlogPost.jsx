import { useState } from 'react';
import PostCard from './PostCard';
import CreateBlog from './Create/CreateBlog';
import '../styles/BlogPosts.css';

export default function BlogPosts() {
  // ✅ Now using useState — so we can update posts dynamically!
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Riding the WordWave: How to Write Engaging Blogs",
      summary: "Discover tips and tricks to capture your audience's attention with every wave of words.",
      author: "Aaditya",
    },
    {
      id: 2,
      title: "Top 10 Blogging Trends in 2025",
      summary: "Stay ahead of the wave with the latest trends that will shape online content this year.",
      author: "WordWave Team",
    },
    {
      id: 3,
      title: "From Idea to Viral Post: A Writer's Journey",
      summary: "A behind-the-scenes look at how great articles come to life and reach thousands.",
      author: "Guest Blogger",
    },
  ]);

  // ✅ Called by <CreateBlog />
  const handleAddPost = (newPost) => {
    // Give a unique id (for example purposes)
    const id = posts.length + 1;
    const postToAdd = {
      id,
      ...newPost,
    };
    setPosts([postToAdd, ...posts]); // Add to top of feed
  };

  return (
    <div className="page">
      {/* 🌊 HERO */}
      <header className="hero">
        <h1>🌊 Welcome to WordWave</h1>
        <p>Ride the wave of words — read, write, and share articles crafted by our vibrant community.</p>
      </header>

      {/* ✍️ CREATE SECTION */}
      <section className="create-section">
        <CreateBlog onAddPost={handleAddPost} />
      </section>

      {/* 📚 ARTICLES SECTION */}
      <section className="articles-section">
        <h2>Latest Articles</h2>
        <div className="post-row">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
