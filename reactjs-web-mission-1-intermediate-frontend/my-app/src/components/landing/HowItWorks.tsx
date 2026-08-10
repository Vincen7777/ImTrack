interface Step {
  title: string;
  text: string;
}

const STEPS: Step[] = [
  { title: "Create Workspace", text: "Setup takes less than a minute." },
  { title: "Add Tasks", text: "Dump your brain into ImTrack." },
  { title: "Invite Team", text: "Collaborate in real-time." },
  { title: "Track Progress", text: "Watch your goals become reality." },
];

function HowItWorks() {
  return (
    <>
    <section className="how-it-works" aria-labelledby="hiw-heading">
      <div className="section-head">
        <h2 className="section-title" id="hiw-heading">
          Workflow made simple
        </h2>
      </div>

      <div className="timeline">
        {STEPS.map((step, i) => (
          <div className="timeline-step" key={step.title}>
            <div className="step-num">{i + 1}</div>
            <h4>{step.title}</h4>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
    </section>
    </>
  );
}
export default HowItWorks