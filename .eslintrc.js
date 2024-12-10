module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended" // If using React
    ],
    overrides: [
        {
            // Test files only
            files: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
            extends: ["plugin:testing-library/react"],
        },
    ],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
    },
    plugins: [
        "react" // If using React
    ],
    rules: {
        "quotes": ["error", "double"], // Enforce double quotes
        "semi": "off"
    }
};
