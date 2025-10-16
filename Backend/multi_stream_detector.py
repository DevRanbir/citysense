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
import threading
from queue import Queue

class MultiStreamDetector:
    def __init__(self, model_type='yolov4-tiny'):
        """
        Multi-stream detector that connects to all YouTube feeds simultaneously
        model_type: 'yolov4-tiny' (faster) or 'yolov4' (more accurate)
        """
        self.model_type = model_type
        self.csv_file = 'detections.csv'
        
        # Initialize Firebase
        self.init_firebase()
        
        # Define all locations with YouTube live feeds
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
        
        # Thread safety
        self.lock = threading.Lock()
        
        print("✅ Model loaded successfully!")
    
    def init_firebase(self):
        """Initialize Firebase connection"""
        try:
            service_account_file = 'firebase-credentials.json'
            
            if not firebase_admin._apps:
                if os.path.exists(service_account_file):
                    print("🔑 Using service account credentials...")
                    cred = credentials.Certificate(service_account_file)
                    firebase_admin.initialize_app(cred, {
                        'databaseURL': 'https://citysense-crono-default-rtdb.firebaseio.com'
                    })
                else:
                    print("🔑 Attempting to use default credentials...")
                    try:
                        cred = credentials.ApplicationDefault()
                        firebase_admin.initialize_app(cred, {
                            'databaseURL': 'https://citysense-crono-default-rtdb.firebaseio.com'
                        })
                    except:
                        print("⚠️ No credentials found, using anonymous connection...")
                        firebase_admin.initialize_app(options={
                            'databaseURL': 'https://citysense-crono-default-rtdb.firebaseio.com'
                        })
            
            self.db_ref = db.reference('/')
            
            # Test write
            try:
                test_ref = self.db_ref.child('_test')
                test_ref.set({'test': 'connection', 'timestamp': datetime.now().isoformat()})
                test_ref.delete()
                print("✅ Firebase initialized and verified!")
                print("📊 Database URL: https://citysense-crono-default-rtdb.firebaseio.com")
            except Exception as test_error:
                print(f"⚠️ Firebase connected but write test failed: {test_error}")
                self.db_ref = None
            
        except Exception as e:
            print(f"⚠️ Firebase initialization error: {e}")
            self.db_ref = None
    
    def init_csv(self):
        """Initialize CSV file with headers"""
        with open(self.csv_file, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                'timestamp', 'location', 
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
    
    def get_youtube_stream(self, youtube_url):
        """Extract stream URL from YouTube"""
        try:
            ydl_opts = {
                'format': 'best[height<=480]/best',
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
                'socket_timeout': 30,
                'retries': 10,
                'fragment_retries': 10,
                'skip_unavailable_fragments': True,
                'http_headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                }
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(youtube_url, download=False)
                
                if 'url' in info:
                    return info['url']
                elif 'formats' in info:
                    formats = [f for f in info['formats'] if f.get('url')]
                    if formats:
                        return formats[-1]['url']
                
                return None
                
        except Exception as e:
            print(f"❌ Error getting stream: {e}")
            return None
    
    def detect_objects(self, frame):
        """Detect objects in frame using YOLO"""
        height, width, channels = frame.shape
        
        blob = cv2.dnn.blobFromImage(frame, 1/255.0, (416, 416), (0, 0, 0), True, crop=False)
        
        with self.lock:
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
                if i < 0 or i >= len(class_ids):
                    continue
                
                class_id = class_ids[i]
                
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
    
    def write_to_csv(self, location, vehicle_count, person_count, vehicle_types):
        """Write detection data to CSV"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        total_objects = vehicle_count + person_count
        traffic_level = self.get_traffic_level(vehicle_count)
        pedestrian_level = self.get_pedestrian_level(person_count)
        
        with open(self.csv_file, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                timestamp,
                location,
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
    
    def write_to_firebase(self, location_key, location_name, vehicle_count, person_count, vehicle_types):
        """Write detection data to Firebase"""
        if self.db_ref is None:
            return False
        
        try:
            timestamp = datetime.now().isoformat()
            timestamp_key = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            data = {
                'cars': vehicle_count,
                'people': person_count,
                'timestamp': timestamp,
                'traffic_level': self.get_traffic_level(vehicle_count),
                'pedestrian_level': self.get_pedestrian_level(person_count),
                'vehicle_breakdown': {
                    'cars': vehicle_types.get('car', 0),
                    'motorcycles': vehicle_types.get('motorcycle', 0),
                    'buses': vehicle_types.get('bus', 0),
                    'trucks': vehicle_types.get('truck', 0),
                    'bicycles': vehicle_types.get('bicycle', 0)
                }
            }
            
            # Write to Firebase using the location name (e.g., "Canmore Alberta")
            location_ref = self.db_ref.child('locations').child(location_name).child('detections')
            location_ref.child(timestamp_key).set(data)
            
            # Update latest data
            latest_ref = self.db_ref.child('locations').child(location_name).child('latest')
            latest_ref.set(data)
            
            return True
            
        except Exception as e:
            print(f"❌ Firebase write error for {location_name}: {e}")
            return False
    
    def process_stream(self, location_key, location_name, stream_url):
        """Process a single stream in a thread"""
        print(f"🎬 [{location_name}] Connecting to stream...")
        
        cap = cv2.VideoCapture(stream_url, cv2.CAP_FFMPEG)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        
        if not cap.isOpened():
            print(f"❌ [{location_name}] Failed to open stream")
            return
        
        print(f"✅ [{location_name}] Connected!")
        
        frame_count = 0
        process_every_n_frames = 30  # Process every 30 frames (~1 second)
        last_process_time = time.time()
        
        while True:
            ret, frame = cap.read()
            
            if not ret:
                print(f"⚠️ [{location_name}] Connection lost, reconnecting...")
                cap.release()
                time.sleep(5)
                
                # Reconnect
                new_stream_url = self.get_youtube_stream(self.locations[location_key]['url'])
                if new_stream_url:
                    cap = cv2.VideoCapture(new_stream_url, cv2.CAP_FFMPEG)
                    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                    if cap.isOpened():
                        print(f"✅ [{location_name}] Reconnected!")
                        continue
                
                print(f"❌ [{location_name}] Failed to reconnect, exiting thread")
                break
            
            frame_count += 1
            
            # Process frame periodically
            if frame_count % process_every_n_frames == 0:
                current_time = time.time()
                
                try:
                    # Resize for processing
                    frame = cv2.resize(frame, (640, 480))
                    
                    # Detect objects
                    boxes, confidences, class_ids, indexes = self.detect_objects(frame)
                    vehicle_count, person_count, vehicle_types = self.count_objects(class_ids, indexes)
                    
                    # Write to CSV and Firebase
                    self.write_to_csv(location_name, vehicle_count, person_count, vehicle_types)
                    self.write_to_firebase(location_key, location_name, vehicle_count, person_count, vehicle_types)
                    
                    # Log stats
                    elapsed = current_time - last_process_time
                    fps = process_every_n_frames / elapsed if elapsed > 0 else 0
                    
                    traffic_level = self.get_traffic_level(vehicle_count)
                    print(f"📍 [{location_name}] 🚗 Cars:{vehicle_count} | 👥 People:{person_count} | 🚦 {traffic_level} | ⚡ {fps:.1f}fps")
                    
                    last_process_time = current_time
                    
                except Exception as e:
                    print(f"⚠️ [{location_name}] Detection error: {e}")
                    continue
        
        cap.release()
        print(f"🛑 [{location_name}] Stream processing stopped")
    
    def run_all_streams(self):
        """Run detection on all streams simultaneously"""
        print("\n" + "=" * 80)
        print("🚀 Starting Multi-Stream Detection")
        print("=" * 80)
        print(f"📍 Monitoring {len(self.locations)} locations simultaneously")
        print(f"💾 Writing to: {self.csv_file}")
        print(f"🔥 Firebase: {'Connected' if self.db_ref else 'Disconnected'}")
        print("=" * 80 + "\n")
        
        threads = []
        
        # Get stream URLs for all locations
        for location_key, location_info in self.locations.items():
            location_name = location_info['name']
            print(f"🔗 Getting stream URL for {location_name}...")
            stream_url = self.get_youtube_stream(location_info['url'])
            
            if stream_url:
                print(f"✅ [{location_name}] Stream URL obtained")
                # Create and start thread for this location
                thread = threading.Thread(
                    target=self.process_stream,
                    args=(location_key, location_name, stream_url),
                    daemon=True
                )
                thread.start()
                threads.append(thread)
                time.sleep(2)  # Stagger thread starts
            else:
                print(f"❌ [{location_name}] Failed to get stream URL")
        
        print("\n" + "=" * 80)
        print(f"✅ {len(threads)}/{len(self.locations)} streams started successfully")
        print("📊 Data is now being sent to Firebase in real-time")
        print("🔄 Press Ctrl+C to stop all streams")
        print("=" * 80 + "\n")
        
        # Keep main thread alive
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\n🛑 Stopping all streams...")
            print(f"✅ Data saved to {self.csv_file}")
            print("✅ All streams stopped!")


if __name__ == "__main__":
    print("=" * 80)
    print("🎥 CitySense - Multi-Stream Detector → Firebase RTDB")
    print("=" * 80)
    print("\n🌐 This script will connect to ALL YouTube live feeds simultaneously")
    print("📡 Data will be sent to Firebase in real-time")
    print("🚫 No camera input required\n")
    
    detector = MultiStreamDetector(model_type='yolov4-tiny')
    detector.run_all_streams()
