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
import requests
import io
from pydub import AudioSegment


class MultiStreamDetector:
    def __init__(self, model_type='yolov4-tiny'):
        """
        Multi-stream detector + audio noise analyzer
        model_type: 'yolov4-tiny' (faster) or 'yolov4' (more accurate)
        """
        self.model_type = model_type
        self.csv_file = 'detections.csv'

        # Initialize Firebase
        self.init_firebase()

        # Define locations and YouTube URLs
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

        with open("coco.names", "r") as f:
            self.classes = [line.strip() for line in f.readlines()]

        layer_names = self.net.getLayerNames()
        self.output_layers = [layer_names[i - 1] for i in self.net.getUnconnectedOutLayers()]

        self.colors = np.random.uniform(0, 255, size=(len(self.classes), 3))
        self.vehicle_classes = ['car', 'motorcycle', 'bus', 'truck', 'bicycle']
        self.person_class = 'person'
        self.confidence_threshold = 0.4
        self.nms_threshold = 0.4
        self.lock = threading.Lock()

        print("✅ Model loaded successfully!")

    # ---------------------- INITIALIZATION ----------------------

    def init_firebase(self):
        try:
            service_account_file = 'firebase-credentials.json'
            if not firebase_admin._apps:
                if os.path.exists(service_account_file):
                    cred = credentials.Certificate(service_account_file)
                    firebase_admin.initialize_app(cred, {
                        'databaseURL': 'https://citysense-crono-default-rtdb.firebaseio.com'
                    })
                else:
                    firebase_admin.initialize_app(options={
                        'databaseURL': 'https://citysense-crono-default-rtdb.firebaseio.com'
                    })
            self.db_ref = db.reference('/')
            print("✅ Firebase initialized successfully!")
        except Exception as e:
            print(f"⚠️ Firebase init error: {e}")
            self.db_ref = None

    def init_csv(self):
        with open(self.csv_file, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                'timestamp', 'location',
                'vehicle_count', 'person_count', 'total_objects',
                'cars', 'motorcycles', 'buses', 'trucks', 'bicycles',
                'traffic_level', 'pedestrian_level', 'noise_level_dBFS'
            ])
        print(f"✅ CSV initialized: {self.csv_file}")

    def download_model_files(self):
        files = {
            'coco.names': 'https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names',
            'yolov4-tiny.cfg': 'https://raw.githubusercontent.com/AlexeyAB/darknet/master/cfg/yolov4-tiny.cfg',
            'yolov4-tiny.weights': 'https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v4_pre/yolov4-tiny.weights'
        }
        for filename, url in files.items():
            if not os.path.exists(filename):
                print(f"⬇️ Downloading {filename}...")
                try:
                    urllib.request.urlretrieve(url, filename)
                    print(f"✅ {filename} ready!")
                except Exception as e:
                    print(f"❌ Error downloading {filename}: {e}")

    # ---------------------- STREAM & DETECTION ----------------------

    def get_youtube_stream(self, youtube_url, video=True):
        """Extract video or audio stream URL"""
        try:
            ydl_opts = {
                'format': 'best[height<=480]/best' if video else 'bestaudio/best',
                'quiet': True,
                'no_warnings': True
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(youtube_url, download=False)
                if 'url' in info:
                    return info['url']
                elif 'formats' in info:
                    formats = [f for f in info['formats'] if f.get('url')]
                    if formats:
                        return formats[-1]['url']
        except Exception as e:
            print(f"❌ Stream extraction error: {e}")
        return None

    def detect_objects(self, frame):
        height, width, _ = frame.shape
        blob = cv2.dnn.blobFromImage(frame, 1/255.0, (416, 416), (0, 0, 0), True, crop=False)
        with self.lock:
            self.net.setInput(blob)
            outs = self.net.forward(self.output_layers)
        class_ids, confidences, boxes = [], [], []
        for out in outs:
            for detection in out:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                if confidence > self.confidence_threshold:
                    center_x, center_y, w, h = (detection[0]*width, detection[1]*height,
                                                detection[2]*width, detection[3]*height)
                    x = int(center_x - w/2)
                    y = int(center_y - h/2)
                    boxes.append([x, y, int(w), int(h)])
                    confidences.append(float(confidence))
                    class_ids.append(class_id)
        indexes = cv2.dnn.NMSBoxes(boxes, confidences, self.confidence_threshold, self.nms_threshold)
        return boxes, confidences, class_ids, indexes

    def count_objects(self, class_ids, indexes):
        vehicle_count = 0
        person_count = 0
        vehicle_types = defaultdict(int)
        if len(indexes) > 0:
            for i in indexes.flatten():
                if i < 0 or i >= len(class_ids):
                    continue
                class_name = self.classes[class_ids[i]]
                if class_name in self.vehicle_classes:
                    vehicle_count += 1
                    vehicle_types[class_name] += 1
                elif class_name == self.person_class:
                    person_count += 1
        return vehicle_count, person_count, vehicle_types

    # ---------------------- AUDIO ANALYSIS ----------------------

    def analyze_audio_noise(self, audio_url):
        """Fetch small chunk of audio and compute average dBFS"""
        try:
            response = requests.get(audio_url, stream=True, timeout=10)
            data = b''.join(response.iter_content(1024 * 50))
            audio = AudioSegment.from_file(io.BytesIO(data), format="webm")
            loudness = audio.dBFS
            return loudness
        except Exception as e:
            print(f"⚠️ Audio analysis failed: {e}")
            return None

    # ---------------------- LEVEL CALCULATION ----------------------

    def get_traffic_level(self, v):
        if v == 0:
            return "EMPTY"
        elif v <= 3:
            return "LOW"
        elif v <= 8:
            return "MEDIUM"
        elif v <= 15:
            return "HIGH"
        else:
            return "CONGESTED"

    def get_pedestrian_level(self, p):
        if p == 0:
            return "EMPTY"
        elif p <= 5:
            return "LOW"
        elif p <= 15:
            return "MODERATE"
        elif p <= 25:
            return "BUSY"
        else:
            return "CROWDED"

    # ---------------------- DATA LOGGING ----------------------

    def write_to_csv(self, loc, v, p, vehicle_types, noise):
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        total = v + p
        with open(self.csv_file, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                timestamp, loc, v, p, total,
                vehicle_types.get('car', 0),
                vehicle_types.get('motorcycle', 0),
                vehicle_types.get('bus', 0),
                vehicle_types.get('truck', 0),
                vehicle_types.get('bicycle', 0),
                self.get_traffic_level(v),
                self.get_pedestrian_level(p),
                noise
            ])

    def write_to_firebase(self, loc_key, loc_name, v, p, vehicle_types, noise):
        if self.db_ref is None:
            return
        try:
            timestamp_key = datetime.now().strftime('%Y%m%d_%H%M%S')
            data = {
                'cars': v,
                'people': p,
                'timestamp': datetime.now().isoformat(),
                'noise_level_dbfs': noise,
                'traffic_level': self.get_traffic_level(v),
                'pedestrian_level': self.get_pedestrian_level(p),
                'vehicle_breakdown': dict(vehicle_types)
            }
            base = self.db_ref.child('locations').child(loc_name)
            base.child('detections').child(timestamp_key).set(data)
            base.child('latest').set(data)
        except Exception as e:
            print(f"❌ Firebase write error: {e}")

    # ---------------------- PROCESSING ----------------------

    def process_stream(self, loc_key, loc_name, video_url, audio_url):
        print(f"🎬 [{loc_name}] Starting stream...")
        cap = cv2.VideoCapture(video_url, cv2.CAP_FFMPEG)
        if not cap.isOpened():
            print(f"❌ [{loc_name}] Failed to open video stream")
            return

        frame_count = 0
        process_every = 30
        last_noise_time = 0
        current_noise = None

        while True:
            ret, frame = cap.read()
            if not ret:
                print(f"⚠️ [{loc_name}] Lost connection, retrying...")
                time.sleep(5)
                break

            frame_count += 1
            if frame_count % process_every == 0:
                try:
                    frame = cv2.resize(frame, (640, 480))
                    boxes, conf, ids, idxs = self.detect_objects(frame)
                    v, p, types = self.count_objects(ids, idxs)

                    # Update audio every 20 sec
                    if time.time() - last_noise_time > 20:
                        current_noise = self.analyze_audio_noise(audio_url)
                        last_noise_time = time.time()

                    self.write_to_csv(loc_name, v, p, types, current_noise)
                    self.write_to_firebase(loc_key, loc_name, v, p, types, current_noise)

                    print(f"📍 [{loc_name}] 🚗{v} 👥{p} 🔊{current_noise:.1f}dBFS")
                except Exception as e:
                    print(f"⚠️ [{loc_name}] Processing error: {e}")
                    continue

    def run_all_streams(self):
        print("=" * 80)
        print("🚀 CitySense Multi-Stream Detector + Audio Analyzer")
        print("=" * 80)

        threads = []
        for key, loc in self.locations.items():
            print(f"🔗 Getting stream for {loc['name']}...")
            vurl = self.get_youtube_stream(loc['url'], video=True)
            aurl = self.get_youtube_stream(loc['url'], video=False)
            if vurl and aurl:
                t = threading.Thread(target=self.process_stream, args=(key, loc['name'], vurl, aurl), daemon=True)
                t.start()
                threads.append(t)
                time.sleep(2)
            else:
                print(f"❌ Failed to get stream for {loc['name']}")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Stopping all streams...")


if __name__ == "__main__":
    print("=" * 80)
    print("🎥 CitySense - Multi-Stream Detector + Audio Noise Analyzer")
    print("=" * 80)
    detector = MultiStreamDetector(model_type='yolov4-tiny')
    detector.run_all_streams()
