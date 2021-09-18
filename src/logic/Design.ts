import { ColorName as IColorName, InterpolatedMaterialColors as MaterialColors } from "interpolated-material-colors";
import { createFont } from "ts-fonts";

export function grid(
  big: number, // 8 cells
  half: 0 | 1 = 0, // 4 cells
  quarter: 0 | 1 = 0, // 2 cells
  eighth: 0 | 1 = 0 // 1 cells
): number {
  const cells = big * 8 + half * 4 + quarter * 2 + eighth;
  return cells * 3;
}

export type ColorName = IColorName;

export const Colors = {
  black: MaterialColors.blueGrey(950),
  white: MaterialColors.blueGrey(0),
  ...MaterialColors,
  resolve: resolveTuple,
};

export type ColorTuple = ColorName | [ColorName, number];

function resolveTuple(tuple: ColorTuple): string {
  if (Array.isArray(tuple)) {
    return Colors[tuple[0]](tuple[1]);
  }
  return Colors[tuple](500);
}

const LINE_HEIGHT_RATIO = 0.625;

function fontSizeFromLineHeight(size: number) {
  return Math.floor(size * LINE_HEIGHT_RATIO);
}

export function fontHeight(size: number): { fontSize: number; lineHeight: string } {
  return {
    fontSize: fontSizeFromLineHeight(size),
    lineHeight: size + "px",
  } as const;
}

export function fontHeightGrid(
  big: number, // 8 cells
  half?: 0 | 1, // 4 cells
  quarter?: 0 | 1, // 2 cells
  eighth?: 0 | 1 // 1 cells
): { fontSize: number; lineHeight: string } {
  return fontHeight(grid(big, half, quarter, eighth));
}

const JetBrainsMono = createFont(`JetBrains Mono`, {
  100: {
    normal: "/fonts/JetBrainsMono-Thin",
    italic: "/fonts/JetBrainsMono-ThinItalic",
  },
  200: {
    normal: "/fonts/JetBrainsMono-ExtraLight",
    italic: "/fonts/JetBrainsMono-ExtraLightItalic",
  },
  300: {
    normal: "/fonts/JetBrainsMono-Light",
    italic: "/fonts/JetBrainsMono-LightItalic",
  },
  400: {
    normal: "/fonts/JetBrainsMono-Regular",
    italic: "/fonts/JetBrainsMono-Italic",
  },
  500: {
    normal: "/fonts/JetBrainsMono-Medium",
    italic: "/fonts/JetBrainsMono-MediumItalic",
  },
  600: {
    normal: "/fonts/JetBrainsMono-SemiBold",
    italic: "/fonts/JetBrainsMono-SemiBoldItalic",
  },
  700: {
    italic: "/fonts/JetBrainsMono-BoldItalic",
    normal: "/fonts/JetBrainsMono-Bold",
  },
  800: {
    normal: "/fonts/JetBrainsMono-ExtraBold",
    italic: "/fonts/JetBrainsMono-ExtraBoldItalic",
  },
});

export const fontFaces = JetBrainsMono.fontFaces;

export const Fonts = {
  JetBrainsMono: JetBrainsMono.styles,
};
