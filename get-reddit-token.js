const snoowrap = require('snoowrap');
require('dotenv').config();

// Replace these with your actual values from Reddit app
const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const USERNAME = process.env.REDDIT_USERNAME;
const PASSWORD = process.env.REDDIT_PASSWORD;

async function getRefreshToken() {
  try {
    console.log('🔐 Generating Reddit refresh token...');
    
    // Create a new Reddit instance with username/password
    const reddit = new snoowrap({
      userAgent: 'Social Brand Monitoring local/1.0.0',
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      username: USERNAME,
      password: PASSWORD
    });

    // This will automatically get a refresh token
    const me = await reddit.getMe();
    console.log('✅ Successfully authenticated as:', me.name);
    
    // Get the refresh token from the credentials
    const refreshToken = reddit.credentials.refreshToken;
    console.log('\n🎉 Your refresh token is:');
    console.log(refreshToken);
    console.log('\n📝 Add this to your .env.local file:');
    console.log(`REDDIT_REFRESH_TOKEN=${refreshToken}`);
    
  } catch (error) {
    console.error('❌ Error getting refresh token:', error.message);
    console.log('\n💡 Make sure you:');
    console.log('1. Replaced CLIENT_ID and CLIENT_SECRET with your actual values');
    console.log('2. Used your Reddit username and password');
    console.log('3. Have 2FA disabled or use an app password');
  }
}

getRefreshToken(); 