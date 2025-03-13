export default {
  root: ".",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: "index.html",
    },
  },
  server: {
    allowedHosts: ["galblog"] // an alias in /etc/hosts so the SEO browser plugin can check the page
  }
};
