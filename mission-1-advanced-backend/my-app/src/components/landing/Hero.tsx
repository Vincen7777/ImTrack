const BADGES: string[] = [
  "Task Management",
  "Team Collaboration",
  "Calendar View",
  "Free Forever",
];

function Hero() {
  return (
    <>
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-eyebrow" aria-label="Version Update">
        <i className="ph ph-sparkle" aria-hidden="true"></i>
        ImTrack 2.0 is here — Board & Calendar View
      </div>

      <h1 id="hero-heading">
        Organize your entire life
        <br />
        <span className="accent">in one place.</span>
      </h1>

      <p className="hero-sub">
        The ultimate <strong>Personal Life OS</strong>. Productivity meets
        Finance, Health, and Planning. Designed for modern individuals and
        small teams.
      </p>

      <div className="hero-actions">
        <a href="/sign-up" className="hero-cta">
          Start Free
        </a>
        <a href="#features" className="hero-sec">
          How it works
        </a>
      </div>

      <div className="social-proof-badges">
        {BADGES.map((badge) => (
          <span key={badge}>
            <i className="ph-fill ph-check-circle"></i> {badge}
          </span>
        ))}
      </div>
    </section>
    </>
  );
}
export default Hero