export default {
  root: ".",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "index.html",
        plan: "plan.html"
      },
    },
  },
  server: {
    allowedHosts: ["galblog"] // an alias in /etc/hosts so the SEO browser plugin can check the page
  }
};
