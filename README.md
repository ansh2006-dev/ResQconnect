# ResQConnect - Emergency Response and Disaster Management App

ResQConnect is a comprehensive disaster management and emergency response web application that serves as a crucial link between disaster-affected individuals, emergency responders, and disaster management authorities.

## Features

- **Real-time Disaster Tracking**: Monitor ongoing disasters with detailed information
- **Weather Forecasts**: Get current weather conditions and forecasts
- **Emergency Reporting**: Report emergencies and track their status
- **Resource Database**: Access emergency guides, safety tips, and contacts
- **Chatbot Assistance**: Get immediate help and information via AI-powered chatbot
- **Status Dashboard**: View and manage disaster reports with filtering capabilities
- **Contact Us Page**: Reach out for help with an integrated chatbot

## Technologies Used

- **Frontend**: React.js with responsive CSS
- **Backend**: Node.js with Express
- **APIs**: Weather API, Google Maps, DeepSeek AI
- **Data Storage**: MongoDB (with offline fallback)

## Setup Instructions

### Prerequisites

- Node.js v14 or higher
- MongoDB (optional, app works with mock data)
- API keys for weather services, Google Maps, and DeepSeek AI

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/username/resqconnect.git
   cd resqconnect
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../resqconnect-frontend
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5001
   MONGO_URI=your_mongodb_connection_string (optional)
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   OPENWEATHER_API_KEY=your_openweather_api_key
   DEEPSEEK_API_KEY=your_deepseek_api_key
   DEEPSEEK_API_URL=https://api.deepseek.com
   ```

### DeepSeek AI Integration

To enable the AI-powered chatbot:

1. Register for a DeepSeek API key at [DeepSeek AI](https://deepseek.ai)
2. Update your backend `.env` file with:
   ```
   DEEPSEEK_API_KEY=your_deepseek_api_key
   DEEPSEEK_API_URL=https://api.deepseek.com
   ```
3. Ensure DEMO_MODE is set to false in the Chatbot.js component

The chatbot will automatically use the DeepSeek AI model for generating responses. If no API key is provided, the application will fall back to pre-defined responses.

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```
   cd ../resqconnect-frontend
   npm start
   ```

3. Access the application in your browser at `http://localhost:3000`

## Usage

- Navigate to the home page to see disaster reports and weather information
- Use the emergency page for quick access to safety guidelines
- Report disasters with the reporting form
- Check the status dashboard for updates on reported disasters
- Use the chat feature for immediate AI-assisted help

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
