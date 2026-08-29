/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Flat security tool theme colors
        "background": "#0d1117",      // near-black slate
        "surface": "#11151c",         // one shade lighter
        "border": "#22262f",          // muted hairline border
        "outline-variant": "#22262f",
        "outline": "#30363d",
        
        "on-background": "#c9d1d9",   // off-white text
        "on-surface": "#c9d1d9",
        "on-surface-variant": "#8b949e", // muted gray text
        
        "accent": "#58a6ff",          // desaturated blue accent
        "surface-tint": "#58a6ff",
        "primary": "#58a6ff",
        "primary-container": "#1f242c",
        "on-primary-container": "#58a6ff",
        "secondary-container": "#1f242c",
        "on-secondary-container": "#c9d1d9",
        
        // Semantic severity colors (real security-tool look)
        "severity-critical": "#f85149", // Red
        "severity-high": "#d29922",     // Orange
        "severity-medium": "#8b949e",   // Yellow-Gray (muted)
        "severity-low": "#6e7681",      // Neutral Gray
        
        // Backward compatibility mappings
        "error": "#f85149",
        "error-container": "#f8514920",
        "on-error-container": "#f85149",
        "tertiary-container": "#d2992220",
        "on-tertiary-container": "#d29922",
        "tertiary-fixed-dim": "#d29922",
        "secondary": "#8b949e",
      },
      borderRadius: {
        "DEFAULT": "4px",
        "sm": "2px",
        "lg": "4px",
        "xl": "6px",
        "full": "9999px"
      },
      spacing: {
        "unit": "4px",
        "lg": "12px",            // reduced by ~20%
        "margin-desktop": "16px",
        "2xl": "24px",
        "sm": "6px",
        "xs": "3px",
        "margin-mobile": "12px",
        "md": "8px",
        "gutter": "12px",
        "xl": "16px"
      },
      fontFamily: {
        // UI uses plain sans-serif, data uses mono
        "sans": ["Inter", "system-ui", "-apple-system", "sans-serif"],
        "mono": ["JetBrains Mono", "IBM Plex Mono", "SFMono-Regular", "Consolas", "monospace"],
        "display-lg": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "title-md": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"],
        "code-sm": ["JetBrains Mono", "monospace"],
        "headline-lg-mobile": ["Inter", "sans-serif"]
      },
      fontSize: {
        "display-lg": ["36px", { "lineHeight": "44px", "fontWeight": "700" }],
        "body-sm": ["11px", { "lineHeight": "14px", "fontWeight": "400" }],
        "headline-lg": ["24px", { "lineHeight": "30px", "fontWeight": "600" }],
        "title-md": ["14px", { "lineHeight": "20px", "fontWeight": "600" }],
        "body-md": ["13px", { "lineHeight": "18px", "fontWeight": "400" }],
        "label-caps": ["9px", { "lineHeight": "12px", "letterSpacing": "0.05em", "fontWeight": "700" }],
        "code-sm": ["11px", { "lineHeight": "14px", "fontWeight": "500" }],
        "headline-lg-mobile": ["18px", { "lineHeight": "24px", "fontWeight": "600" }]
      }
    },
  },
  plugins: [],
}
