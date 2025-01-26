# Telegram Channel Message Fetcher

This project is a Node.js application that fetches messages from a specific Telegram channel using Telegram's MTProto API. It provides a REST API endpoint to retrieve messages and tracks unique users accessing the service.

## Features

- Fetch messages from a specific Telegram channel
- Authentication handling for Telegram API
- Unique user tracking
- Rate limiting and flood control
- REST API endpoint for message retrieval
- CORS support for specified origins

## Prerequisites

- Node.js (v12 or higher)
- Telegram API credentials (api_id and api_hash)
- npm or yarn package manager

## Setup

1. Clone the repository:

```bash
git clone https://github.com/RoleChain/tg-data-pull
cd telegram-channel-message-fetcher
```

2. Install dependencies:

```bash
npm install
```

3. Configure Telegram API credentials:

Create a `.env` file in the root directory and add your Telegram API credentials:

```bash
API_ID=your_api_id
API_HASH=your_api_hash
```

4. Start the server:

```bash
npm start
```

5. Access the API:

```bash
curl http://localhost:3000/messages
```

## Project Structure

- `api.js` - MTProto API configuration and error handling
- `index.js` - Express server and main application logic
- `data/` - Directory for storing session data

## API Endpoints

### GET /telegram
Fetches messages from the specified Telegram channel.

Query Parameters:
- `offset` (optional): Starting point for message fetch
- `limit` (optional): Number of messages to fetch

### GET /uniqueUserCount
Returns the count of unique users who have accessed the service.



2. The server will run on port 3010 by default.

3. If not authenticated, the application will prompt for:
   - Phone number
   - Verification code

4. Access the API endpoints:
   - `http://localhost:3010/telegram`
   - `http://localhost:3010/uniqueUserCount`

## CORS Configuration

The application is configured to accept requests from:
- http://localhost:5173
- https://www.bitcoinprice.live

## Error Handling

The application includes handling for:
- Flood wait errors
- Authentication errors
- Rate limiting
- Session management

## Security Features

- HTTP-only cookies for user tracking
- Secure cookie settings
- CORS protection
- Rate limiting protection

## Contributing

Feel free to submit issues and pull requests.

