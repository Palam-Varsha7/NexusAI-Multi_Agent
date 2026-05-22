import React from 'react';
import { useState } from "react";
import Intro from "../components/Intro.jsx";
import Login from "../components/Login.jsx";
import Dashboard from "../components/Dashboard.jsx";
import { useNexusAI } from "../context/NexusAIContext.jsx";

function Home({ theme, onToggleTheme }) {
  const [stage, setStage] = useState("intro"); // ← starts at intro now
  const { role, setRole } = useNexusAI();

  const enterLogin = () => setStage("login");

  const enterDashboard = (selectedRole) => {
    setRole(selectedRole);
    setStage("dashboard");
  };

  if (stage === "intro") {
    return <Intro onComplete={enterLogin} />;
  }

  if (stage === "login" || stage === "roles") {
    return (
      <Login
        theme={theme}
        onToggleTheme={onToggleTheme}
        onSelectRole={enterDashboard}
        showRolesOnly={stage === "roles"}
      />
    );
  }

  return (
    <Dashboard
      role={role}
      theme={theme}
      onToggleTheme={onToggleTheme}
      onSwitchRole={() => {
        setRole(null);
        setStage("roles");
      }}
    />
  );
}

export default Home;
