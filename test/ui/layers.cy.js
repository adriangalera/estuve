describe("Layer buttons", () => {

    const layerName = "Mendikat"
    const layerUrl = "https://raw.githubusercontent.com/adriangalera/100cims/refs/heads/main/data/mendikat/cims.geojson"

    beforeEach(() => {
        cy.restoreLocalStorage();
    });

    afterEach(() => {
        cy.saveLocalStorage();
    });

    it('add a new layer', () => {
        cy.visit('/');
        cy.waitForI18next();
        cy.clearPoints();
        cy.noPointsAdded();

        cy.get(".fa-plus").click()
        cy.get("#geojson-layer-form").should('be.visible')

        cy.get("#new-layer-name").type(layerName)
        cy.get("#new-layer-url").type(layerUrl)

        cy.get('#geojson-layer-form button[type="submit"]').click();

        cy.getLoadedLayers().then((layers) => expect(layers).not.to.include("Mendikat"))

        cy.contains('label', layerName)
            .find('input.leaflet-control-layers-selector')
            .click();

        cy.getLoadedLayers().then((layers) => expect(layers).to.include("Mendikat"))
    });

    it('the layer should be there at reload', () => {
        cy.visit('/');
        cy.waitForI18next();

        cy.contains('label', layerName)
            .find('input.leaflet-control-layers-selector')
            .click();

        cy.getLoadedLayers().then((layers) => expect(layers).to.include("Mendikat"))
    })

    it('delete the layer', () => {
        cy.visit('/');
        cy.waitForI18next();

        cy.get(".fa-layer-group").click()
        cy.get('#existing-layers-section').should('be.visible');

        cy.contains('#existing-layers-list li', layerName)
            .find('button.remove-layer-btn')
            .click();

        cy.getLoadedLayers().then((layers) => expect(layers).not.to.include("Mendikat"))

        cy.get('input.leaflet-control-layers-selector')
            .filter((index, el) => el.closest('label')?.textContent.includes(layerName))
            .should('have.length', 0);
    })

})