const { Storage } = require("@google-cloud/storage");
const path = require("path");

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, 'src/config/gbc.json'),
  projectId: '718890376941'
});

const bucketName = 'heartfelt-6a946.firebasestorage.app';

async function checkBucket() {
  try {
    console.log(`🔍 Checking Firebase storage bucket: ${bucketName}`);
    
    const bucket = storage.bucket(bucketName);
    const [exists] = await bucket.exists();
    
    if (!exists) {
      console.log(`❌ Firebase storage bucket '${bucketName}' does not exist!`);
      console.log(`\n📝 To initialize Firebase Storage:`);
      console.log(`   1. Go to Firebase Console: https://console.firebase.google.com/`);
      console.log(`   2. Select your project: heartfelt-6a946`);
      console.log(`   3. Go to Storage section`);
      console.log(`   4. Click "Get Started" to initialize Firebase Storage`);
      return false;
    }
    
    console.log(`✅ Firebase storage bucket '${bucketName}' exists!`);
    
    // Check bucket metadata
    const [metadata] = await bucket.getMetadata();
    console.log(`📍 Location: ${metadata.location}`);
    console.log(`🏷️  Storage Class: ${metadata.storageClass}`);
    console.log(`📅 Created: ${metadata.timeCreated}`);
    
    // Test write permissions
    console.log(`\n🧪 Testing write permissions...`);
    const testFile = bucket.file('theROAC/test-connection.txt');
    await testFile.save('Connection test successful!', {
      metadata: {
        contentType: 'text/plain'
      }
    });
    
    // Make it public and get URL
    await testFile.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${testFile.name}`;
    console.log(`✅ Write test successful!`);
    console.log(`🔗 Test file URL: ${publicUrl}`);
    
    // Clean up test file
    await testFile.delete();
    console.log(`🧹 Test file cleaned up.`);
    
    console.log(`\n🎉 Firebase Storage bucket is ready for use!`);
    console.log(`📁 Files will be stored in: theROAC/{userId}/{fileType}/`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error checking bucket:`, error.message);
    
    if (error.code === 403) {
      console.log(`\n🔑 Permission issue. Make sure:`);
      console.log(`   1. Your service account has Storage Admin role`);
      console.log(`   2. The gbc.json file has correct credentials`);
      console.log(`   3. The project ID is correct: 718890376941`);
      console.log(`   4. Firebase Storage is enabled in your project`);
    }
    
    return false;
  }
}

// Run the check
checkBucket();