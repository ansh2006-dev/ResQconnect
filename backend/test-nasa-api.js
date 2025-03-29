const axios = require('axios');

// NASA EONET API endpoint
const NASA_EONET_API = "https://eonet.gsfc.nasa.gov/api/v3/events";

async function testNasaApi() {
  try {
    // Calculate date 12 months ago
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    // Format date for NASA API (YYYY-MM-DD)
    const formattedDate = twelveMonthsAgo.toISOString().split('T')[0];
    
    console.log(`Fetching NASA EONET events since ${formattedDate}...`);
    
    // Make API request to NASA EONET
    const response = await axios.get(NASA_EONET_API, {
      params: {
        status: "open",
        start: formattedDate
      }
    });
    
    console.log(`Received ${response.data.events.length} events from NASA EONET`);
    console.log('Sample event:', JSON.stringify(response.data.events[0], null, 2));
    
    // Print the structure to understand format
    const sampleEvent = response.data.events[0];
    console.log('\nEvent structure:');
    console.log('- id:', typeof sampleEvent.id);
    console.log('- title:', typeof sampleEvent.title);
    console.log('- description:', typeof sampleEvent.description);
    console.log('- categories:', Array.isArray(sampleEvent.categories));
    console.log('- geometry:', Array.isArray(sampleEvent.geometry));
    
    console.log('\nAPI test completed successfully!');
    
  } catch (error) {
    console.error('Error fetching from NASA EONET:');
    console.error(error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testNasaApi(); 