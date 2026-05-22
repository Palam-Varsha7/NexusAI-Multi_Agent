import React, { useMemo, useState } from "react";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  LockKeyhole,
  ShieldCheck,
  UsersRound,
  ArrowRight,
  Zap
} from "lucide-react";

const credentials = {
  email: "palam@nexusai.ai",
  password: "NexusAI@239"
};

const roles = [
  {
    id: "HR",
    title: "HR",
    label: "HUMAN RESOURCES",
    description: "Applicants, onboarding, employee records",
    icon: UsersRound,
    number: "01"
  },
  {
    id: "Sales",
    title: "Sales",
    label: "REVENUE OPS",
    description: "Leads, proposals, pipeline movement",
    icon: ChartNoAxesCombined,
    number: "02"
  },
  {
    id: "PM",
    title: "PM",
    label: "PROJECT MGMT",
    description: "Tasks, delivery risks, project rhythm",
    icon: BriefcaseBusiness,
    number: "03"
  },
  {
    id: "Finance",
    title: "Finance",
    label: "FINANCE OPS",
    description: "Invoices, collections, approvals",
    icon: BadgeDollarSign,
    number: "04"
  },
  {
    id: "Admin",
    title: "Admin",
    label: "SYSTEM CONTROL",
    description: "Access, automations, workspace control",
    icon: ShieldCheck,
    number: "05"
  }
];

function BinaryRain({ paused }) {
  const streams = useMemo(
    () =>
      Array.from({ length: 42 }, (_, index) => ({
        id: index,
        left: `${(index / 42) * 100}%`,
        delay: `${-(index % 14) * 0.45}s`,
        duration: `${5.2 + (index % 8) * 0.4}s`,
        text: Array.from({ length: 38 }, () => (Math.random() > 0.5 ? "1" : "0"))
      })),
    []
  );

  return (
    <div className={`binary-rain ${paused ? "binary-rain-paused" : ""}`} aria-hidden="true">
      {streams.map((stream) => (
        <span
          key={stream.id}
          style={{
            left: stream.left,
            animationDelay: stream.delay,
            animationDuration: stream.duration
          }}
        >
          {stream.text.map((digit, index) => (
            <b key={`${stream.id}-${index}`}>{digit}</b>
          ))}
        </span>
      ))}
    </div>
  );
}

function Login({ onSelectRole, showRolesOnly = false }) {
  const [email, setEmail] = useState(credentials.email);
  const [password, setPassword] = useState("");
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(showRolesOnly);

  const submit = (event) => {
    event.preventDefault();
    const validEmail = email.trim().toLowerCase() === credentials.email;
    const validPassword = password === credentials.password;

    if (!validEmail || !validPassword) {
      setPaused(true);
      setError("Incorrect email or password. Binary stream paused.");
      return;
    }

    setPaused(false);
    setError("");
    setAuthenticated(true);
  };

  return (
    <main className="login-stage">
      <BinaryRain paused={paused} />
      <div className="login-stars" />
      <div className="login-planet" />
      <div className="owner-badge">
        <strong>PALAM VARSHA</strong>
        <span>160624733239</span>
      </div>

      {!authenticated ? (
        <form className="prosperity-login" onSubmit={submit}>
          <div className="login-card-line" />
          <div className="login-card-dot" />
          <div className="login-card-mark">nexus</div>
          <h1>LOGIN</h1>

          <label>
            <span>Email *</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label>
            <span>Password *</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button">
            <LockKeyhole size={16} />
            Log in
          </button>

          <p className="demo-credentials">
            Email: <strong>{credentials.email}</strong> &nbsp; Password: <strong>{credentials.password}</strong>
          </p>

          <div className="login-card-dash">
            <span />
            <span />
            <span />
            <span />
          </div>
        </form>
      ) : (
        <section className="role-gateway">
          <div className="role-gateway-head">
            <div>
              <p>ACCESS GRANTED</p>
              <h1>SELECT YOUR AGENT</h1>
            </div>
            <div className="role-status">
              <Zap size={14} />
              5 AGENTS READY
            </div>
          </div>

          <div className="role-card-grid">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  type="button"
                  className="role-card"
                  style={{ animationDelay: `${index * 0.07}s` }}
                  onClick={() => onSelectRole(role)}
                >
                  <span className="role-number">{role.number}</span>
                  <span className="role-icon"><Icon size={20} /></span>
                  <span className="role-label">{role.label}</span>
                  <strong>{role.title}</strong>
                  <small>{role.description}</small>
                  <span className="role-enter">ENTER <ArrowRight size={12} /></span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

export default Login;
