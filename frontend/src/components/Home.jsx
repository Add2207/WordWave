import CreateBlog from "./Create/CreateBlog"

export default function Home() {
  return (
    <div className="page">
      <h1>🌊 Welcome to WordWave</h1>
      <p>Ride the wave of words — create, share, and explore articles crafted by our community.</p>
      <p>Admins can manage writers and readers through the dashboard.</p>

      <CreateBlog />
    </div>
  );
}
