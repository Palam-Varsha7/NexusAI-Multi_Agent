import React, { useEffect, useState } from "react";

function NeuralCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [pressed, setPressed] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const pointer = window.matchMedia("(pointer: fine)");
    if (!pointer.matches) return undefined;

    const move = (event) => {
      setActive(true);
      setPos({ x: event.clientX, y: event.clientY });
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => setActive(false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("mouseleave", leave);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("mouseleave", leave);
    };
  }, []);

  if (!active) return null;

  return (
    <>
      <div
        className="neural-cursor"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${pressed ? 0.72 : 1})`
        }}
      />
      <div
        className="neural-cursor-ring"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${pressed ? 1.28 : 1})`
        }}
      />
    </>
  );
}

export default NeuralCursor;
