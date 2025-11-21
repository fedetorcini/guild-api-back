# Guild App API

A Node.js REST API with MongoDB connection built with Express.js and Mongoose. This API implements the Guild App endpoints for authentication, users, games, reviews, favorites, and chats.

## Features

- ✅ Express.js server
- ✅ MongoDB connection with Mongoose
- ✅ JWT authentication
- ✅ RESTful API structure
- ✅ Error handling middleware
- ✅ CORS enabled
- ✅ Request logging with Morgan
- ✅ Environment variables support
- ✅ Complete CRUD operations for all resources

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. Navigate to the project directory:
```bash
cd TPO_API
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
# Server Configuration
PORT=8080
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/tpo_db

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d

# Authentication (set to 'false' to disable for testing)
AUTH_ENABLED=true

# Test User ID (for testing when auth is disabled)
TEST_USER_ID=
```

For MongoDB Atlas (cloud), use:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tpo_db?retryWrites=true&w=majority
```

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:8080` (or the port specified in your `.env` file).

## API Endpoints

### Base URL
```
http://localhost:8080/api/v1
```

### Authentication
- **POST** `/auth/register` - Register a new user
- **POST** `/auth/login` - Login and get JWT token

### Users
- **GET** `/users/me` - Get current user profile
- **PUT** `/users/me` - Update current user profile
- **GET** `/users/:id` - Get user by ID

### Games
- **GET** `/games` - Get all games (with pagination: `limit`, `offset`)
- **GET** `/games/:id` - Get game by ID
- **POST** `/games` - Create new game
- **GET** `/games/search?q=query` - Search games
- **GET** `/games/new?limit=10` - Get new games

### Reviews
- **GET** `/reviews/games/:gameId` - Get reviews by game
- **POST** `/reviews` - Create review
- **PUT** `/reviews/:id` - Update review
- **DELETE** `/reviews/:id` - Delete review

### Favorites
- **GET** `/favorites` - Get user favorites
- **POST** `/favorites` - Add favorite
- **DELETE** `/favorites/:gameId` - Remove favorite
- **GET** `/favorites/:gameId/status` - Check favorite status

### Chats
- **GET** `/chats` - Get user chats
- **POST** `/chats` - Create chat
- **GET** `/chats/:id` - Get chat by ID
- **GET** `/chats/:id/messages` - Get chat messages
- **POST** `/chats/:id/messages` - Send message

## Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

To obtain a token:
1. Register a new user: `POST /api/v1/auth/register`
2. Login: `POST /api/v1/auth/login`

Both endpoints return an `AuthResponse` containing a `token` field.

**Note:** For testing purposes, authentication can be temporarily disabled by setting `AUTH_ENABLED=false` in your `.env` file. When disabled, some endpoints will use `TEST_USER_ID` if provided.

## Example Requests

### Register User
```bash
POST http://localhost:8080/api/v1/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "displayName": "Test User"
}
```

### Login
```bash
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### Create Game
```bash
POST http://localhost:8080/api/v1/games
Content-Type: application/json

{
  "title": "The Witcher 3",
  "description": "An action role-playing game",
  "images": ["https://example.com/image.jpg"],
  "releaseDate": "2015-05-19",
  "developerPublisher": "CD Projekt",
  "platforms": "PC, PS4, Xbox One",
  "genres": "RPG, Action"
}
```

### Create Review
```bash
POST http://localhost:8080/api/v1/reviews
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "gameId": "game-id-here",
  "text": "Excellent game, highly recommended!",
  "rating": 5
}
```

## Project Structure

```
TPO_API/
├── config/
│   └── database.js              # MongoDB connection configuration
├── controllers/
│   ├── authController.js        # Authentication controllers
│   ├── userController.js        # User controllers
│   ├── gameController.js        # Game controllers
│   ├── reviewController.js      # Review controllers
│   ├── favoriteController.js    # Favorite controllers
│   └── chatController.js        # Chat controllers
├── middleware/
│   ├── auth.js                  # JWT authentication middleware
│   └── errorHandler.js          # Error handling middleware
├── models/
│   ├── User.js                  # User model
│   ├── Game.js                  # Game model
│   ├── Review.js                # Review model
│   ├── Favorite.js              # Favorite model
│   ├── Chat.js                  # Chat model
│   └── Message.js               # Message model
├── routes/
│   ├── authRoutes.js            # Authentication routes
│   ├── userRoutes.js            # User routes
│   ├── gameRoutes.js            # Game routes
│   ├── reviewRoutes.js          # Review routes
│   ├── favoriteRoutes.js        # Favorite routes
│   └── chatRoutes.js            # Chat routes
├── utils/
│   └── jwt.js                   # JWT utility functions
├── .env                         # Environment variables
├── .gitignore                   # Git ignore file
├── index.js                     # Main server file
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 8080 |
| `NODE_ENV` | Environment (development/production) | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/tpo_db |
| `JWT_SECRET` | Secret key for JWT tokens | your-secret-key-change-in-production |
| `JWT_EXPIRE` | JWT token expiration | 7d |
| `AUTH_ENABLED` | Enable/disable authentication | true |
| `TEST_USER_ID` | Default user ID for testing | (empty) |

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request** - Invalid request data or parameters
- **401 Unauthorized** - Missing or invalid authentication token
- **403 Forbidden** - User doesn't have permission to access the resource
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource conflict (e.g., duplicate email)
- **500 Internal Server Error** - Server error

Error responses follow this format:
```json
{
  "error": "Error message description"
}
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally, or
- Verify your MongoDB Atlas connection string is correct
- Check that your IP is whitelisted in MongoDB Atlas (if using cloud)

### Port Already in Use
- Change the `PORT` in your `.env` file
- Or stop the process using the port

### Authentication Issues
- Verify JWT_SECRET is set in `.env`
- Check that the token is included in the Authorization header
- Ensure token hasn't expired

## License

ISC
