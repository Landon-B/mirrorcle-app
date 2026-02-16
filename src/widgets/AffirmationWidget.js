import React from 'react';
import { Text, VStack, HStack, ZStack, Spacer, RoundedRectangle, Circle } from '@expo/ui/swift-ui';
import {
  font,
  foregroundStyle,
  background,
  padding,
  frame,
  opacity,
  multilineTextAlignment,
  lineSpacing,
  kerning,
  textCase,
  lineLimit,
} from '@expo/ui/swift-ui/modifiers';

const AffirmationWidget = (props) => {
  const { text, family } = props;

  // Warm light palette — matches the app's calm, reflective identity
  const cream = '#F5F2EE';
  const creamDark = '#EDE8E2';
  const terracotta = '#C17666';
  const terracottaLight = '#E8A090';
  const textDark = '#2D2A26';
  const textMuted = '#B0AAA2';
  const accentPeach = '#E8D0C6';

  const isSmall = family === 'systemSmall';

  return (
    <ZStack
      alignment="center"
      modifiers={[
        frame({ maxWidth: 10000, maxHeight: 10000 }),
        background(cream),
      ]}
    >
      {/* Subtle decorative circle — top right, soft peach glow */}
      <VStack
        alignment="trailing"
        modifiers={[
          frame({ maxWidth: 10000, maxHeight: 10000 }),
          padding({ top: -20, trailing: -20 }),
        ]}
      >
        <Circle
          modifiers={[
            frame({ width: isSmall ? 80 : 100, height: isSmall ? 80 : 100 }),
            foregroundStyle(accentPeach),
            opacity(0.3),
          ]}
        />
        <Spacer />
      </VStack>

      {/* Subtle decorative circle — bottom left, warm cream */}
      <VStack
        alignment="leading"
        modifiers={[
          frame({ maxWidth: 10000, maxHeight: 10000 }),
          padding({ bottom: -30, leading: -30 }),
        ]}
      >
        <Spacer />
        <Circle
          modifiers={[
            frame({ width: isSmall ? 60 : 80, height: isSmall ? 60 : 80 }),
            foregroundStyle(creamDark),
            opacity(0.5),
          ]}
        />
      </VStack>

      {/* Main content */}
      <VStack
        alignment="leading"
        spacing={isSmall ? 6 : 10}
        modifiers={[
          frame({ maxWidth: 10000, maxHeight: 10000 }),
          padding({ all: isSmall ? 16 : 20 }),
        ]}
      >
        {/* Brand label */}
        <HStack alignment="center" spacing={6}>
          <RoundedRectangle
            cornerRadius={2}
            modifiers={[
              frame({ width: 14, height: 3 }),
              foregroundStyle(terracotta),
            ]}
          />
          <Text
            modifiers={[
              font({ size: isSmall ? 9 : 10, weight: 'semibold' }),
              foregroundStyle(textMuted),
              textCase('uppercase'),
              kerning(2),
            ]}
          >
            mirrorcle
          </Text>
        </HStack>

        <Spacer />

        {/* Affirmation text — serif italic for warmth and intimacy */}
        <Text
          modifiers={[
            font({
              family: 'Georgia',
              size: isSmall ? 16 : 20,
              weight: 'regular',
            }),
            foregroundStyle(textDark),
            lineSpacing(isSmall ? 4 : 6),
            multilineTextAlignment('leading'),
            lineLimit(isSmall ? 4 : 5),
          ]}
        >
          {text || 'I am worthy of love and respect'}
        </Text>

        <Spacer />

        {/* Bottom accent bar — terracotta gradient via two stacked rounded rects */}
        <HStack alignment="center" spacing={isSmall ? 8 : 12}>
          <RoundedRectangle
            cornerRadius={2}
            modifiers={[
              frame({ width: isSmall ? 24 : 32, height: 3 }),
              foregroundStyle(terracotta),
            ]}
          />
          <RoundedRectangle
            cornerRadius={2}
            modifiers={[
              frame({ width: isSmall ? 12 : 16, height: 3 }),
              foregroundStyle(terracottaLight),
              opacity(0.6),
            ]}
          />
        </HStack>
      </VStack>
    </ZStack>
  );
};

export default AffirmationWidget;
