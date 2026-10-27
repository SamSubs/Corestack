/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'tech-blue': '#0070f3', // Azul elétrico para seu portfólio
            }
        },
    },
    plugins: [],
}