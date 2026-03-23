.PHONY: suunto
suunto:
	node scripts/suunto/server.js

.PHONY: wikiloc
wikiloc:
	node scripts/wikiloc/server.js

.PHONY: wikiloc-reset
wikiloc-reset:
	node scripts/wikiloc/server.js --reset

.PHONY: gpx
gpx:
	cp -r gpx/out-of-sync/* gpx/all/.
	cp -r gpx/suunto/* gpx/all/.
	cp -r gpx/wikiloc/* gpx/all/.

.PHONY: test
test:
	npm run test

.PHONY: deploy
deploy: test
	npm run deploy	