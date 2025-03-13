describe('Index loads correctly', () => {
  
  it('Visits the index and the info tooltip appears', () => {
    cy.visit('/');
    cy.waitForI18next();
    cy.get('#info-title').should('not.exist');
    cy.get('#info-content').should('not.exist');
    cy.get('.fa-info-circle').should('be.visible');
    cy.get('.fa-info-circle').click()
    cy.get('#info-title').should('be.visible');
    cy.get('#info-content').should('be.visible');
  });

  it("Should display the info tooltip in Spanish", () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        // Override the browser language for this test
        Object.defineProperty(win.navigator, 'language', {
          value: 'es-ES', // Set to desired locale
          configurable: true,
        });
  
        Object.defineProperty(win.navigator, 'languages', {
          value: ['es-ES', 'es'],
          configurable: true,
        });
      },
    });
    cy.waitForI18next();
    cy.get('.fa-info-circle').click()
    cy.get('#info-title').should('contain', 'Bienvenido')
  })
  
});
