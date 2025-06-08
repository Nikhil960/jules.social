# Social Media Manager - Frontend (Content Calendar)

This directory contains the React frontend for the Visual Content Calendar feature.

## Prerequisites

- Node.js (v16 or later recommended)
- npm (usually comes with Node.js) or yarn

## Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

## Running the Development Server

Once dependencies are installed, you can start the React development server:

Using npm:
```bash
npm start
```
Or using yarn:
```bash
yarn start
```

This will usually open the application in your default web browser at `http://localhost:3000`.

The application is configured to proxy API requests to `http://localhost:8000` (the default FastAPI backend server). Ensure your backend server is running for API calls to work.

## Key Components

-   **`src/components/ContentCalendar.jsx`**: The main component for the visual calendar.
-   **`src/App.js`**: The root React component that renders the `ContentCalendar`.
-   **`src/index.js`**: The entry point for the React application.
-   **`public/index.html`**: The main HTML page.
-   **`package.json`**: Defines project dependencies and scripts.

## API Interaction

-   The calendar fetches posts from `GET /api/v1/workspaces/{workspace_id}/posts`.
-   Dragging and dropping posts to reschedule them triggers a `PUT /api/v1/posts/{post_id}` call.

## Further Development

-   Implement proper authentication and `workspaceId` management.
-   Enhance error handling and user feedback.
-   Add more detailed post previews and editing capabilities within the modal.
-   Refine styling and responsiveness.
-   Add tests.