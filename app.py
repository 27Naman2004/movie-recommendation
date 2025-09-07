from flask import Flask, render_template, request, jsonify
import pickle
import pandas as pd
import requests
import time

app = Flask(__name__)

# Load pickles
movies = pickle.load(open('models/movie_dict.pkl', 'rb'))
similarity = pickle.load(open('models/similarity.pkl', 'rb'))

# If movies is a dictionary, convert to DataFrame
if isinstance(movies, dict):
    movies = pd.DataFrame(movies)

# Function to fetch movie details from TMDB
def fetch_movie_details(movie_id):
    try:
        if pd.isna(movie_id) or movie_id == '':
            return get_placeholder_movie()
            
        url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key=6a6cd6353aee4c59453e91e8371e3781&language=en-US"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return {
                "poster": "https://image.tmdb.org/t/p/w500/" + data.get('poster_path') if data.get('poster_path') else "https://via.placeholder.com/300x450/2c5364/ffffff?text=No+Image",
                "title": data.get("title", "Unknown Title"),
                "rating": round(data.get("vote_average", 0), 1) if data.get("vote_average") else "N/A",
                "release": data.get("release_date", "N/A")[:4] if data.get("release_date") else "N/A",
                "tagline": data.get("tagline", "No tagline available"),
                "overview": data.get("overview", "No description available.")
            }
        else:
            return get_placeholder_movie()
    except:
        return get_placeholder_movie()

def get_placeholder_movie():
    return {
        "poster": "https://via.placeholder.com/300x450/2c5364/ffffff?text=No+Image",
        "title": "Movie Not Found",
        "rating": "N/A",
        "release": "N/A",
        "tagline": "No information available",
        "overview": "Could not fetch movie details from TMDB."
    }

# Recommendation function
def recommend(movie_title, top_n=5):
    if movie_title not in movies['title'].values:
        return []
    
    idx = movies[movies['title'] == movie_title].index[0]
    distances = list(enumerate(similarity[idx]))
    distances = sorted(distances, reverse=True, key=lambda x: x[1])
    
    recommended_movies = []
    for i in distances[1:top_n+1]:
        movie_id = movies.iloc[i[0]].movie_id
        movie_details = fetch_movie_details(movie_id)
        recommended_movies.append(movie_details)
        time.sleep(0.1)  # Small delay to avoid overwhelming the API
        
    return recommended_movies

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/movies')
def get_movies():
    movie_titles = movies['title'].tolist()
    return jsonify(movie_titles)

@app.route('/recommend', methods=['POST'])
def get_recommendation():
    movie = request.json.get('movie')
    recommendations = recommend(movie)
    return jsonify({'recommendations': recommendations})

if __name__ == '__main__':
    app.run(debug=True)