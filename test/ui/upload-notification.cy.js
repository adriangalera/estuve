const TEST_TRACK = "test/resources/test-track.gpx";
const TEST_TRACK_POINT_COUNT = 2;

describe("Upload notification", () => {

    beforeEach(() => {
        cy.visit('/');
        cy.waitForI18next();
        cy.clearPoints();
        cy.noPointsAdded();
    })

    it("shows a toast with the number of new points after uploading a GPX file", () => {
        cy.get('input[type="file"]').selectFile(TEST_TRACK, { force: true });

        cy.get('#new-points-toast')
            .should('have.class', 'new-points-toast--visible');

        cy.get('.new-points-toast-count')
            .should('have.text', String(TEST_TRACK_POINT_COUNT));

        cy.get('.new-points-toast-message')
            .should('be.visible');
    })

    it("shows zero new points when uploading the same file twice", () => {
        cy.get('input[type="file"]').selectFile(TEST_TRACK, { force: true });

        cy.get('#new-points-toast').should('have.class', 'new-points-toast--visible');
        cy.get('.new-points-toast-close').click();
        cy.get('#new-points-toast').should('not.exist');

        cy.get('input[type="file"]').selectFile(TEST_TRACK, { force: true });

        cy.get('#new-points-toast')
            .should('have.class', 'new-points-toast--visible');

        cy.get('.new-points-toast-count').should('not.exist');
        cy.get('.new-points-toast-message')
            .invoke('text')
            .should('match', /no new points|ya estaban/i);
    })

    it("can be dismissed by clicking the close button", () => {
        cy.get('input[type="file"]').selectFile(TEST_TRACK, { force: true });

        cy.get('#new-points-toast').should('have.class', 'new-points-toast--visible');

        cy.get('.new-points-toast-close').click();

        cy.get('#new-points-toast').should('not.exist');
    })

    it("never shows more than one toast at a time", () => {
        cy.get('input[type="file"]').selectFile(
            "gpx/out-of-sync/0-27-10-20-la-mola-318-m-100-cims-bonastre-tarragona.gpx",
            { force: true }
        );
        cy.get('#new-points-toast').should('have.class', 'new-points-toast--visible');

        cy.get('input[type="file"]').selectFile(TEST_TRACK, { force: true });

        cy.get('#new-points-toast').should('have.length', 1);
    })
})
