import React from 'react';

function PlacementGroupSelector({ placementGroups, selectedPlacements, togglePlacement, toggleGroupAll }) {
  return (
    <div className="placement-groups-container">
      {placementGroups.map(group => {
        const allSelected = group.placements.every(p => selectedPlacements[p.id]);
        return (
          <div key={group.channelKey} className="placement-group-box">
            <div className="group-box-header">
              <span className={`variation-tag ${group.channelKey}`}>
                {group.title}
              </span>
              <button
                type="button"
                className="btn-select-group-all"
                onClick={() => toggleGroupAll(group)}
              >
                {allSelected ? '전체 해제' : '전체 선택'}
              </button>
            </div>
            <div className="placement-items-list">
              {group.placements.map(p => (
                <label key={p.id} className="placement-checkbox-label">
                  <input
                    type="checkbox"
                    checked={!!selectedPlacements[p.id]}
                    onChange={() => togglePlacement(p.id)}
                  />
                  <span className="placement-label-text">{p.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PlacementGroupSelector;
