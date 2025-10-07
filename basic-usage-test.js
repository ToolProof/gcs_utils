// test-sdk.js
const { GCSUtils, CAFS } = require('./dist/index.js');

async function testBasicFunctionality() {
    console.log('🧪 Testing GCS Utils SDK...\n');
    
    try {
        // Test 1: Basic GCS Operations
        console.log('1. Testing basic GCS operations...');
        const gcsUtils = new GCSUtils(process.env.BUCKET_NAME);
        
        // Write a test file
        await gcsUtils.writeToGCS('test/basic-test.json', 42);
        console.log('✅ Written test file');
        
        // Read the test file
        const value = await gcsUtils.readFromGCS('test/basic-test.json');
        console.log(`✅ Read value: ${value}`);
        
        // Test 2: CAFS Operations
        console.log('\n2. Testing CAFS operations...');
        const cafs = new CAFS({
            bucketName: process.env.BUCKET_NAME,
            enableDeduplication: true
        });

        const folder = 'cafs';

        const jsonData = { name: "John", age: 30, city: "New York" };
        const jsonResult = await cafs.storeContent(folder, JSON.stringify(jsonData, null, 2));
        console.log(`✅ JSON stored with hash: ${jsonResult.contentHash.substring(0, 16)}...`);
        
        // Store plain text
        const textResult = await cafs.storeContent(folder, "Hello, this is plain text content!");
        console.log(`✅ Text stored with hash: ${textResult.contentHash.substring(0, 16)}...`);
        
        // Store the same JSON again (will be deduplicated)
        const duplicateResult = await cafs.storeContent(folder, JSON.stringify(jsonData, null, 2));
        console.log(`✅ Duplicate JSON - Deduplicated: ${JSON.stringify(duplicateResult)}`);
        
        // 2. Read content back
        console.log('\n📖 Reading content...');
        
        // Read JSON data
        const retrievedJson = await cafs.retrieveContent(folder, jsonResult.contentHash);
        const parsedJson = JSON.parse(retrievedJson);
        console.log('✅ Retrieved JSON:', parsedJson);
        
        // Read text data
        const retrievedText = await cafs.retrieveContent(folder, textResult.contentHash);
        console.log('✅ Retrieved Text:', retrievedText);
        
        // 3. List all CAFS entries
        console.log('\n📋 Listing all CAFS entries...');
        const entries = await cafs.listCAFSEntries(folder);
        
        for (const entry of entries) {
            console.log(`📄 Hash: ${entry.contentHash.substring(0, 16)}...`);
            console.log(`   Size: ${entry.metadata.contentSize} bytes`);
            console.log(`   References: ${entry.metadata.referenceCount}`);
            console.log(`   Created: ${entry.metadata.createdAt}`);
            
            // Read and display content (first 100 chars)
            const content = await cafs.retrieveContent(folder, entry.contentHash);
            const preview = content.length > 100 ? content.substring(0, 100) + '...' : content;
            console.log(`   Content: ${preview}\n`);
        }
        
        // 4. Check if specific content exists
        console.log('🔍 Checking content existence...');
        const exists = await cafs.contentExists(folder, jsonResult.contentHash);
        console.log(`✅ JSON content exists: ${exists}`);
        
        console.log('\n🎉 All tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testBasicFunctionality();