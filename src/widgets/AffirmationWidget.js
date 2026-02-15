import React from 'react';
import { Text, VStack, ZStack, Spacer } from '@expo/ui/swift-ui';
import { font, foregroundStyle, background, cornerRadius, padding, frame, bold } from '@expo/ui/swift-ui/modifiers';

const FONT_SIZES = {
  systemSmall: 14,
  systemMedium: 16,
  systemLarge: 22,
};

const AffirmationWidget = (props) => {
  const { text, colors, family } = props;
  const fontSize = FONT_SIZES[family] || 16;
  const gradientColors = colors || ['#A855F7', '#EC4899'];
  const showBranding = family === 'systemLarge';

  return (
    <ZStack
      alignment="center"
      modifiers={[
        frame({ maxWidth: Infinity, maxHeight: Infinity }),
        background({
          type: 'linearGradient',
          colors: gradientColors,
          startPoint: { x: 0, y: 0 },
          endPoint: { x: 1, y: 1 },
        }),
      ]}
    >
      <VStack
        alignment="center"
        spacing={showBranding ? 12 : 8}
        modifiers={[
          frame({ maxWidth: Infinity, maxHeight: Infinity }),
          background('#0F172AE6'),
          cornerRadius(16),
          padding({ all: showBranding ? 20 : 14 }),
        ]}
      >
        {showBranding && (
          <Text
            modifiers={[
              font({ size: 12, weight: 'medium', design: 'rounded' }),
              foregroundStyle({
                type: 'linearGradient',
                colors: gradientColors,
                startPoint: { x: 0, y: 0 },
                endPoint: { x: 1, y: 0 },
              }),
            ]}
          >
            mirrorcle
          </Text>
        )}
        <Spacer />
        <Text
          modifiers={[
            font({ size: fontSize, weight: 'semibold', design: 'rounded' }),
            foregroundStyle('#FFFFFF'),
            padding({ horizontal: 4 }),
          ]}
        >
          {text || 'I am worthy of love and respect'}
        </Text>
        <Spacer />
      </VStack>
    </ZStack>
  );
};

export default AffirmationWidget;
