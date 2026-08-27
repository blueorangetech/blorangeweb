import React from 'react';
import PsdVariationTab from './VariationStudioView/tabs/PsdVariationTab';

function PsdVariationStudioView({ embedded = false, pageName = 'playground', bucketName }) {
  return <PsdVariationTab embedded={embedded} pageName={pageName} bucketName={bucketName} />;
}

export default PsdVariationStudioView;
