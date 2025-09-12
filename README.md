Collaborative Canvas Application

This project contains a real-time collaborative canvas application powered by Node.js, Express, and Socket.IO, and is containerized using Docker.
How to Run with Docker
Prerequisites

    Docker must be installed and running on your machine.

Steps

    Save all the files (package.json, server.js, index.html, view.html, Dockerfile, README.md) into a new, empty directory.

    Open a terminal or command prompt and navigate into that directory.

    Build the Docker image by running the following command. This will create an image named collaborative-canvas:

    docker build -t collaborative-canvas .

    Run the Docker container from the image you just built. This command maps port 3000 inside the container to port 3000 on your local machine:

    docker run -p 3000:3000 collaborative-canvas

    Access the application:

        To edit the canvas: Open a web browser and navigate to http://localhost:3000

        For a view-only presentation mode: Use the URL http://localhost:3000/view

    To see the real-time collaboration, open the editing URL in one window and the view-only URL in another. Any changes made in the editing window will instantly appear in the viewing window.