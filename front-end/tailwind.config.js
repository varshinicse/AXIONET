/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'var(--color-primary)',
                    hover: 'var(--color-primary-hover)',
                    light: 'var(--color-primary-light)',
                    lighter: 'var(--color-primary-lighter)',
                },
                secondary: 'var(--color-secondary)',
                success: 'var(--color-success)',
                error: 'var(--color-error)',
                warning: 'var(--color-warning)',
                background: 'var(--color-bg)',
                surface: 'var(--color-surface)',
                text: {
                    primary: 'var(--color-text-primary)',
                    secondary: 'var(--color-text-secondary)',
                },
                border: 'var(--color-border)',
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'neumorphic-flat': 'var(--neu-flat-shadow)',
                'neumorphic-pressed': 'var(--neu-pressed-shadow)',
            },
            transitionDuration: {
                'fast': 'var(--duration-fast)',
                'normal': 'var(--duration-normal)',
                'slow': 'var(--duration-slow)',
            }
        },
    },
    plugins: [],
}
