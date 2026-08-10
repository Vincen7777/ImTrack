interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  label: string;
  icon: string;
  href: string;
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Integrations", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];

const SOCIAL_LINKS: SocialLink[] = [
  { label: "Twitter", icon: "ph-fill ph-twitter-logo", href: "#" },
  { label: "GitHub", icon: "ph-fill ph-github-logo", href: "#" },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
    <footer className="site-footer" role="contentinfo">
      <div className="footer-grid">
        <div className="foot-col">
          <div className="nav-logo" style={{ marginBottom: "1.5rem" }}>
            <img src="/img/logo.svg" alt="ImTrack" width={32} height={32} />
            <span className="nav-brand">ImTrack</span>
          </div>
          <p style={{ color: "var(--gray-500)", lineHeight: 1.6 }}>
            The ultimate Personal Life OS.
            <br />
            Built for individuals and small teams
            <br />
            who want to do more with less clutter.
          </p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div className="foot-col" key={col.title}>
            <h5>{col.title}</h5>
            <ul>
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <div>&copy; {year} ImTrack Inc. All rights reserved.</div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              style={{ color: "var(--gray-400)", fontSize: "1.25rem" }}
            >
              <i className={social.icon}></i>
            </a>
          ))}
        </div>
      </div>
    </footer>
    </>
  );
}
export default Footer