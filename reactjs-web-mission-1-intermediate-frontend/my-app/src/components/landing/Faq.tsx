interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "Is ImTrack free?",
    a: "Yes, ImTrack is free forever for personal use and small teams up to 5 members.",
  },
  {
    q: "Is there a mobile app?",
    a: "We are currently fully responsive on web, and native mobile apps are on our Phase 6 roadmap.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use industry-standard encryption to ensure your personal life stays personal.",
  },
  {
    q: "Can I use it offline?",
    a: "Offline support is being developed and will be released in an upcoming update.",
  },
];

function Faq() {
  return (
    <>
    <section className="faq-section" aria-labelledby="faq-heading">
      <div className="section-head">
        <h2 className="section-title" id="faq-heading">
          Frequently Asked Questions
        </h2>
      </div>
      <div className="faq-grid">
        {FAQS.map((item) => (
          <div className="faq-item" key={item.q}>
            <h4>{item.q}</h4>
            <p>{item.a}</p>
          </div>
        ))}
      </div>
    </section>
    </>
  );
}
export default Faq