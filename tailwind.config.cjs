/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./src/**/*"],
    theme: {
        extend: {
            keyframes: {
                fadeInKeyFrame: {
                    "0%, 70%, 100%": { opacity: 1 },
                    "10%": { opacity: 0 },
                    "60%": { opacity: 0 },
                },
            },
            animation: {
                fadeIn: "fadeInKeyFrame 5s linear infinite",
            },
        },
    },
    plugins: [],
};
