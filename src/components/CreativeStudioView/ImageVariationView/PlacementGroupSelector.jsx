import React, { useState } from 'react';

function PlacementGroupSelector({ placementGroups, selectedPlacements, togglePlacement, toggleGroupAll }) {
  const [collapsed, setCollapsed] = useState({});
  return (
    <div className="placement-groups-container">
      {placementGroups.map(group => {
        const allSelected = group.placements.every(p => selectedPlacements[p.id]);
        return (
          <div key={group.channelKey} className="placement-group-box">
            <div className="group-box-header">
              <button type="button" className={`variation-tag ${group.channelKey}`}
                aria-expanded={!collapsed[group.channelKey]} aria-controls={`placements-${group.channelKey}`}
                onClick={() => setCollapsed((current) => ({ ...current, [group.channelKey]: !current[group.channelKey] }))}
                style={{ border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{collapsed[group.channelKey] ? 'expand_more' : 'expand_less'}</span>
                {group.title} · {group.placements.filter((p) => selectedPlacements[p.id]).length}/{group.placements.length}
              </button>
              <button
                type="button"
                className="btn-select-group-all"
                onClick={() => toggleGroupAll(group)}
              >
                {allSelected ? '전체 해제' : '전체 선택'}
              </button>
            </div>
            <div id={`placements-${group.channelKey}`} className="placement-items-list" hidden={!!collapsed[group.channelKey]}
              style={collapsed[group.channelKey] ? { display: 'none' } : undefined}>
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
