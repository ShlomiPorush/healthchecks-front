module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: false,
    theme: {
        extend: {
            animation: {
                "ping-slow": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
            },
        },
    },
    plugins: [],
};
