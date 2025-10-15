"""
Firebase Setup Helper for CitySense
This script helps you configure Firebase Realtime Database access
"""

import json
import os

print("=" * 70)
print("🔥 Firebase Realtime Database Setup Helper")
print("=" * 70)

print("\n📋 STEP 1: Get Your Service Account Key")
print("-" * 70)
print("""
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: citysense-crono
3. Click the gear icon (⚙️) → Project Settings
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key" button
6. Save the JSON file
""")

print("\n📋 STEP 2: Database Rules Setup")
print("-" * 70)
print("""
Go to: https://console.firebase.google.com/project/citysense-crono/database

Click on "Rules" tab and set:

FOR TESTING (Public - anyone can write):
{
  "rules": {
    ".read": true,
    ".write": true
  }
}

FOR PRODUCTION (Authenticated only):
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}

⚠️ Important: Use public rules only for testing!
""")

print("\n📋 STEP 3: Save Credentials")
print("-" * 70)

choice = input("\nDo you have the service account JSON file? (y/n): ").strip().lower()

if choice == 'y':
    file_path = input("\nEnter the path to your JSON file: ").strip()
    
    # Remove quotes if present
    file_path = file_path.strip('"').strip("'")
    
    if os.path.exists(file_path):
        try:
            # Read and validate JSON
            with open(file_path, 'r') as f:
                creds = json.load(f)
            
            # Check required fields
            required_fields = ['project_id', 'private_key', 'client_email']
            missing = [f for f in required_fields if f not in creds]
            
            if missing:
                print(f"\n❌ Invalid credentials file. Missing fields: {missing}")
            else:
                # Copy to current directory
                target_path = 'firebase-credentials.json'
                
                with open(target_path, 'w') as f:
                    json.dump(creds, f, indent=2)
                
                print(f"\n✅ Credentials saved to: {target_path}")
                print(f"   Project ID: {creds.get('project_id')}")
                print(f"   Client Email: {creds.get('client_email')}")
                
        except json.JSONDecodeError:
            print("\n❌ Invalid JSON file")
        except Exception as e:
            print(f"\n❌ Error: {e}")
    else:
        print(f"\n❌ File not found: {file_path}")

else:
    print("\n📝 Alternative: Use Environment Variable")
    print("-" * 70)
    print("""
You can set the GOOGLE_APPLICATION_CREDENTIALS environment variable:

Windows (PowerShell):
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\\path\\to\\your\\credentials.json"

Windows (CMD):
set GOOGLE_APPLICATION_CREDENTIALS=C:\\path\\to\\your\\credentials.json

Linux/Mac:
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/credentials.json"
""")

print("\n📋 STEP 4: Test Connection")
print("-" * 70)
print("""
Run this command to test your setup:

    python test_firebase_connection.py

Or just run the main script:

    python saved_py.py
""")

print("\n💡 Alternative: Use Public Database Rules (Testing Only)")
print("-" * 70)
print("""
If you want to test without credentials:

1. Go to your Firebase Database Rules
2. Set rules to allow public writes (see above)
3. Run the detector - it will use anonymous connection

⚠️ Remember to restrict access before production!
""")

print("\n✅ Setup guide complete!")
print("=" * 70)
