from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import requests
import time
import threading
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Allow requests from your Vercel frontend
CORS(app, resources={r"/api/*": {"origins": ["https://movie-recommendation-vmjw.vercel.app", "http://localhost:5173"]}})

# Load pickles
try:
    movies = pickle.load(open('models/movie_dict.pkl', 'rb'))
    similarity = pickle.load(open('models/similarity.pkl', 'rb'))
    if isinstance(movies, dict):
        movies = pd.DataFrame(movies)
except Exception as e:
    print(f"Error loading models: {e}")
    # Fallback or initialization error handling
    movies = pd.DataFrame(columns=['movie_id', 'title'])
    similarity = {}

# TMDB API Configuration
TMDB_API_KEY = "6a6cd6353aee4c59453e91e8371e3781" # Keep your existing key
BASE_URL = "https://api.themoviedb.org/3/movie/"

# Optimized Session for API calls
session = requests.Session()

@lru_cache(maxsize=500)
def fetch_movie_details(movie_id):
    """Fetch movie details with caching and error handling."""
    if pd.isna(movie_id) or movie_id == '':
        return get_placeholder_movie()
        
    try:
        url = f"{BASE_URL}{movie_id}?api_key={TMDB_API_KEY}&language=en-US"
        response = session.get(url, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            return {
                "id": int(movie_id),
                "poster": "https://image.tmdb.org/t/p/w500" + data.get('poster_path') if data.get('poster_path') else "https://via.placeholder.com/500x750/1a1a2e/ffffff?text=No+Poster",
                "title": data.get("title", "Unknown Title"),
                "rating": round(data.get("vote_average", 0), 1) if data.get("vote_average") else "N/A",
                "release": data.get("release_date", "N/A")[:4] if data.get("release_date") else "N/A",
                "tagline": data.get("tagline", ""),
                "overview": data.get("overview", "No description available.")
            }
    except Exception as e:
        print(f"API Error for {movie_id}: {e}")
    
    return get_placeholder_movie()

def get_placeholder_movie():
    return {
        "poster": "https://via.placeholder.com/500x750/1a1a2e/ffffff?text=Movie+Image",
        "title": "Information Unavailable",
        "rating": "N/A",
        "release": "N/A",
        "tagline": "",
        "overview": "Could not fetch details from TMDB."
    }

# Recommendation logic
def recommend_movies(movie_title, top_n=8):
    if movie_title not in movies['title'].values:
        return []
    
    idx = movies[movies['title'] == movie_title].index[0]
    
    # Check if similarity is sparse (dict) or matrix (array)
    if isinstance(similarity, dict):
        # We stored top-k neighbors in a dict for optimization in preprocess.py
        neighbors = similarity.get(idx, [])[:top_n]
        recommended_ids = [int(movies.iloc[i].movie_id) for i, score in neighbors]
    else:
        # Fallback for full matrix
        distances = sorted(list(enumerate(similarity[idx])), reverse=True, key=lambda x: x[1])
        recommended_ids = [int(movies.iloc[i[0]].movie_id) for i in distances[1:top_n+1]]
    
    # Fetch details in parallel for optimization
    with ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(fetch_movie_details, recommended_ids))
        
    return results

# Routes
@app.route('/')
def home():
    return "Movie Recommendation API is running! 🚀"

@app.route('/ping')
def ping():
    return jsonify({"status": "alive", "time": time.time()})

@app.route('/api/movies', methods=['GET'])
def get_movies():
    # Return all titles for search autocomplete
    return jsonify(movies['title'].tolist())

@app.route('/api/recommend', methods=['POST'])
def get_recommendation():
    data = request.json
    selected_movie = data.get('movie')
    if not selected_movie:
        return jsonify({'error': 'No movie selected'}), 400
        
    recommendations = recommend_movies(selected_movie)
    return jsonify({'recommendations': recommendations})

# --- Keep-Alive Bot for Render ---
def keep_alive_ping():
    """Background task to ping the server and keep it awake on Render."""
    # We ping the root URL or /ping (localhost if running locally)
    # On Render, the app will have an external URL. 
    # For now, we use a simple loop. In production, provide the RENDER_EXTERNAL_URL env var.
    url = os.getenv("RENDER_EXTERNAL_URL")
    if not url:
        # Fallback to your provided Render URL
        url = "https://movie-recommendation-2-qi8r.onrender.com/ping"
    
    print(f"Keep-alive bot started. Target: {url}")
    while True:
        try:
            # Ping every 1 minutes (Render sleeps after 15 mins)
            time.sleep(1 * 60) 
            requests.get(url, timeout=1)
            print("Keep-alive bot: Ping successful!")
        except Exception as e:
            print(f"Keep-alive bot: Ping failed: {e}")

# Start Keep-Alive thread if not in debug reload
if os.environ.get('WERKZEUG_RUN_MAIN') == 'true' or not app.debug:
    bot_thread = threading.Thread(target=keep_alive_ping, daemon=True)
    bot_thread.start()

if __name__ == '__main__':
    # Default Flask port is 5000
    app.run(host='0.0.0.0', port=5000, debug=True)