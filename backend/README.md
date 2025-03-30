# ResQConnect Backend

This is the backend for the ResQConnect disaster management application, built with Node.js, Express, and MongoDB.

## Features

- RESTful API for disaster reporting and management
- Cursor-based pagination for efficient data retrieval
- Integration with Google Maps API for geolocation
- Weather data fetching with OpenWeather API
- Push notifications with Firebase Cloud Messaging
- SMS alerts with Twilio

## Setup

1. Clone the repository and navigate to the backend directory:
   ```
   git clone https://github.com/ansh2006-dev/ResQconnect.git
   cd ResQconnect
   git checkout backend
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your API keys:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   FIREBASE_MESSAGING_API_KEY=your_firebase_messaging_api_key
   TWILIO_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   OPENWEATHER_API_KEY=your_openweather_api_key
   ```

4. Set up Firebase Admin SDK:
   - Go to Firebase Console > Project Settings > Service accounts
   - Generate a new private key
   - Save the JSON file as `firebase-adminsdk.json` in the backend directory
   - Make sure this file is listed in your .gitignore

5. Run the server:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run dev
   ```

## DeepSeek AI Integration

The application uses DeepSeek AI for the chatbot functionality.

### Configuration

Set the following environment variables in your `.env` file:

```
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_URL=https://api.deepseek.ai/v1
USE_MOCK_DATA=false
```

- `DEEPSEEK_API_KEY`: Your DeepSeek API key (required for API access)
- `DEEPSEEK_API_URL`: The DeepSeek API endpoint URL (should include `/v1`)
- `USE_MOCK_DATA`: Set to `true` to use local responses instead of calling the DeepSeek API

### Testing the DeepSeek API Connection

To test your DeepSeek API connection:

1. Ensure your API key is correctly set in the `.env` file
2. Run the test utility:
   ```
   node test-deepseek-connection.js
   ```

This utility will:
- Verify your environment configuration
- Test connectivity to the DeepSeek API
- Display available models
- Test a simple chat completion

### API Endpoints

- `GET /api/test`: General API test endpoint (includes DeepSeek service status)
- `GET /api/chatbot/test-connection`: Test the DeepSeek API connection
- `POST /api/chatbot/message`: Send a message to the chatbot

### Troubleshooting

If you experience issues with the DeepSeek API:

1. Verify your API key is correct and active
2. Ensure the API URL is correct (should be `https://api.deepseek.ai/v1`)
3. Check if you're behind a firewall or proxy that might block requests
4. Set `USE_MOCK_DATA=true` to temporarily use local responses

You can also check the server logs for detailed error information.

## API Endpoints

### Disaster Management
- `GET /api/disasters` - Get disaster reports with pagination
  - Query params: `limit` (default: 5), `after` (cursor for pagination)
  - Returns: `{ data: [...disasters], nextCursor: string }`

- `POST /api/disasters` - Create a new disaster report
  - Body: `{ type: string, location: string, severity: string, notificationToken?: string, phoneNumber?: string }`
  - Returns: The created disaster object
  - Will send notifications if token/phone number provided

- `GET /api/disasters/geocode` - Geocode an address
  - Query params: `address`
  - Returns: Google Maps geocoding result

### Weather
- `GET /api/weather` - Get weather data for a location
  - Query params: `lat`, `lon`
  - Returns: OpenWeather data for the coordinates

## Security Notes

- Never commit your `.env` file or `firebase-adminsdk.json` to version control
- Restrict your API keys in their respective dashboards when possible
- In production, use environment variables instead of `.env` files 