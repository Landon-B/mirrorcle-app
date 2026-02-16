import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';

export const usePaywall = () => {
  const navigation = useNavigation();

  const openPaywall = useCallback(() => {
    // Traverse up to the root navigator to reach the Paywall modal
    let nav = navigation;
    while (nav.getParent()) {
      nav = nav.getParent();
    }
    nav.navigate('Paywall');
  }, [navigation]);

  return { openPaywall };
};
