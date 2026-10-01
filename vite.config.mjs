// Development inspection only. Production continues to serve authored dist files.
export default {
  root: 'dist',
  publicDir: false,
  cacheDir: '../node_modules/.vite',
  server: {
    host: '0.0.0.0',
    allowedHosts: ['terminal.local'],
    port: 4173,
    strictPort: true
  }
};
