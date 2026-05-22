import React from 'react'
import { useState } from "react";
import { motion } from "framer-motion";

const initialColumns = {
  Screened: [
    { id: "c1", name: "Aarav Mehta", score: 92 },
    { id: "c2", name: "Riya Shah", score: 81 }
  ],
  Interview: [{ id: "c3", name: "Maya Nair", score: 88 }],
  Offer: [{ id: "c4", name: "Dev Iyer", score: 94 }],
  Rejected: [{ id: "c5", name: "Kabir Sen", score: 46 }]
};

function PipelineBoard() {
  const [columns, setColumns] = useState(initialColumns);
  const [dragged, setDragged] = useState(null);

  const moveCard = (targetColumn) => {
    if (!dragged || dragged.column === targetColumn) return;

    setColumns((current) => {
      const sourceCards = current[dragged.column].filter(
        (card) => card.id !== dragged.card.id
      );
      const targetCards = [...current[targetColumn], dragged.card];

      return {
        ...current,
        [dragged.column]: sourceCards,
        [targetColumn]: targetCards
      };
    });
    setDragged(null);
  };

  const advanceCard = (sourceColumn, card) => {
    const columnNames = Object.keys(columns);
    const nextColumn =
      columnNames[(columnNames.indexOf(sourceColumn) + 1) % columnNames.length];
    if (nextColumn === sourceColumn) return;

    setColumns((current) => ({
      ...current,
      [sourceColumn]: current[sourceColumn].filter((item) => item.id !== card.id),
      [nextColumn]: [...current[nextColumn], card]
    }));
  };

  return (
    <motion.section
      className="glass-card rounded-lg p-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: 0.24, ease: "easeOut" }}
    >
      <div className="mb-5">
        <p className="agent-output mb-2 text-[11px] uppercase tracking-[0.18em] text-blue-300">
          Drag candidates
        </p>
        <h3 className="font-heading text-2xl font-bold tracking-normal text-[var(--text)]">
          Pipeline board
        </h3>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {Object.entries(columns).map(([column, cards], columnIndex) => (
          <motion.div
            key={column}
            className="min-h-64 rounded-lg border border-[var(--border)] bg-white/5 p-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.36,
              delay: 0.3 + columnIndex * 0.06,
              ease: "easeOut"
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => moveCard(column)}
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-[var(--text)]">{column}</h4>
              <span className="agent-output text-xs text-muted">{cards.length}</span>
            </div>

            <div className="space-y-3">
              {cards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className="hover-lift w-full rounded-lg border border-[var(--border)] bg-[var(--elevated)] p-3 text-left"
                  draggable
                  onDragStart={() => setDragged({ column, card })}
                  onClick={() => advanceCard(column, card)}
                >
                  <span className="block text-sm font-bold text-[var(--text)]">
                    {card.name}
                  </span>
                  <span className="agent-output mt-2 block text-xs text-blue-300">
                    Score {card.score}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

export default PipelineBoard;

