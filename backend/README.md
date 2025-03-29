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