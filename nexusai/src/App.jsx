import React from "react";
import { NexusAIProvider } from "./context/NexusAIContext.jsx";
import useDarkMode from "./hooks/useDarkMode.js";
import Home from "./pages/Home.jsx";
import NeuralCursor from "./components/shared/NeuralCursor.jsx";

function App() {
  const { theme, toggleTheme } = useDarkMode();

  return (
    <NexusAIProvider>
      <NeuralCursor />
      <Home theme={theme} onToggleTheme={toggleTheme} />
    </NexusAIProvider>
  );
}

export default App;
