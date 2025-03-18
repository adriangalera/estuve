describe('Clear button', () => {

    it('the clear button deletes the data', () => {
        cy.visit('/');
        cy.waitForI18next();
        cy.clearPoints();
        cy.noPointsAdded();
    });
})