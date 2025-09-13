const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = const io = new Server(server, {
  maxHttpBufferSize: 5 * 1024 * 1024 // 5 MiB
});

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

const PORT = process.env.PORT || 3000;

// Serve the main HTML file for editing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the view-only HTML file
app.get('/view', (req, res) => {
    res.sendFile(path.join(__dirname, 'view.html'));
});


// This will be our single source of truth for the canvas state
let canvasState = []; // Array of image data objects

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // When a new user connects, send them the current state of the canvas
    socket.emit('initial-canvas-state', canvasState);

    // Listen for a user adding an image
    socket.on('add-image', (imageData) => {
        canvasState.push(imageData);
        // Broadcast the new image to all other clients
        io.emit('image-added', imageData);
    });

    // Listen for a user updating the canvas (move, resize)
    socket.on('update-canvas', (newCanvasState) => {
        canvasState = newCanvasState;
        // Broadcast the full new state to all other clients
        socket.broadcast.emit('canvas-updated', canvasState);
    });
    
    // Listen for a user deleting an image
    socket.on('delete-image', (imageIndex) => {
        if(imageIndex >= 0 && imageIndex < canvasState.length) {
            canvasState.splice(imageIndex, 1);
            // Broadcast the full new state to all other clients after deletion
            io.emit('canvas-updated', canvasState);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

// --- Graceful Shutdown Logic ---
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  io.close(() => {
    console.log('Socket.IO server closed.');
  });
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  // Forcefully shutdown after 10 seconds if connections are still open
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

