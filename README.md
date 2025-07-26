# Real-time Chat Application with Gemini AI

This project is a full-stack, real-time chat application featuring AI-powered enhancements via the Gemini API. It is built with a scalable backend using Node.js, Socket.IO, and Redis, and a dynamic frontend using Vue.js.

This project demonstrates proficiency in building modern, interactive, and intelligent web applications.

---

## Architecture & Core Concepts

The application is built on a classic, scalable real-time architecture.

1.  **Frontend (Vue.js):** A single-page application that provides the user interface. It connects to the backend server using the Socket.IO client library.
2.  **Backend (Node.js Server):**
    * An **Express** server provides the basic HTTP framework.
    * **Socket.IO** is integrated with the server to handle persistent, real-time, bidirectional communication with clients over WebSockets.
3.  **Scalability (Redis):**
    * The Socket.IO server uses the **Redis Adapter**. This is a crucial component for scalability.
    * When a message is sent from one client, the Node.js server doesn't just broadcast it to its own connected clients. Instead, it publishes the message to a **Redis channel**.
    * All other instances of the Node.js server (if you were running multiple for load balancing) are subscribed to this channel. They receive the message from Redis and then broadcast it to *their* connected clients.
    * This allows the chat application to scale horizontally across multiple servers without losing communication between users connected to different instances.
4.  **Database:** For this demonstration, chat history is stored in-memory. In a production environment, this would be replaced with a persistent database like PostgreSQL or MongoDB to store user data and chat logs permanently.

---

## AI Features (Gemini API)

The frontend is enhanced with two features that call the Gemini API directly:

-   **AI Chat Assistant (`@GeminiBot`):** Users can mention `@GeminiBot` to ask questions. The frontend makes a direct `fetch` call to the Gemini API with the user's prompt. A loading indicator is shown while waiting for the response, which is then displayed in the chat.
-   **Smart Replies:** After a user sends a message, a prompt is constructed using the context of the last two messages and sent to the Gemini API. The API is asked to generate three short, relevant replies, which are then displayed as clickable buttons to help the user respond quickly.

---

## Technical Stack

-   **Frontend:** Vue.js, Tailwind CSS
-   **Backend:** Node.js, Express
-   **Real-time Communication:** Socket.IO
-   **Scalability/Message Brokering:** Redis
-   **AI Integration:** Google Gemini API

---

## How to Run

**1. Backend Server:**
-   You need Node.js and a running Redis instance.
-   Save the `server.js` code.
-   Install dependencies:
    ```bash
    npm install express socket.io redis @socket.io/redis-adapter
    ```
-   Run the server:
    ```bash
    node server.js
    ```

**2. Frontend:**
-   The `index.html` file is self-contained.
-   You would need to update the frontend code to connect to your running server's Socket.IO instance instead of the mock client.
-   Serve the `index.html` file with a simple local server.

