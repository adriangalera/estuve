export default {
  root: ".",  // Ensure Vite serves from root
  build: {
    outDir: "dist", // Output folder
    rollupOptions: {
      input: "index.html", // Entry point
    },
  },
  server: {
    allowedHosts: ["galblog"]
  }
};
