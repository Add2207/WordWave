export default function PostCard({ post }) {
  return (
    <div className="post-card">
      <h3>{post.title}</h3>
      <p>{post.summary}</p>
      <small>By {post.author}</small>
    </div>
  );
}
