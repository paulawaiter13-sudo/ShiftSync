export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                ink: '#0f172a',
                canvas: '#f6efe7',
                panel: '#fffaf4',
                line: '#dbc9b7',
                accent: '#c4602f',
                accentDark: '#8c3812',
                success: '#2b6f5f',
                warning: '#9a6a12',
                danger: '#9d2f2f'
            },
            boxShadow: {
                panel: '0 20px 45px rgba(15, 23, 42, 0.08)'
            },
            fontFamily: {
                heading: ['"Space Grotesk"', 'sans-serif'],
                body: ['"Public Sans"', 'sans-serif']
            }
        }
    },
    plugins: []
};
