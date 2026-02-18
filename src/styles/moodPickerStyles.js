import { StyleSheet } from 'react-native';

/**
 * Shared styles for mood picker screens.
 *
 * Used by MoodCheckInScreen (and available for any future
 * screen that uses the quadrant → bubble flow).
 */
export const moodPickerStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headingContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginTop: 8,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  // --- Quadrant badge (shown in bubble view) ---
  quadrantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 12,
    alignSelf: 'center',
  },
  quadrantDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  quadrantBadgeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  // --- Unsure state ---
  unsureSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  unsureEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  unsureValidation: {
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  unsureButton: {
    width: '100%',
  },
});
