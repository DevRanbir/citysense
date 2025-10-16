import cv2
import numpy as np
import yt_dlp
from collections import defaultdict
import time
import urllib.request
import os
import csv
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, db

class LiveStreamDetector:
    def __init__(self, model_type='yolov4-tiny'):
        """
        model_type: 'yolov4-tiny' (faster) or 'yolov4' (more accurate)
        """
        self.model_type = model_type
        self.csv_file = 'detections.csv'
        
        # Initialize Firebase
        self.init_firebase()
        
        # Define locations
        self.locations = {
            '1': {
                'name': 'Canmore Alberta',
                'url': 'https://www.youtube.com/watch?v=_0wPODlF9wU',
                'description': 'Main Street Livecam, Canmore, Alberta'
            },
            '2': {
                'name': 'Koh Samui Thailand',
                'url': 'https://www.youtube.com/watch?v=VR-x3HdhKLQ',
                'description': 'Bondi Aussie Bar & Grill | Chaweng'
            },
            '3': {
                'name': 'Bangkok Thailand',
                'url': 'https://www.youtube.com/live/UemFRPrl1hk',
                'description': 'El Gaucho | Soi 11 | Sukhumvit Road'
            },
            '4': {
                'name': '4 Corners Downtown',
                'url': 'https://www.youtube.com/watch?v=ByED80IKdIU',
                'description': '4 Corners Camera Downtown'
            }
        }
        
        self.init_csv()
        self.download_model_files()
        
        # Load YOLO model
        print("Loading YOLO model...")
        
        if model_type == 'yolov4-tiny':
            self.net = cv2.dnn.readNet("yolov4-tiny.weights", "yolov4-tiny.cfg")
        else:
            self.net = cv2.dnn.readNet("yolov4.weights", "yolov4.cfg")
        
        # Load class names
        with open("coco.names", "r") as f:
            self.classes = [line.strip() for line in f.readlines()]
        
        print(f"   Loaded {len(self.classes)} object classes")
        
        # Get output layer names
        layer_names = self.net.getLayerNames()
        self.output_layers = [layer_names[i - 1] for i in self.net.getUnconnectedOutLayers()]
        
        print(f"   Network has {len(layer_names)} layers, {len(self.output_layers)} output layers")
        
        # Define colors for different classes
        self.colors = np.random.uniform(0, 255, size=(len(self.classes), 3))
        
        # Classes we're interested in
        self.vehicle_classes = ['car', 'motorcycle', 'bus', 'truck', 'bicycle']
        self.person_class = 'person'
        
        # Detection thresholds
        self.confidence_threshold = 0.4
        self.nms_threshold = 0.4
        
        print("✅ Model loaded successfully!")
    
    def init_firebase(self):
        """Initialize Firebase connection"""
        try:
            # Check if service account file exists
            service_account_file = 'firebase-credentials.json'
            
            # Initialize Firebase Admin SDK
            if not firebase_admin._apps:
                if os.path.exists(service_account_file):
                    # Use service account credentials
                    print("🔑 Using service account credentials...")
                    cred = credentials.Certificate(service_account_file)
                    firebase_admin.initialize_app(cred, {
                        'databaseURL': 'https://citysense-crono-default-rtdb.firebaseio.com'
                    })
                else:
                    # Try environment variable or default credentials
                    print("🔑 Attempting to use default credentials...")
                    try:
                        cred = credentials.ApplicationDefault()
                        firebase_admin.initialize_app(cred, {
                            'databaseURL': 'https://citysense-crono-default-rtdb.firebaseio.com'
                        })
                    except:
                        # Last resort: Initialize without auth (requires open database rules)
                        print("⚠️ No credentials found, using anonymous connection...")
                        print("⚠️ Database must have public write rules enabled!")
                        firebase_admin.initialize_app(options={
                            'databaseURL': 'https://citysense-crono-default-rtdb.firebaseio.com'
                        })
            
            self.db_ref = db.reference('/')
            
            # Test write to verify connection
            try:
                test_ref = self.db_ref.child('_test')
                test_ref.set({'test': 'connection', 'timestamp': datetime.now().isoformat()})
                test_ref.delete()
                print("✅ Firebase initialized and verified!")
                print("📊 Database URL: https://citysense-crono-default-rtdb.firebaseio.com")
            except Exception as test_error:
                print(f"⚠️ Firebase connected but write test failed: {test_error}")
                print("⚠️ Check your database rules or credentials")
                self.db_ref = None
            
        except Exception as e:
            print(f"⚠️ Firebase initialization error: {e}")
            print("⚠️ Continuing with CSV-only mode...")
            print("\n💡 To enable Firebase:")
            print("   1. Download service account key from Firebase Console")
            print("   2. Save as 'firebase-credentials.json' in this folder")
            print("   3. Or set GOOGLE_APPLICATION_CREDENTIALS environment variable")
            self.db_ref = None
    
    def init_csv(self):
        """Initialize CSV file with headers"""
        with open(self.csv_file, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                'timestamp', 'source_type', 'source_id', 
                'vehicle_count', 'person_count', 'total_objects',
                'cars', 'motorcycles', 'buses', 'trucks', 'bicycles',
                'traffic_level', 'pedestrian_level'
            ])
        print(f"✅ CSV file initialized: {self.csv_file}")
    
    def download_model_files(self):
        """Download YOLO model files if not present"""
        files = {
            'coco.names': 'https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names',
            'yolov4-tiny.cfg': 'https://raw.githubusercontent.com/AlexeyAB/darknet/master/cfg/yolov4-tiny.cfg',
            'yolov4-tiny.weights': 'https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-tiny.weights'
        }
        
        for filename, url in files.items():
            if not os.path.exists(filename):
                print(f"Downloading {filename}...")
                try:
                    urllib.request.urlretrieve(url, filename)
                    print(f"✅ {filename} downloaded!")
                except Exception as e:
                    print(f"❌ Error downloading {filename}: {e}")
    
    def list_available_cameras(self):
        """List all available camera devices"""
        print("\n🎥 Scanning for available cameras...")
        available_cameras = []
        
        for i in range(10):
            cap = cv2.VideoCapture(i)
            if cap.isOpened():
                ret, _ = cap.read()
                if ret:
                    available_cameras.append(i)
                    print(f"   ✅ Camera {i} - Available")
                cap.release()
        
        if not available_cameras:
            print("   ❌ No cameras found!")
        
        return available_cameras
    
    def get_youtube_stream(self, youtube_url):
        """Extract best quality stream from YouTube URL"""
        try:
            ydl_opts = {
                'format': 'best[height<=480]/best',  # Lower quality for better stability
                'quiet': False,
                'no_warnings': False,
                'extract_flat': False,
                'socket_timeout': 30,
                'retries': 10,
                'fragment_retries': 10,
                'skip_unavailable_fragments': True,
                'http_headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-us,en;q=0.5',
                    'Sec-Fetch-Mode': 'navigate',
                }
            }
            
            print("   Extracting stream information...")
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(youtube_url, download=False)
                
                # Try to get the best available format
                if 'url' in info:
                    stream_url = info['url']
                elif 'formats' in info:
                    # Get the last format (usually best quality)
                    formats = [f for f in info['formats'] if f.get('url')]
                    if formats:
                        stream_url = formats[-1]['url']
                    else:
                        print("❌ No valid formats found")
                        return None
                else:
                    print("❌ No stream URL found")
                    return None
                
                print(f"   ✅ Stream URL extracted (valid for ~6 hours)")
                return stream_url
                
        except Exception as e:
            print(f"❌ Error getting YouTube stream: {e}")
            print(f"   Try updating yt-dlp: pip install -U yt-dlp")
            return None
    
    def detect_objects(self, frame):
        """Detect objects in frame using YOLO"""
        height, width, channels = frame.shape
        
        blob = cv2.dnn.blobFromImage(frame, 1/255.0, (416, 416), (0, 0, 0), True, crop=False)
        self.net.setInput(blob)
        outs = self.net.forward(self.output_layers)
        
        class_ids = []
        confidences = []
        boxes = []
        
        for out in outs:
            for detection in out:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                
                if confidence > self.confidence_threshold:
                    center_x = int(detection[0] * width)
                    center_y = int(detection[1] * height)
                    w = int(detection[2] * width)
                    h = int(detection[3] * height)
                    
                    x = int(center_x - w / 2)
                    y = int(center_y - h / 2)
                    
                    boxes.append([x, y, w, h])
                    confidences.append(float(confidence))
                    class_ids.append(class_id)
        
        indexes = cv2.dnn.NMSBoxes(boxes, confidences, self.confidence_threshold, self.nms_threshold)
        
        return boxes, confidences, class_ids, indexes
    
    def count_objects(self, class_ids, indexes):
        """Count vehicles and people"""
        vehicle_count = 0
        person_count = 0
        vehicle_types = defaultdict(int)
        
        if len(indexes) > 0:
            for i in indexes.flatten():
                # Safety check to avoid index out of range
                if i < 0 or i >= len(class_ids):
                    continue
                
                class_id = class_ids[i]
                
                # Make sure class_id is valid
                if class_id < 0 or class_id >= len(self.classes):
                    continue
                
                class_name = self.classes[class_id]
                
                if class_name in self.vehicle_classes:
                    vehicle_count += 1
                    vehicle_types[class_name] += 1
                elif class_name == self.person_class:
                    person_count += 1
        
        return vehicle_count, person_count, vehicle_types
    
    def get_traffic_level(self, vehicle_count):
        """Determine traffic level"""
        if vehicle_count == 0:
            return "EMPTY"
        elif vehicle_count <= 3:
            return "LOW"
        elif vehicle_count <= 8:
            return "MEDIUM"
        elif vehicle_count <= 15:
            return "HIGH"
        else:
            return "CONGESTED"
    
    def get_pedestrian_level(self, person_count):
        """Determine pedestrian level"""
        if person_count == 0:
            return "EMPTY"
        elif person_count <= 5:
            return "LOW"
        elif person_count <= 15:
            return "MODERATE"
        elif person_count <= 25:
            return "BUSY"
        else:
            return "CROWDED"
    
    def write_to_csv(self, source_type, source_id, vehicle_count, person_count, vehicle_types):
        """Write detection data to CSV"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        total_objects = vehicle_count + person_count
        traffic_level = self.get_traffic_level(vehicle_count)
        pedestrian_level = self.get_pedestrian_level(person_count)
        
        with open(self.csv_file, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                timestamp,
                source_type,
                source_id,
                vehicle_count,
                person_count,
                total_objects,
                vehicle_types.get('car', 0),
                vehicle_types.get('motorcycle', 0),
                vehicle_types.get('bus', 0),
                vehicle_types.get('truck', 0),
                vehicle_types.get('bicycle', 0),
                traffic_level,
                pedestrian_level
            ])
    
    def write_to_firebase(self, location_name, vehicle_count, person_count):
        """Write detection data to Firebase Realtime Database"""
        if self.db_ref is None:
            return False
        
        try:
            timestamp = datetime.now().isoformat()
            timestamp_key = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            # Data structure
            data = {
                'cars': vehicle_count,
                'people': person_count,
                'timestamp': timestamp,
                'traffic_level': self.get_traffic_level(vehicle_count),
                'pedestrian_level': self.get_pedestrian_level(person_count)
            }
            
            # Write to Firebase: locations/{location_name}/detections/{timestamp}
            location_ref = self.db_ref.child('locations').child(location_name).child('detections')
            location_ref.child(timestamp_key).set(data)
            
            # Also update latest data
            latest_ref = self.db_ref.child('locations').child(location_name).child('latest')
            latest_ref.set(data)
            
            print(f"   📤 Data written to Firebase: Cars={vehicle_count}, People={person_count}")
            return True
            
        except Exception as e:
            print(f"❌ Firebase write error: {e}")
            print(f"   Location: {location_name}, Path: locations/{location_name}")
            return False
    
    def draw_detections(self, frame, boxes, confidences, class_ids, indexes):
        """Draw bounding boxes and labels"""
        font = cv2.FONT_HERSHEY_SIMPLEX
        
        if len(indexes) > 0:
            for i in indexes.flatten():
                # Safety checks
                if i < 0 or i >= len(boxes) or i >= len(class_ids) or i >= len(confidences):
                    continue
                
                box = boxes[i]
                x, y, w, h = box
                
                class_id = class_ids[i]
                
                # Validate class_id
                if class_id < 0 or class_id >= len(self.classes):
                    continue
                
                label = str(self.classes[class_id])
                confidence = confidences[i]
                color = self.colors[class_id]
                
                # Make sure coordinates are valid
                if x < 0 or y < 0 or w <= 0 or h <= 0:
                    continue
                
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                
                label_text = f"{label}: {confidence:.2f}"
                (text_width, text_height), baseline = cv2.getTextSize(label_text, font, 0.5, 2)
                cv2.rectangle(frame, (x, y - text_height - 10), (x + text_width, y), color, -1)
                cv2.putText(frame, label_text, (x, y - 5), font, 0.5, (0, 0, 0), 2)
        
        return frame
    
    def run(self, source_type='youtube', source_id=None, location_key=None, location_name=None):
        """Main detection loop"""
        
        if source_type == 'camera':
            cap = cv2.VideoCapture(source_id)
            print(f"✅ Camera {source_id} opened successfully!")
            window_title = f"Camera {source_id} Detection - Press 'q' to quit"
        else:
            print("🔗 Getting YouTube stream URL...")
            stream_url = self.get_youtube_stream(source_id)
            
            if stream_url is None:
                print("❌ Failed to get stream URL")
                print("💡 Troubleshooting tips:")
                print("   1. Check your internet connection")
                print("   2. Verify the YouTube URL is a live stream")
                print("   3. Update yt-dlp: pip install -U yt-dlp")
                print("   4. Try a different location")
                return
            
            print(f"✅ Stream URL obtained!")
            print(f"📍 Location: {location_name}")
            print(f"🎬 Opening video stream...")
            
            # Set OpenCV options for better stream handling
            # Try with default backend first, then FFMPEG
            cap = cv2.VideoCapture(stream_url)
            
            if not cap.isOpened():
                print("   ⚠️ Default backend failed, trying FFMPEG...")
                cap = cv2.VideoCapture(stream_url, cv2.CAP_FFMPEG)
            
            # Set buffer and timeout properties
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Minimize buffer for lower latency
            cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, 30000)  # 30 second timeout
            cap.set(cv2.CAP_PROP_READ_TIMEOUT_MSEC, 30000)  # 30 second read timeout
            
            window_title = f"{location_name} - Press 'q' to quit, '1-4' to switch location"
        
        if not cap.isOpened():
            print("❌ Error: Could not open video source")
            if source_type == 'youtube':
                print("\n💡 Connection failed. Possible causes:")
                print("   • YouTube stream URL expired (they refresh every ~6 hours)")
                print("   • Network firewall blocking the connection")
                print("   • Stream is temporarily unavailable")
                print("   • Try selecting a different location (press 1-4)")
            return
        
        print(f"✅ Starting detection... Writing to {self.csv_file}")
        if source_type == 'youtube':
            print(f"✅ Connected to: {location_name}")
            print("💡 Stream may take 10-30 seconds to stabilize...")
        print("Press 'q' to quit\n")
        
        frame_count = 0
        fps_time = time.time()
        fps = 0
        process_every_n_frames = 2
        write_every_n_frames = 30  # Write to CSV every 30 frames (~1 second)
        
        while True:
            ret, frame = cap.read()
            
            if not ret:
                if source_type == 'youtube':
                    print("⚠️ Stream connection lost. Reconnecting...")
                    cap.release()
                    time.sleep(5)  # Wait longer before reconnecting
                    
                    print("   Attempting to reconnect...")
                    stream_url = self.get_youtube_stream(source_id)
                    if stream_url:
                        cap = cv2.VideoCapture(stream_url, cv2.CAP_FFMPEG)
                        cap.set(cv2.CAP_PROP_BUFFERSIZE, 3)
                        print("   ✅ Reconnected!")
                    else:
                        print("   ❌ Failed to reconnect. Exiting...")
                        break
                    continue
                else:
                    print("❌ Error reading from camera")
                    break
            
            frame_count += 1
            
            if frame_count % process_every_n_frames == 0:
                if frame_count % 30 == 0:
                    fps = 30 / (time.time() - fps_time)
                    fps_time = time.time()
                
                try:
                    display_frame = frame.copy()
                    frame = cv2.resize(frame, (640, 480))
                    
                    boxes, confidences, class_ids, indexes = self.detect_objects(frame)
                    vehicle_count, person_count, vehicle_types = self.count_objects(class_ids, indexes)
                except Exception as e:
                    print(f"⚠️ Detection error: {e}")
                    continue
                
                # Write to CSV and Firebase periodically
                if frame_count % write_every_n_frames == 0:
                    self.write_to_csv(source_type, str(source_id), vehicle_count, person_count, vehicle_types)
                    
                    # Write to Firebase for YouTube streams
                    if source_type == 'youtube' and location_name:
                        self.write_to_firebase(location_name, vehicle_count, person_count)
                
                scale_x = display_frame.shape[1] / frame.shape[1]
                scale_y = display_frame.shape[0] / frame.shape[0]
                
                scaled_boxes = [[int(x*scale_x), int(y*scale_y), int(w*scale_x), int(h*scale_y)] 
                               for x, y, w, h in boxes]
                
                display_frame = self.draw_detections(display_frame, scaled_boxes, confidences, class_ids, indexes)
                
                # Info panel
                overlay = display_frame.copy()
                cv2.rectangle(overlay, (0, 0), (400, 280), (0, 0, 0), -1)
                cv2.addWeighted(overlay, 0.6, display_frame, 0.4, 0, display_frame)
                
                traffic_level = self.get_traffic_level(vehicle_count)
                pedestrian_level = self.get_pedestrian_level(person_count)
                
                # Display info
                if source_type == 'youtube' and location_name:
                    cv2.putText(display_frame, f"Location: {location_name}", (10, 25), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                else:
                    cv2.putText(display_frame, f"Source: {source_type.upper()}", (10, 25), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                
                cv2.putText(display_frame, f"Cars: {vehicle_count}", (10, 60), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                cv2.putText(display_frame, f"People: {person_count}", (10, 95), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
                cv2.putText(display_frame, f"Traffic: {traffic_level}", (10, 130), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
                cv2.putText(display_frame, f"Pedestrians: {pedestrian_level}", (10, 165), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
                cv2.putText(display_frame, f"FPS: {fps:.1f}", (10, 200), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
                
                if source_type == 'youtube':
                    firebase_status = "✓ Firebase" if self.db_ref else "✗ Firebase"
                    cv2.putText(display_frame, firebase_status, (10, 235), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0) if self.db_ref else (0, 0, 255), 2)
                    cv2.putText(display_frame, f"Press 1-4 to switch", (10, 265), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
                
                y_offset = 270
                for vehicle_type, count in vehicle_types.items():
                    if count > 0:
                        cv2.putText(display_frame, f"{vehicle_type.capitalize()}: {count}", (10, y_offset), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
                        y_offset += 25
                
                cv2.imshow(window_title, display_frame)
                
                if frame_count % 30 == 0:
                    loc_info = f"📍 {location_name} | " if location_name else ""
                    print(f"{loc_info}🚗 Cars:{vehicle_count} | 👥 People:{person_count} | 🚦 {traffic_level} | ⚡ {fps:.1f}fps")
            
            key = cv2.waitKey(1) & 0xFF
            
            # Check for quit
            if key == ord('q'):
                break
            
            # Check for location switch (only for YouTube streams)
            if source_type == 'youtube' and key in [ord('1'), ord('2'), ord('3'), ord('4')]:
                new_location = chr(key)
                if new_location in self.locations and new_location != location_key:
                    print(f"\n🔄 Switching to location {new_location}...")
                    cap.release()
                    cv2.destroyAllWindows()
                    
                    # Restart with new location
                    location_info = self.locations[new_location]
                    self.run(source_type='youtube', 
                            source_id=location_info['url'],
                            location_key=new_location,
                            location_name=location_info['name'])
                    return
        
        cap.release()
        cv2.destroyAllWindows()
        print(f"\n✅ Detection stopped! Data saved to {self.csv_file}")


def select_input_mode():
    """Interactive mode selection"""
    print("\n" + "=" * 60)
    print("🎥 SELECT INPUT MODE")
    print("=" * 60)
    print("\n1️⃣  Camera (Webcam/USB Camera)")
    print("2️⃣  YouTube Live Streams (Predefined Locations)")
    print("\n" + "=" * 60)
    
    while True:
        choice = input("\nEnter your choice (1 or 2): ").strip()
        
        if choice == '1':
            return 'camera'
        elif choice == '2':
            return 'youtube'
        else:
            print("❌ Invalid choice! Please enter 1 or 2.")

def select_location(detector):
    """Select from predefined locations"""
    print("\n" + "=" * 60)
    print("📍 SELECT LOCATION")
    print("=" * 60)
    
    for key, location in detector.locations.items():
        print(f"\n{key}️⃣  {location['name']}")
        print(f"   {location['description']}")
    
    print("\n" + "=" * 60)
    
    while True:
        choice = input("\nSelect location (1-4): ").strip()
        
        if choice in detector.locations:
            return choice
        else:
            print("❌ Invalid choice! Please enter 1, 2, 3, or 4.")


if __name__ == "__main__":
    print("=" * 60)
    print("🎥 CitySense - Live Detection → Firebase RTDB")
    print("=" * 60)
    
    mode = select_input_mode()
    detector = LiveStreamDetector(model_type='yolov4-tiny')
    
    if mode == 'camera':
        cameras = detector.list_available_cameras()
        
        if not cameras:
            print("\n❌ No cameras found! Exiting...")
        else:
            print(f"\n📷 Available cameras: {cameras}")
            
            if len(cameras) == 1:
                camera_id = cameras[0]
                print(f"✅ Using Camera {camera_id}")
            else:
                while True:
                    try:
                        camera_input = input(f"\nSelect camera index {cameras}: ").strip()
                        camera_id = int(camera_input)
                        if camera_id in cameras:
                            break
                        else:
                            print(f"❌ Invalid camera! Choose from {cameras}")
                    except ValueError:
                        print("❌ Please enter a valid number!")
            
            detector.run(source_type='camera', source_id=camera_id)
    
    else:
        # Use predefined locations
        location_key = select_location(detector)
        location_info = detector.locations[location_key]
        
        print(f"\n✅ Starting detection for: {location_info['name']}")
        print(f"📝 Data will be saved to Firebase under: locations/{location_info['name']}")
        print(f"💡 Press 1-4 during detection to switch locations")
        print(f"💡 Press 'q' to quit\n")
        
        detector.run(
            source_type='youtube', 
            source_id=location_info['url'],
            location_key=location_key,
            location_name=location_info['name']
        )
