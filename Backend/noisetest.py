import yt_dlp
import requests
from pydub import AudioSegment
import io
import csv
from datetime import datetime
import time
from pydub import AudioSegment
from pydub.utils import which

AudioSegment.converter = which("ffmpeg")
AudioSegment.ffprobe = which("ffprobe")

# ===============================
# Function to get audio stream URL
# ===============================
def get_youtube_audio_stream(youtube_url):
    """Extract only audio stream URL from YouTube video/live"""
    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'quiet': True,
            'no_warnings': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
            if 'url' in info:
                return info['url']
            elif 'formats' in info:
                formats = [f for f in info['formats'] if f.get('acodec') != 'none']
                if formats:
                    return formats[-1]['url']
        return None
    except Exception as e:
        print(f"❌ Error getting audio stream: {e}")
        return None


# ===============================
# Function to analyze noise level
# ===============================
def analyze_audio_noise(audio_url, duration_sec=10):
    """Fetch short audio chunk and measure loudness (noise level)"""
    try:
        response = requests.get(audio_url, stream=True, timeout=10)
        chunk = b''.join(response.iter_content(1024 * 50))  # ~few seconds of data
        audio = AudioSegment.from_file(io.BytesIO(chunk), format="webm")
        loudness = audio.dBFS
        return loudness
    except Exception as e:
        print(f"❌ Error analyzing audio: {e}")
        return None


# ===============================
# Function to save result to CSV
# ===============================
def save_noise_data(noise_level):
    """Append noise data to CSV"""
    filename = "audio_noise_log.csv"
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with open(filename, mode="a", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([now, noise_level])

    print(f"📝 Saved: {now} → {noise_level:.2f} dBFS")


# ===============================
# Main Loop
# ===============================
if __name__ == "__main__":
    youtube_url = input("🎥 Enter YouTube Live or Video URL: ").strip()
    print("⏳ Extracting audio stream...")
    audio_url = get_youtube_audio_stream(youtube_url)

    if not audio_url:
        print("❌ Failed to get audio stream.")
        exit()

    print("✅ Audio stream ready! Starting noise analysis...\n")

    # Run continuous monitoring (Ctrl+C to stop)
    try:
        while True:
            noise = analyze_audio_noise(audio_url)
            if noise is not None:
                save_noise_data(noise)
            else:
                print("⚠️ Skipping this round due to error.")
            time.sleep(30)  # every 30 seconds
    except KeyboardInterrupt:
        print("\n🛑 Stopped by user.")
