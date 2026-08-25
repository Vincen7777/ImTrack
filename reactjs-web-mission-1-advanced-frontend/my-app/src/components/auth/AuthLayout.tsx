import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="auth-page-wrapper">
      <main className="auth-root">
        <div className="auth-logo">
          <img src="/logo.svg" alt="ImTrack Logo" className="auth-logo-img" width={60} height={60} />
          <h1>ImTrack</h1>
          <p>Personal Life OS</p>
        </div>

        <div className="auth-card">
          <div className="auth-card-hd">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          <div className="auth-form">
            {children}
            <p className="auth-footer">{footer}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AuthLayout