# VoiceText Game

This repository contains a web application for crowdsourcing voice transcriptions. Users can listen to audio clips and submit their transcriptions, while administrators can review and manage the submitted data.

## Features

- User authentication (login and registration)
- Task queue for voice transcriptions
- Interactive text editor with diacritic support
- User profiles with edit history
- Leaderboard to track top contributors
- Admin panel for user management and analytics
- Light and dark themes
- Internationalization support (English and Persian)

## Project Structure

The project is a single-page application built with React and TypeScript. Here's a brief overview of the directory structure:

- `src/components`: Reusable UI components.
- `src/pages`: Top-level page components.
- `src/services`: API service for communicating with the backend.
- `src/types`: TypeScript type definitions.
- `src/assets`: Static assets like images and fonts.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/voicetext-game.git
    ```

2.  Install the dependencies:

    ```bash
    npm install
    ```

    or

    ```bash
    yarn install
    ```

### Configuration

Before running the application, you need to configure the backend API URL. Open `src/config.ts` and set the `API_BASE_URL` to the appropriate value:

```typescript
const config = {
  // Set your backend API URL here
  // If you are using ngrok, paste the ngrok URL here.
  API_BASE_URL: "http://localhost:8000",
};
```

### Running the Application

To start the development server, run the following command:

```bash
npm run dev
```

or

```bash
yarn dev
```

The application will be available at `http://localhost:3000`.

## Usage

### User

1.  Register for a new account or log in with an existing one.
2.  Navigate to the "Voice Task" page to start transcribing audio clips.
3.  Listen to the audio clip and use the interactive editor to enter the correct transcription.
4.  Submit your transcription to earn points and climb the leaderboard.

### Admin

1.  Log in with an admin account.
2.  Navigate to the "User Management" page to view user analytics and manage users.
3.  Review and approve user-submitted transcriptions.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
