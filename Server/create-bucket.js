const { Storage } = require("@google-cloud/storage");
const path = require("path");

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: path.join(__dirname, 'src/config/gbc.json'),
  projectId: '718890376941'
});

const bucketName = 'heartfelt-6a946.firebasestorage.app';

async function createBucket() {
  try {
    console.log('Checking if Firebase storage bucket exists...');
    
    // Check if bucket already exists
    const [exists] = await storage.bucket(bucketName).exists();
    
    if (exists) {
      console.log(`✅ Firebase storage bucket ${bucketName} already exists!`);
      return;
    }

    console.log(`❌ Firebase storage bucket ${bucketName} does not exist.`);
    console.log(`\n📝 Firebase Storage buckets are automatically created when you:`);
    console.log(`   1. Go to Firebase Console: https://console.firebase.google.com/`);
    console.log(`   2. Select your project: heartfelt-6a946`);
    console.log(`   3. Go to Storage section`);
    console.log(`   4. Click "Get Started" to initialize Firebase Storage`);
    console.log(`\n⚠️  Note: Firebase Storage buckets cannot be created via API.`);
    console.log(`   They must be initialized through the Firebase Console.`);

  } catch (error) {
    console.error('❌ Error checking bucket:', error.message);
    
    if (error.code === 403) {
      console.log(`\n🔑 Permission issue. Make sure:`);
      console.log(`   1. Your service account has Storage Admin role`);
      console.log(`   2. The gbc.json file has correct credentials`);
      console.log(`   3. The project ID is correct: 718890376941`);
      console.log(`   4. Firebase Storage is enabled in your project`);
    }
  }
}

// Run the function
createBucket();