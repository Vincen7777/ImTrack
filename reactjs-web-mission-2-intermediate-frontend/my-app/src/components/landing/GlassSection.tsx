interface InfoCard {
  icon: string;
  title: string;
  text: string;
}

const COMING_SOON_CARDS: InfoCard[] = [
  {
    icon: "ph ph-wallet icon-accent",
    title: "Finance Tracker",
    text: "Log expenses, track incomes, and link budgets to your daily tasks.",
  },
  {
    icon: "ph ph-heartbeat icon-accent",
    title: "Health & Habits",
    text: "Monitor your fitness routines, build streaks, and auto-generate daily habits.",
  },
];

const USE_CASES: InfoCard[] = [
  {
    icon: "ph-fill ph-briefcase",
    title: "For Freelancers",
    text: "Unify your client tasks, schedule, and upcoming invoices in a single, distraction-free dashboard.",
  },
  {
    icon: "ph-fill ph-rocket-launch",
    title: "For Founders",
    text: "Eliminate context-switching. Align your high-level roadmap with daily execution to ship faster.",
  },
  {
    icon: "ph-fill ph-graduation-cap",
    title: "For Students",
    text: "Track assignments, build healthy study routines, and conquer your goals without burning out.",
  },
];

function GlassSection() {
  return (
    <>
    <div className="glass-section-wrapper">
      <div className="wrapper-orb orb-1"></div>
      <div className="wrapper-orb orb-2"></div>
      <div className="wrapper-orb orb-3"></div>

      {/* ===== COMING SOON ===== */}
      <section className="coming-soon glass-panel">
        <div className="coming-soon-inner">
          <div className="section-head">
            <div className="lock-icon">
              <i className="ph-fill ph-lock-key"></i>
            </div>
            <h2 className="section-title">Coming in Phase 4</h2>
            <p className="section-sub">
              A true Life OS integrates your health and wealth.
            </p>
          </div>
          <div className="glass-grid">
            {COMING_SOON_CARDS.map((card) => (
              <div className="glass-card" key={card.title}>
                <i className={card.icon}></i>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PHILOSOPHY & USE CASES ===== */}
      <section
        className="philosophy-usecases glass-panel"
        aria-labelledby="philosophy-heading"
      >
        <div className="section-head philosophy-head">
          <h2 className="section-title" id="philosophy-heading">
            Designed for Clarity
          </h2>
          <p className="section-sub">
            Productivity tools shouldn't feel like a second job. We built
            ImTrack to cut the noise and bring focus back to your day—no
            matter what you're working on.
          </p>
        </div>
        <div className="usecase-grid">
          {USE_CASES.map((useCase) => (
            <article className="usecase-card" key={useCase.title}>
              <div className="usecase-icon">
                <i className={useCase.icon}></i>
              </div>
              <h3 className="usecase-title">{useCase.title}</h3>
              <p className="usecase-text">{useCase.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
    </>
  );
}
export default GlassSection