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

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with your configuration:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   FIREBASE_MESSAGING_API_KEY=your_firebase_messaging_api_key
   TWILIO_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   OPENWEATHER_API_KEY=your_openweather_api_key
   ```

3. Add your Firebase Admin SDK JSON file as `firebase-adminsdk.json` in the root directory.

4. Run the server:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run dev
   ```

## API Endpoints

- `GET /api/disasters` - Get disaster reports with pagination
- `GET /api/disasters/geocode` - Geocode an address
- `GET /api/weather` - Get weather data for a location 