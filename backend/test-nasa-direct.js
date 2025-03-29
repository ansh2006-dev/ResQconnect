const axios = require('axios');
require('dotenv').config();

const NASA_API_URL = process.env.NASA_EONET_API || 'https://eonet.gsfc.nasa.gov/api/v3/events';

console.log('Testing direct access to NASA EONET API');
console.log(`API URL: ${NASA_API_URL}`);

// Get a date 12 months ago in YYYY-MM-DD format
const getLastYearDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 12);
  return date.toISOString().split('T')[0];
};

async function testNasaApi() {
  try {
    console.log('Making direct request to NASA EONET API...');
    const response = await axios.get(NASA_API_URL, {
      params: {
        status: 'open',
        start: getLastYearDate()
      },
      timeout: 10000 // 10 second timeout
    });

    if (response.data && response.data.events) {
      console.log('\n✅ SUCCESS! Received data from NASA EONET API');
      console.log(`Total events: ${response.data.events.length}`);
      
      if (response.data.events.length > 0) {
        const sample = response.data.events[0];
        console.log('\nSample event:');
        console.log('- ID:', sample.id);
        console.log('- Title:', sample.title);
        console.log('- Categories:', sample.categories.map(c => c.title).join(', '));
        
        // Check for future dates
        const now = new Date();
        let futureEvents = 0;
        
        response.data.events.forEach(event => {
          if (event.geometry && event.geometry.length > 0 && event.geometry[0].date) {
            const eventDate = new Date(event.geometry[0].date);
            if (eventDate > now) {
              futureEvents++;
            }
          }
        });
        
        console.log('\nEvents with future dates:', futureEvents);
      }
    } else {
      console.log('❌ ERROR: Unexpected response format');
      console.log(response.data);
    }
  } catch (error) {
    console.log('❌ ERROR connecting to NASA EONET API:');
    if (error.response) {
      console.log('- Status:', error.response.status);
      console.log('- Data:', error.response.data);
    } else if (error.request) {
      console.log('- No response received');
      console.log('- Request:', error.request);
    } else {
      console.log('- Error message:', error.message);
    }
    console.log('\nError details:', error);
  }
}

testNasaApi();

console.log('\nPlease check if you are behind a proxy or firewall that might be blocking the API access.');
console.log('If your backend can access this API directly but your frontend cannot access your backend,');
console.log('the issue is likely with CORS or network configuration between your frontend and backend.'); 