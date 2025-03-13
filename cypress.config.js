const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // Change this based on your dev server
    specPattern: 'test/ui/**/*.cy.{js,jsx,ts,tsx}', // Updated to point to the new test folder
    supportFile: 'cypress/support/e2e.js', // Support scripts
    video: false, // Disable video recording for faster tests
    screenshotOnRunFailure: true, // Capture screenshots on failures
  },
});
