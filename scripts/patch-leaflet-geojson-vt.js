const fs = require('fs');
const path = require('path');

const pkgPath = path.join(
  'node_modules',
  'leaflet-geojson-vt',
  'package.json'
);

// Check file exists
if (!fs.existsSync(pkgPath)) {
  console.error('package.json not found:', pkgPath);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Perform substitution
if (pkg.main === 'index.js') {
  pkg.main = 'src/leaflet-geojson-vt.js';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
  console.log('Updated main field in package.json');
} else {
  console.log('No change needed: "main" is not "index.js"');
}
