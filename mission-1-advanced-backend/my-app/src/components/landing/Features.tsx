interface Feature {
  icon: string;
  glow: string;
  title: string;
  text: string;
  points: string[];
  reverse: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: "ph-fill ph-kanban",
    glow: "blue-glow",
    title: "Prioritize with Clarity",
    text: "Focus on what matters today with our 3-level priority system: Now, Later, and Someday. Drag and drop tasks effortlessly across your Kanban board.",
    points: ["Flexible board views", "Seamless drag-and-drop"],
    reverse: false,
  },
  {
    icon: "ph-fill ph-users-three",
    glow: "purple-glow",
    title: "Built for Teams",
    text: "Share lists, assign tasks, and communicate effortlessly in real-time. Perfectly optimized for small teams and agile workflows.",
    points: ["Instant notifications", "Role-based assignments"],
    reverse: true,
  },
  {
    icon: "ph-fill ph-calendar-check",
    glow: "green-glow",
    title: "Never Miss a Deadline",
    text: "Get a bird\u2019s-eye view of your month. The interactive calendar view ensures you stay on top of all upcoming deliverables and goals.",
    points: ["Monthly & weekly views", "Recurring tasks"],
    reverse: false,
  },
];

function Features() {
  return (
    <>
    <section id="features" className="features" aria-labelledby="features-heading">
      <div className="section-head">
        <h2 className="section-title" id="features-heading">
          Everything you need. Nothing you don't.
        </h2>
        <p className="section-sub">
          A carefully crafted experience to boost your focus without the
          clutter.
        </p>
      </div>

      <div className="feat-alt-grid">
        {FEATURES.map((feature) => (
          <div
            className={`feat-row${feature.reverse ? " reverse" : ""}`}
            key={feature.title}
          >
            <div className="feat-visual">
              <div className={`mockup-box ${feature.glow}`}>
                <i className={feature.icon}></i>
              </div>
            </div>
            <div className="feat-content">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <ul className="feat-list">
                {feature.points.map((point) => (
                  <li key={point}>
                    <i className="ph ph-check"></i> {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
    </>
  );
}
export default Features