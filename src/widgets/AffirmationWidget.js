import React from 'react';
import { Text, VStack, Spacer } from '@expo/ui/swift-ui';
import { font, foregroundStyle, background, padding, frame } from '@expo/ui/swift-ui/modifiers';

const AffirmationWidget = (props) => {
  const { text, color1, color2 } = props;
  const primaryColor = color1 || '#A855F7';
  const secondaryColor = color2 || '#EC4899';

  return (
    <VStack
      alignment="center"
      spacing={8}
      modifiers={[
        frame({ maxWidth: 10000, maxHeight: 10000 }),
        background(primaryColor),
        padding({ all: 20 }),
      ]}
    >
      <Text
        modifiers={[
          font({ size: 10, weight: 'medium', design: 'rounded' }),
          foregroundStyle(secondaryColor),
        ]}
      >
        mirrorcle
      </Text>
      <Spacer />
      <Text
        modifiers={[
          font({ size: 18, weight: 'bold', design: 'rounded' }),
          foregroundStyle('#FFFFFF'),
          padding({ horizontal: 4 }),
        ]}
      >
        {text || 'I am worthy of love and respect'}
      </Text>
      <Spacer />
    </VStack>
  );
};

export default AffirmationWidget;
