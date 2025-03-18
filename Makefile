.PHONY: gpx
gpx:
	cp ~/Downloads/data.json scripts/suunto
	node scripts/suunto/download.js
	cp -r gpx/out-of-sync/* gpx/all/.
	cp -r gpx/suunto/* gpx/all/.

.PHONY: test
test:
	npm run test

.PHONY: deploy
deploy: test
	npm run deploy	