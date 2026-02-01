import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaywallModal } from './PaywallModal';

export const FeatureGate = ({ feature, children, fallback = null }) => {
  const { isPro } = useApp();
  const [showPaywall, setShowPaywall] = useState(false);

  if (isPro) {
    return <>{children}</>;
  }

  // Render fallback with paywall trigger
  if (fallback) {
    return (
      <>
        {React.cloneElement(fallback, {
          onPress: () => setShowPaywall(true),
        })}
        <PaywallModal
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
          feature={feature}
        />
      </>
    );
  }

  return null;
};

// Hook version for more flexibility
export const useFeatureGate = () => {
  const { isPro } = useApp();
  const [showPaywall, setShowPaywall] = useState(false);
  const [currentFeature, setCurrentFeature] = useState('');

  const checkAccess = (feature) => {
    if (isPro) return true;
    setCurrentFeature(feature);
    setShowPaywall(true);
    return false;
  };

  const PaywallComponent = () => (
    <PaywallModal
      visible={showPaywall}
      onClose={() => setShowPaywall(false)}
      feature={currentFeature}
    />
  );

  return { isPro, checkAccess, PaywallComponent };
};
