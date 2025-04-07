const { defineConfig } = require("cypress");
const fs = require('fs');
const installLogsPrinter = require("cypress-terminal-report/src/installLogsPrinter");


module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // Change this based on your dev server
    specPattern: 'test/ui/**/*.cy.{js,jsx,ts,tsx}', // Updated to point to the new test folder
    supportFile: 'cypress/support/e2e.js', // Support scripts
    video: true, // Disable video recording for faster tests
    screenshotOnRunFailure: true, // Capture screenshots on failures,
    setupNodeEvents(on, config) { // Delete video if test pass
      on('after:spec', (spec, results) => {
        if (results && results.video) {
          // Do we have failures for any retry attempts?
          const failures = results.tests.some((test) =>
            test.attempts.some((attempt) => attempt.state === 'failed')
          )
          if (!failures) {
            // delete the video if the spec passed and no tests retried
            fs.unlinkSync(results.video)
          }
        }
      }),
        installLogsPrinter(on, {
          printLogsToConsole: "always",
        });
    },
  }
});
