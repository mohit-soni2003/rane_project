# Rane Project

Web application for **Rane & Sons**, developed with a client-server architecture.

## Tech Stack

- **Client:** JavaScript, HTML, CSS (likely React or similar framework)
- **Server:** JavaScript backend (Node.js/Express?)
- **Project Structure:** Separate `client/` and `server/` directories
- **Other:** Includes `Rane.png` used in README or application visuals

## Table of Contents

- [Overview](#overview)  
- [Features](#features)  
- [Getting Started](#getting-started)  
- [Scripts](#scripts)  
- [Environment Variables](#environment-variables)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)

---

## Overview

`rane_project` is a full-stack application designed to serve the needs of **Rane & Sons**.  
It features distinct **client** and **server** modules, enabling separation of front-end and backend logic.

---

## Features

- Clean, component-based front-end (assumed React)
- RESTful API on the back-end
- Efficient, modular architecture with `client/` and `server/` directories
- Easily extensible and maintainable

---

## Getting Started

1. **Clone the repository:**
    ```bash
    git clone https://github.com/mohit-soni2003/rane_project.git
    cd rane_project
    ```

2. **Install dependencies:**

   - Client:
     ```bash
     cd client
     npm install
     ```
   - Server:
     ```bash
     cd ../server
     npm install
     ```

3. **Run locally:**

   - Start server:
     ```bash
     npm run dev
     ```
     (Or `npm start` if defined)

   - Start client:
     ```bash
     npm start
     ```

4. **Access the app:**
   Open `http://localhost:3000` (or the configured client port)

---

## Scripts

Assuming standard scripts are present, these commands are useful:

- **Client:**
  - `npm start` — launch frontend
  - `npm run build` — build production assets

- **Server:**
  - `npm run dev` — start server in dev mode (e.g. using nodemon)
  - `npm start` — launch production server
  - `npm test` — run backend tests (if any)

---

## Environment Variables

Create a `.env` file in the `server/` directory with contents like:

