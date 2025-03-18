describe("Upload button", () => {

    beforeEach(() => {
        cy.visit('/');
        cy.waitForI18next();
        cy.clearPoints();
        cy.noPointsAdded();
    })

    it("uploads single GPX track", () => {
        cy.get('input[type="file"]').selectFile(
            "gpx/out-of-sync/0-27-10-20-la-mola-318-m-100-cims-bonastre-tarragona.gpx",
            { force: true });

        cy.shouldHaveSomePointsAdded()

    })
    it("uploads multiple GPX tracks", () => {
        cy.get('input[type="file"]').selectFile([
            "gpx/out-of-sync/3-la-porta-del-cel-certascan-a-pinet.gpx",
            "gpx/out-of-sync/alzina-del-salari-turo-del-mal-pas.gpx"
        ], { force: true });

        cy.shouldHaveSomePointsAdded()
    })
})