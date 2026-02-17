import { useTheme } from '../context/ThemeContext';
import { lightPalette, darkPalette, lightGradients, darkGradients } from '../styles/colors';

export function useColors() {
  const { colorScheme } = useTheme();
  return colorScheme === 'dark' ? darkPalette : lightPalette;
}

export function useGradients() {
  const { colorScheme } = useTheme();
  return colorScheme === 'dark' ? darkGradients : lightGradients;
}
