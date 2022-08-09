import { Theme, ThemeOptions } from '@mui/material/styles';
import { createTheme } from "@mui/material"
declare module "@mui/material/styles/createPalette" {
  interface Palette {
    kakao: Palette["primary"];
  }
  interface PaletteOptions {
    kakao: PaletteOptions["primary"];
  }
}

// Extend color prop on components
declare module "@mui/material/Button" {
  export interface ButtonPropsColorOverrides {
    kakao: true;
  }
}
const lightThemeOptions= {
  palette: {
    mode: 'light',
    kakao: {
      main: "#fee500",
      dark: "#fee500",
      light: "#fee500",
      contrastText: "#fee500",
    },
  },
} as const
const darkThemeOptions= {
  palette: {
    mode: 'dark',
    kakao: {
      main: "#fee500",
      dark: "#fee500",
      light: "#fee500",
      contrastText: "#fee500",
    },
  },
} as const
type CustomTheme = {
  [Key in keyof typeof lightThemeOptions]: typeof lightThemeOptions[Key]
}
declare module '@mui/material/styles/createTheme' {
  interface Theme extends CustomTheme { }
  interface ThemeOptions extends CustomTheme { }
}
export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme =  createTheme(darkThemeOptions);
