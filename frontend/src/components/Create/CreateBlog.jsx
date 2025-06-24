import { useState } from "react";

export default function CreateBlog({ onAddPost }) {
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");

  const handleCreateClick = () => {
    setShowEditor(true);
  };

  const handleSubmit = () => {
    if (!title || !summary) {
      alert("Please fill in both title and summary!");
      return;
    }

    // Send to parent:
    onAddPost({
      title,
      summary,
      author: "You", // Or use logged-in user if available
    });

    // Reset & hide editor
    setTitle("");
    setSummary("");
    setShowEditor(false);
  };

  return (
    <div className="create-blog">
      {!showEditor && (
        <button onClick={handleCreateClick}>➕ Create Blog Post</button>
      )}

      {showEditor && (
        <div>
          <h3>✍️ Write Your Blog</h3>
          <input
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
          />
          <textarea
            placeholder="Short summary or content..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows="5"
            style={{ width: "100%", padding: "8px" }}
          />
          <br />
          <button onClick={handleSubmit}>Submit</button>
          <button onClick={() => setShowEditor(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
