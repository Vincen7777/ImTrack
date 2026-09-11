import { Link } from "react-router-dom";

function Nav() {
  return (
    <>
    <nav className="nav" aria-label="Main Navigation">
      <Link to="/" className="nav-logo" aria-label="ImTrack beranda">
        <div className="nav-logo-mark" aria-hidden="true">
          <img src="/logo.svg" alt="ImTrack" width={32} height={32} />
        </div>
        <span className="nav-brand">ImTrack</span>
      </Link>

      <ul className="nav-links">
        <li>
          <a href="#features">Features</a>
        </li>
        <li>
          <a href="#roadmap">Roadmap</a>
        </li>
        <li>
          <a href="#faq">FAQ</a>
        </li>
      </ul>

      <div className="nav-cta">
        <Link to="/sign-in" className="nav-btn-outline">
          Masuk
        </Link>
        <Link to="/sign-up" className="nav-btn-primary">
          Coba Gratis
        </Link>
      </div>
    </nav>
    </>
  );
}
export default Nav