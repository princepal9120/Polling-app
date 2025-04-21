# Real-Time Poll Battle Application

A real-time polling application with WebSocket functionality for instant updates and interactive voting.

## Features

- User authentication with unique usernames (no passwords required)
- Create poll rooms with binary choices
- Join existing polls with room codes
- Real-time vote updates with animations
- 60-second countdown timer for each poll
- Participant tracking and status indicators
- Vote persistence across page refreshes
- Duplicate vote prevention
- Session management with localStorage

## Tech Stack

### Frontend
- Next.js 13 (React)
- Tailwind CSS for styling
- shadcn/ui component library
- Socket.io-client for WebSocket connections
- Framer Motion for animations
- React Hook Form for form handling
- Zod for validation

### Backend
- Node.js
- Express.js
- Socket.io for real-time communication

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd poll-battle
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`
   ```bash
   cp .env.example .env
   ```

4. Start the development server
   ```bash
   npm run dev
   ```
   This will start both the frontend and backend concurrently.

## Project Structure

```
/
├── app/                  # Next.js app directory
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   ├── login/            # Login page
│   └── room/[roomId]/    # Dynamic room pages
├── components/           # React components
│   ├── ui/               # UI components (shadcn)
│   ├── home/             # Home page components
│   ├── layout/           # Layout components
│   └── room/             # Room-specific components
├── contexts/             # React contexts
│   ├── auth-context.tsx  # Authentication context
│   └── socket-context.tsx # Socket management
├── lib/                  # Utility functions
├── server/               # Backend server
│   ├── index.js          # Express & Socket.io server
│   ├── socket-handlers.js # Socket event handlers
│   ├── room-manager.js   # Room data management
│   └── utils.js          # Utility functions
└── public/               # Static files
```

## Socket Events

### Client-to-Server Events
- `create_room`: Create a new poll room
- `join_room`: Join an existing room
- `get_room_data`: Request room data
- `cast_vote`: Submit a vote for an option

### Server-to-Client Events
- `room_data`: Initial room data
- `vote_update`: Real-time vote updates
- `timer_update`: Timer countdown updates
- `room_ended`: Notification when poll ends
- `room_error`: Error notifications

## Data Flow

1. User authentication happens client-side with localStorage
2. Socket connections include user credentials in handshake
3. Rooms store participant lists, vote counts, and poll metadata
4. All data is managed in-memory on the server
5. Real-time updates are broadcast to all room participants

## Deployment

This application can be deployed using various hosting services:

### Frontend
- Vercel
- Netlify
- AWS Amplify

### Backend
- Heroku
- Render
- AWS EC2
- Digital Ocean

Make sure to update the `NEXT_PUBLIC_SOCKET_URL` environment variable to point to your deployed backend URL.

## License

MIT