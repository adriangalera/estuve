const path = require("path");
const emptyBackupFile = 496

describe("Download button", () => {

    beforeEach(() => {
        cy.visit('/');
        cy.waitForI18next();
        cy.clearPoints();
        cy.noPointsAdded();
    })

    it("Download empty quadtree", () => {
        cy.get(".fa-download").click()
        const downloadsFolder = Cypress.config("downloadsFolder");
        cy.readFile(path.join(downloadsFolder, "estuve.bin"), 'binary')
            .should("exist")
            .should('have.length', emptyBackupFile)
    })
})