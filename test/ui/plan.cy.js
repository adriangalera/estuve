describe("Plan View", () => {
    beforeEach(() => {
        cy.visit('/plan.html');
        cy.waitForI18next();
    });

    it('should load the plan view with map', () => {
        cy.get('#map').should('be.visible');
    });

    it('should show upload and delete buttons', () => {
        cy.get('.fa-upload').should('be.visible');
        cy.get('.fa-trash-alt').should('be.visible');
    });

    it('should show layer control but no other main view buttons', () => {
        // Layer control should be present
        cy.get('.leaflet-control-layers').should('be.visible');
        
        // Main view buttons should NOT be present
        cy.get('.fa-info').should('not.exist');
        cy.get('.fa-download').should('not.exist');
        cy.get('.fa-plus').should('not.exist');
        cy.get('.fa-layer-group').should('not.exist');
    });

    it('should upload a GPX file and display it on the map', () => {
        // Check initial state - no tracks
        cy.window().then((win) => {
            expect(win.gpxManager.getAllTrackNames()).to.have.length(0);
        });

        // Upload a GPX file
        cy.get('#planGpxFileInput').selectFile('test/resources/test-track.gpx', { force: true });

        // Wait for the file to be processed
        cy.wait(1000);

        // Verify track was added
        cy.window().then((win) => {
            const trackNames = win.gpxManager.getAllTrackNames();
            expect(trackNames.length).to.be.greaterThan(0);
        });

        // Verify track appears in layer control
        cy.get('.leaflet-control-layers').should('contain', 'test-track');
    });

    it('should upload multiple GPX files', () => {
        // Upload multiple files
        cy.get('#planGpxFileInput').selectFile([
            'test/resources/test-track.gpx',
            'test/resources/test-track.gpx'
        ], { force: true });

        cy.wait(1000);

        // Verify multiple tracks were added
        cy.window().then((win) => {
            const trackNames = win.gpxManager.getAllTrackNames();
            expect(trackNames.length).to.be.greaterThan(1);
        });
    });

    it('should show delete popup when no tracks exist', () => {
        // Click delete button
        cy.get('.fa-trash-alt').click();

        // Should show alert about no tracks
        cy.on('window:alert', (text) => {
            expect(text).to.contain('No tracks to delete');
        });
    });

    it('should delete a single track', () => {
        // First upload a track
        cy.get('#planGpxFileInput').selectFile('test/resources/test-track.gpx', { force: true });
        cy.wait(1000);

        // Get the track name
        let trackName;
        cy.window().then((win) => {
            trackName = win.gpxManager.getAllTrackNames()[0];
        });

        // Click delete button
        cy.get('.fa-trash-alt').click();

        // Verify delete popup is shown
        cy.get('#plan-delete-section').should('be.visible');
        cy.get('#plan-tracks-list').should('be.visible');

        // Click remove button for the track
        cy.get('.remove-track-btn').first().click();

        // Verify track was removed
        cy.window().then((win) => {
            expect(win.gpxManager.getAllTrackNames()).to.have.length(0);
        });
    });

    it('should delete all tracks at once', () => {
        // Upload multiple tracks
        cy.get('#planGpxFileInput').selectFile([
            'test/resources/test-track.gpx',
            'test/resources/test-track.gpx'
        ], { force: true });
        cy.wait(1000);

        // Verify tracks exist
        cy.window().then((win) => {
            expect(win.gpxManager.getAllTrackNames().length).to.be.greaterThan(1);
        });

        // Click delete button
        cy.get('.fa-trash-alt').click();

        // Click delete all button and confirm
        cy.get('#delete-all-tracks-btn').click();
        
        // Cypress auto-confirms the confirm dialog
        cy.on('window:confirm', () => true);

        // Verify all tracks were removed
        cy.window().then((win) => {
            expect(win.gpxManager.getAllTrackNames()).to.have.length(0);
        });
    });

    it('should not delete all tracks when user cancels', () => {
        // Upload a track
        cy.get('#planGpxFileInput').selectFile('test/resources/test-track.gpx', { force: true });
        cy.wait(1000);

        // Click delete button
        cy.get('.fa-trash-alt').click();

        // Click delete all button but cancel
        cy.on('window:confirm', () => false);
        cy.get('#delete-all-tracks-btn').click();

        // Verify track still exists
        cy.window().then((win) => {
            expect(win.gpxManager.getAllTrackNames().length).to.be.greaterThan(0);
        });
    });

    it('should toggle track visibility in layer control', () => {
        // Upload a track
        cy.get('#planGpxFileInput').selectFile('test/resources/test-track.gpx', { force: true });
        cy.wait(1000);

        // Get the track checkbox in layer control
        cy.get('.leaflet-control-layers-overlays input[type="checkbox"]')
            .last()
            .should('be.checked');

        // Uncheck to hide the track
        cy.get('.leaflet-control-layers-overlays input[type="checkbox"]')
            .last()
            .click();

        // Verify it's unchecked
        cy.get('.leaflet-control-layers-overlays input[type="checkbox"]')
            .last()
            .should('not.be.checked');
    });

    it('should handle invalid GPX files gracefully', () => {
        // Create a fake invalid file
        const invalidContent = 'This is not a valid GPX file';
        const blob = new Blob([invalidContent], { type: 'text/plain' });
        const file = new File([blob], 'invalid.gpx', { type: 'application/gpx+xml' });

        // Try to upload the invalid file
        cy.get('#planGpxFileInput').selectFile({
            contents: Cypress.Buffer.from(invalidContent),
            fileName: 'invalid.gpx',
            mimeType: 'application/gpx+xml'
        }, { force: true });

        // Should show an error alert
        cy.on('window:alert', (text) => {
            expect(text).to.exist;
        });
    });

    it('should maintain tracks when switching between base layers', () => {
        // Upload a track
        cy.get('#planGpxFileInput').selectFile('test/resources/test-track.gpx', { force: true });
        cy.wait(1000);

        const initialTrackCount = cy.window().then((win) => {
            return win.gpxManager.getAllTrackNames().length;
        });

        // Switch to different base layer
        cy.get('.leaflet-control-layers-base input[type="radio"]')
            .eq(1)
            .click();

        // Verify tracks are still there
        cy.window().then((win) => {
            initialTrackCount.then((count) => {
                expect(win.gpxManager.getAllTrackNames()).to.have.length(count);
            });
        });
    });

    it('should use search control to find locations', () => {
        // Verify search control exists
        cy.get('.leaflet-geosearch-bar').should('exist');
        
        // Type in search
        cy.get('.leaflet-geosearch-bar input').type('Barcelona');
        
        // Search results should appear (if available)
        cy.wait(1000);
    });
});
