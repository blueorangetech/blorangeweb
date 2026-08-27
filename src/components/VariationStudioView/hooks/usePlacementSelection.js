import { useState } from 'react';

const createInitialSelection = (groups) => Object.fromEntries(
  groups.flatMap((group) => group.placements.map((placement) => [placement.id, false]))
);

export default function usePlacementSelection(groups) {
  const [selectedPlacements, setSelectedPlacements] = useState(() => createInitialSelection(groups));

  const togglePlacement = (id) => {
    setSelectedPlacements((current) => ({ ...current, [id]: !current[id] }));
  };

  const toggleGroupAll = (group) => {
    const nextValue = !group.placements.every((placement) => selectedPlacements[placement.id]);
    setSelectedPlacements((current) => {
      const next = { ...current };
      group.placements.forEach((placement) => { next[placement.id] = nextValue; });
      return next;
    });
  };

  const selectAllPlacements = () => {
    setSelectedPlacements(Object.fromEntries(
      groups.flatMap((group) => group.placements.map((placement) => [placement.id, true]))
    ));
  };

  const selectedPlacementKeys = Object.keys(selectedPlacements)
    .filter((key) => selectedPlacements[key]);

  return {
    selectedPlacements,
    selectedPlacementKeys,
    togglePlacement,
    toggleGroupAll,
    selectAllPlacements,
  };
}
