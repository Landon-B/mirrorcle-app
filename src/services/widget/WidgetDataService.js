import { Platform } from 'react-native';
import { updateWidgetSnapshot } from 'expo-widgets';
import AffirmationWidget from '../../widgets/AffirmationWidget';
import { AFFIRMATIONS } from '../../constants/affirmations';
import { DEFAULT_THEME } from '../../constants/themes';

class WidgetDataServiceClass {
  constructor() {
    this.lastAffirmation = null;
  }

  syncWidget(theme = null) {
    if (Platform.OS !== 'ios') return;

    try {
      const currentTheme = theme || DEFAULT_THEME;
      const affirmation = this.getRandomAffirmation();

      updateWidgetSnapshot('AffirmationWidget', AffirmationWidget, {
        text: affirmation.text,
        colors: currentTheme.primary,
      });

      this.lastAffirmation = affirmation;
    } catch (error) {
      console.error('Error syncing widget:', error);
    }
  }

  getRandomAffirmation() {
    const index = Math.floor(Math.random() * AFFIRMATIONS.length);
    return AFFIRMATIONS[index];
  }
}

export const widgetDataService = new WidgetDataServiceClass();
