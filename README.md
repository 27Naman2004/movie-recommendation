# CineMatch - AI Movie Recommendation System

A premium, AI-powered movie recommendation system built with a Flask backend and a modern React frontend.

## 🚀 Live Deployment

- **Backend**: [Render](https://movie-recommendation-2-qi8r.onrender.com/)
- **Frontend**: [Vercel](https://movie-recommendation-vmjw.vercel.app/)

## ✨ Key Features

- **Model Optimization**: Enhanced TF-IDF vectorization with 3x weight on Genres and 2x on Keywords for professional accuracy.
- **Async API fetching**: Parallel TMDB detail fetching for lightning-fast performance.
- **Premium UI**: Glassmorphism, radial gradients, and smooth framer-motion animations.
- **Keep-Alive Bot**: Built-in background worker to prevent Render free-tier sleep.

## 🛠️ Local Setup

### Backend
1. `pip install -r req.txt`
2. `python app.py`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 📊 Model Preprocessing
To rebuild the similarity models:
`python preprocess.py`
