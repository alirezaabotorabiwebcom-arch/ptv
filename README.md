# VoiceText Game - Crowdsourcing Platform

This repository contains the frontend for the VoiceText Game, a crowdsourcing application designed for transcribing and validating short audio clips. It provides a user-friendly interface for transcribers and a powerful dashboard for administrators to manage users and tasks.

## Features

- **User Authentication**: Separate login and registration for users and administrators.
- **Interactive Transcription Room**: A dedicated interface for listening to audio clips and transcribing them, including a custom editor for adding diacritics.
- **Gamification**: Users earn points for their contributions and can see their rankings on a leaderboard.
- **Admin Panel**: Administrators can view analytics, manage users, and review submissions.
- **Dark Mode**: A user-toggleable dark theme for comfortable viewing in different lighting conditions.
- **Internationalization**: Support for multiple languages (English and Farsi included).

## Project Structure

The project is structured as follows:

- `src/components`: Reusable React components, such as the Layout, and context providers for Auth and Theme.
- `src/pages`: Top-level components for each page/route in the application (e.g., Login, TaskRoom, AdminPanel).
- `src/services`: Contains the API service for communicating with the backend.
- `src/types`: TypeScript type definitions used throughout the application.
- `src/constants.ts`: Mock data and other application-wide constants.
- `src/config.ts`: Configuration file for the backend API URL.

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd <project-directory>
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Configuration

Before running the application, you need to configure the backend API URL.

1.  Open `src/config.ts`.
2.  Set the `API_BASE_URL` to the URL of your running backend instance.

    ```typescript
    const config = {
      // Set your backend API URL here
      API_BASE_URL: "http://your-backend-api-url:8000",
    };
    ```

### Running the Application

Once the dependencies are installed and the configuration is set, you can start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Usage

### User

1.  **Register**: Create a new account from the registration page.
2.  **Login**: Sign in with your client ID and password.
3.  **Transcribe**: Navigate to the "Voice Task" page to start transcribing audio clips. Use the interactive editor to add diacritics.
4.  **Track Progress**: View your submission history and stats on your profile page.
5.  **Compete**: Check your ranking on the leaderboard.

### Admin

1.  **Login**: Use the "Admin Login" toggle on the login page and sign in with your admin credentials.
2.  **View Analytics**: The admin panel displays an overview of user activity and system statistics.
3.  **Manage Users**: You can view detailed submission histories for each user.
