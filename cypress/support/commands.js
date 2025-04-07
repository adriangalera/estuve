// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


Cypress.Commands.add('waitForI18next', () => {
  cy.window().should((win) => {
    expect(win.i18next.isInitialized).to.be.true;
  });
});

Cypress.Commands.add('noPointsAdded', () => {
  cy.window().should((win) => {
    expect(win.geoJsonLayer.tileIndex.tileCoords.length).to.equal(0);
  });
});

Cypress.Commands.add('shouldHaveSomePointsAdded', () => {
  cy.window().should((win) => {
    expect(win.geoJsonLayer.tileIndex.tileCoords.length).to.be.greaterThan(0);
  });
});

Cypress.Commands.add('clearPoints', () => {
  cy.window().then(() => {
    cy.on('window:confirm', (str) => {
      return true
    })
    cy.get(".fa-trash").click()
  });
});

Cypress.Commands.add('getLoadedLayers', () => {
  cy.window().then((win) => {
    let layers = []
    win.map.eachLayer(function (layer) {
      if (layer.options && layer.options.name) {
        layers.push(layer.options.name)
      }
    });
    cy.wrap(layers)
  })
})

let LOCAL_STORAGE_MEMORY = {};

Cypress.Commands.add("saveLocalStorage", () => {
  Object.keys(localStorage).forEach(key => {
    LOCAL_STORAGE_MEMORY[key] = localStorage[key];
  });
});

Cypress.Commands.add("restoreLocalStorage", () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
  });
});