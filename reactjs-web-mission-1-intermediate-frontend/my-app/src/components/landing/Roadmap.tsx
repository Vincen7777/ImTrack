type PhaseStatus = "done" | "active" | "upcoming";

interface Phase {
  phase: string;
  title: string;
  status: PhaseStatus;
}

const PHASES: Phase[] = [
  { phase: "Phase 1", title: "Task Management", status: "done" },
  { phase: "Phase 2", title: "Board & Calendar", status: "done" },
  { phase: "Phase 3", title: "Collaboration", status: "done" },
  { phase: "Phase 4", title: "Finance & Health", status: "active" },
  { phase: "Phase 5", title: "AI Assistant", status: "upcoming" },
  { phase: "Phase 6", title: "Life Analytics", status: "upcoming" },
];

const STATUS_ICON: Record<PhaseStatus, string> = {
  done: "ph-fill ph-check-circle rm-icon",
  active: "ph-fill ph-spinner-gap rm-icon rotating",
  upcoming: "ph-fill ph-clock rm-icon",
};

function Roadmap() {
  return (
    <>
    <section className="roadmap" aria-labelledby="roadmap-heading">
      <div className="section-head">
        <h2 className="section-title" id="roadmap-heading">
          The Journey Ahead
        </h2>
        <p className="section-sub">
          We're just getting started. Here's what we are building.
        </p>
      </div>

      <div className="roadmap-scroll">
        <div className="roadmap-track">
          {PHASES.map((p) => (
            <div
              className={`roadmap-card${p.status === "done" ? " done" : ""}${p.status === "active" ? " active" : ""}`}
              key={p.phase}
            >
              <div className="rm-phase">{p.phase}</div>
              <h4>{p.title}</h4>
              <i className={STATUS_ICON[p.status]}></i>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
export default Roadmap