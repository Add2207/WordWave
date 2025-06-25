import PostCard from './PostCard';
import CreateBlog from './Create/CreateBlog';
import '../styles/BlogPosts.css';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function BlogPosts({ currentUser, onLogout }) {
  // Sample posts that show how the platform works
  const samplePosts = [
    {
      id: 'sample-1',
      title: "Welcome to WordWave! Your Posts Are Saved Automatically",
      summary: "This is a sample post showing how WordWave works. When you create new posts above, they'll be saved to your browser and appear here permanently - even when you refresh the page or come back later!",
      author: "WordWave Guide",
      type: "sample"
    },
    {
      id: 'sample-2', 
      title: "How Your Personal Blog Works",
      summary: "Your posts are stored locally in your browser using localStorage. This means: ✅ Your content persists between sessions ✅ Only you can see your posts ✅ No account needed ✅ Instant saving. Try creating a post above!",
      author: "WordWave Tutorial",
      type: "sample"
    },
    {
      id: 'sample-3',
      title: "Multi-User Support",
      summary: "Each user gets their own personal blog space! Switch between users to see how localStorage keeps everyone's posts separate. Your posts are tied to your username, so you'll always see your own content when you log in.",
      author: "Getting Started",
      type: "sample"
    },
  ];

  // ✅ Using localStorage with user-specific key
  const userStorageKey = `posts_${currentUser.username}`;
  const [userPosts, setUserPosts] = useLocalStorage(userStorageKey, []);
  
  // Combine user posts (at top) with sample posts (at bottom)
  const allPosts = [...userPosts, ...samplePosts];

  // ✅ Called by <CreateBlog />
  const handleAddPost = (newPost) => {
    const id = Date.now();
    const postToAdd = {
      id,
      ...newPost,
      author: currentUser.username,
      createdAt: new Date().toLocaleString(),
      type: "user"
    };
    setUserPosts([postToAdd, ...userPosts]);
  };

  // Function to clear only user posts (keep samples)
  const handleClearUserPosts = () => {
    setUserPosts([]);
  };

  // Function to delete a specific post
  const handleDeletePost = (postId) => {
    setUserPosts(userPosts.filter(post => post.id !== postId));
  };

  return (
    <div className="page">
      {/* User Header */}
      <div className="user-header">
        <div className="user-info">
          <h3>👋 Welcome back, {currentUser.username}!</h3>
          <p>{currentUser.email}</p>
        </div>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {/* 🌊 HERO */}
      <header className="hero">
        <h1>🌊 {currentUser.username}'s WordWave</h1>
        <p>Your personal blog space — create and manage your articles</p>
        {userPosts.length > 0 && (
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            📝 You have {userPosts.length} personal post{userPosts.length !== 1 ? 's' : ''} saved
          </div>
        )}
      </header>

      {/* ✍️ CREATE SECTION */}
      <section className="create-section">
        <CreateBlog onAddPost={handleAddPost} />
        {userPosts.length > 0 && (
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <button 
              onClick={handleClearUserPosts}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear My Posts ({userPosts.length})
            </button>
          </div>
        )}
      </section>

      {/* 📚 ARTICLES SECTION */}
      <section className="articles-section">
        <h2>
          {userPosts.length > 0 ? `${currentUser.username}'s Articles & Getting Started` : 'Getting Started - Create Your First Post!'}
        </h2>
        
        {userPosts.length === 0 && (
          <div className="no-posts-message">
            <h3>👆 Try creating a post above!</h3>
            <p>Your posts will appear here and be automatically saved to your personal space. Try logging out and back in - your posts will still be here!</p>
          </div>
        )}

        <div className="post-row">
          {allPosts.map(post => (
            <div key={post.id}>
              <PostCard 
                post={post} 
                onDelete={post.type === "user" ? handleDeletePost : null}
                showDelete={post.type === "user"}
              />
              {post.type === "user" && (
                <div className="post-indicator user-post-indicator">
                  ✅ Saved to {currentUser.username}'s space
                </div>
              )}
              {post.type === "sample" && (
                <div className="post-indicator sample-post-indicator">
                  📖 Sample post
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Info Footer */}
      <footer className="info-footer">
        <h4>How Multi-User WordWave Works:</h4>
        <ul>
          <li>✍️ Create posts using the form above</li>
          <li>💾 Your posts are saved with your username: <code>{userStorageKey}</code></li>
          <li>👤 Each user has their own separate post collection</li>
          <li>🔄 Posts persist even when you logout and login again</li>
          <li>🗑️ Manage only your own posts independently</li>
          <li>🔄 Try logging out and logging in as a different user!</li>
        </ul>
      </footer>
    </div>
  );
}