import { Platform } from 'react-native';
import { AFFIRMATIONS } from '../../constants/affirmations';

class WidgetDataServiceClass {
  constructor() {
    this.lastAffirmation = null;
    this._resolved = false;
    this._updateWidgetSnapshot = null;
    this._AffirmationWidget = null;
  }

  _resolve() {
    if (this._resolved) return;
    this._resolved = true;
    try {
      this._updateWidgetSnapshot = require('expo-widgets').updateWidgetSnapshot;
      this._AffirmationWidget = require('../../widgets/AffirmationWidget').default;
    } catch {
      // expo-widgets native module not available (e.g. Expo Go)
    }
  }

  syncWidget() {
    if (Platform.OS !== 'ios') return;

    this._resolve();
    if (!this._updateWidgetSnapshot || !this._AffirmationWidget) return;

    try {
      const affirmation = this.getRandomAffirmation();

      this._updateWidgetSnapshot('AffirmationWidget', this._AffirmationWidget, {
        text: affirmation.text,
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
