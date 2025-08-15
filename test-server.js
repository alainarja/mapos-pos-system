const { exec } = require('child_process');
const http = require('http');

// Start Next.js dev server
const server = exec('npm run dev', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
});

// Wait a bit for server to start
setTimeout(() => {
  // Test if server is running
  http.get('http://localhost:3000', (res) => {
    console.log(`Server is running! Status code: ${res.statusCode}`);
    server.kill();
    process.exit(0);
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
    server.kill();
    process.exit(1);
  });
}, 5000);

// Kill server after 20 seconds
setTimeout(() => {
  server.kill();
  process.exit(0);
}, 20000);