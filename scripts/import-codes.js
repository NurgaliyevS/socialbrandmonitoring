const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// Define the Code schema
const CodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  redeemed: { type: Boolean, default: false },
  redeemedAt: { type: Date },
  buyerEmail: { type: String, default: null }
}, { collection: 'codes' });

const Code = mongoose.models.Code || mongoose.model('Code', CodeSchema);

const MONGO_URI = process.env.MONGODB_API_KEY;

if (!MONGO_URI) {
  console.error('Please define the MONGODB_API_KEY environment variable');
  process.exit(1);
}

async function importCodes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Read the CSV file
    const csvPath = path.join(__dirname, '../data/codes.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const codes = csvContent.trim().split('\n');

    console.log(`📄 Found ${codes.length} codes in CSV file`);

    // Clear existing codes (optional - comment out if you want to keep existing)
    await Code.deleteMany({});
    console.log('🗑️  Cleared existing codes');

    // Prepare codes for insertion
    const codeDocuments = codes.map(code => ({
      code: code.trim(),
      redeemed: false
    }));

    // Insert codes into database
    const result = await Code.insertMany(codeDocuments);
    console.log(`✅ Successfully imported ${result.length} codes`);

    // Verify import
    const totalCodes = await Code.countDocuments();
    console.log(`📊 Total codes in database: ${totalCodes}`);

    // Show sample of imported codes
    const sampleCodes = await Code.find().limit(5);
    console.log('📋 Sample codes:');
    sampleCodes.forEach(doc => {
      console.log(`  - ${doc.code} (redeemed: ${doc.redeemed})`);
    });

  } catch (error) {
    console.error('❌ Error importing codes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

importCodes(); 