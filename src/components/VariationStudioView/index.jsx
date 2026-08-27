import React from 'react';
import '../../styles/VariationStudioView.css';
import AiVariationTab from './tabs/AiVariationTab';

function VariationStudioView({ embedded = false }) {
  return <AiVariationTab embedded={embedded} />;
}

export default VariationStudioView;
