const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configure express to handle large data payloads (up to 5MB)
// This is necessary for handling larger image uploads from the client
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use(express.static('public'));

let canvasState = [];

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send the current canvas state to the newly connected client
    socket.emit('initial-canvas-state', canvasState);

    // Handle incoming image data from a client
    socket.on('add-image', (newImageData) => {
        canvasState.push(newImageData);
        // Broadcast the new image to all other clients
        socket.broadcast.emit('image-added', newImageData);
    });

    // Handle updates to the canvas state from a client
    socket.on('update-canvas', (newState) => {
        canvasState = newState;
        // Broadcast the updated state to all other clients
        socket.broadcast.emit('canvas-updated', canvasState);
    });

    // Handle image deletion
    socket.on('delete-image', (index) => {
        if (index > -1 && index < canvasState.length) {
            canvasState.splice(index, 1);
            socket.broadcast.emit('canvas-updated', canvasState);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
