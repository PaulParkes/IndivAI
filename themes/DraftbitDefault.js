import { systemWeights } from 'react-native-typography';
import palettes from './palettes';
import { createTheme, DefaultTheme } from '@draftbit/ui';
export default createTheme({
  breakpoints: {},
  palettes,
  baseTheme: DefaultTheme,
  theme: {
    name: 'Draftbit Default',
    colors: {
      background: {
        base: {
          default: palettes.Gray[50],
          dark: palettes.Indigo[900],
        },
        brand: {
          default: palettes.Indigo[100],
          dark: palettes.Indigo[900],
        },
        danger: {
          default: palettes.Rose[100],
          dark: palettes.Rose[900],
        },
        info: {
          default: palettes.Cyan[100],
          dark: palettes.Cyan[900],
        },
        success: {
          default: palettes.Emerald[100],
          dark: palettes.Emerald[900],
        },
        warning: {
          default: palettes.Yellow[100],
          dark: palettes.Yellow[900],
        },
      },
      border: {
        base: {
          default: palettes.Indigo[300],
          dark: palettes.Indigo[700],
        },
        brand: {
          default: palettes.Indigo[300],
          dark: palettes.Indigo[700],
        },
        danger: {
          default: palettes.Rose[300],
          dark: palettes.Rose[700],
        },
        info: {
          default: palettes.Cyan[300],
          dark: palettes.Cyan[700],
        },
        success: {
          default: palettes.Emerald[300],
          dark: palettes.Emerald[700],
        },
        warning: {
          default: palettes.Yellow[300],
          dark: palettes.Yellow[700],
        },
      },
      branding: {
        primary: {
          default: palettes.Indigo[600],
          dark: palettes.Indigo[400],
        },
        secondary: {
          default: palettes.Cyan[600],
          dark: palettes.Cyan[400],
        },
      },
      foreground: {
        base: {
          default: palettes.Indigo[900],
          dark: palettes.Indigo[100],
        },
        brand: {
          default: palettes.Indigo[900],
          dark: palettes.Indigo[100],
        },
        danger: {
          default: palettes.Rose[700],
          dark: palettes.Rose[200],
        },
        info: {
          default: palettes.Cyan[700],
          dark: palettes.Cyan[200],
        },
        success: {
          default: palettes.Emerald[700],
          dark: palettes.Emerald[200],
        },
        warning: {
          default: palettes.Yellow[700],
          dark: palettes.Yellow[200],
        },
      },
      text: {
        danger: {
          default: palettes.Rose[600],
          dark: palettes.Rose[400],
        },
        light: {
          default: palettes.Neutral[400],
          dark: palettes.Neutral[400],
        },
        medium: {
          default: palettes.Neutral[700],
          dark: palettes.Neutral[200],
        },
        normal: {
          default: palettes.Neutral[600],
          dark: palettes.Neutral[300],
        },
        strong: {
          default: palettes.Neutral[900],
          dark: palettes.Neutral[50],
        },
        success: {
          default: palettes.Emerald[600],
          dark: palettes.Emerald[400],
        },
        warning: {
          default: palettes.Yellow[600],
          dark: palettes.Yellow[400],
        },
      },
    },
    typography: {
      body1: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.regular ?? {}),
        fontWeight: '400',
        fontSize: 16,
      },
      body2: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.regular ?? {}),
        fontWeight: '400',
        fontSize: 14,
      },
      button: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.bold ?? {}),
        fontWeight: '700',
        fontSize: 14,
      },
      caption: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.regular ?? {}),
        fontWeight: '400',
        fontSize: 12,
      },
      headline1: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.bold ?? {}),
        fontWeight: '700',
        fontSize: 60,
      },
      headline2: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.bold ?? {}),
        fontWeight: '700',
        fontSize: 48,
      },
      headline3: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.bold ?? {}),
        fontWeight: '700',
        fontSize: 34,
      },
      headline4: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.bold ?? {}),
        fontWeight: '700',
        fontSize: 24,
      },
      headline5: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.bold ?? {}),
        fontWeight: '700',
        fontSize: 20,
      },
      headline6: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.bold ?? {}),
        fontWeight: '700',
        fontSize: 16,
      },
      overline: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.regular ?? {}),
        fontWeight: '400',
        fontSize: 12,
      },
      subtitle1: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.regular ?? {}),
        fontWeight: '400',
        fontSize: 16,
      },
      subtitle2: {
        ...(({ backgroundColor, ...o }) => o)(systemWeights.regular ?? {}),
        fontWeight: '400',
        fontSize: 14,
      },
    },
  },
});
