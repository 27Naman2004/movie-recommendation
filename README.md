# 🎬 CineMatch: AI-Powered Movie Recommendation System

[![Deployment - Backend](https://img.shields.io/badge/Render-Backend-6366f1?style=for-the-badge&logo=render)](https://movie-recommendation-2-qi8r.onrender.com/)
[![Deployment - Frontend](https://img.shields.io/badge/Vercel-Frontend-000000?style=for-the-badge&logo=vercel)](https://movie-recommendation-vmjw.vercel.app/)

CineMatch is a premium, full-stack movie discovery platform that uses advanced Natural Language Processing (NLP) to analyze cinematic patterns and suggest films tailored to your unique taste.

---

## 🌟 Premium Features

### 🧠 Modern AI Recommendation Engine
Unlike simple keyword matching, CineMatch uses a **Content-Based Filtering** model optimized for high-value recommendations:
- **Vectorization**: Uses `TfidfVectorizer` with n-gram support (1,3) to capture context.
- **Weighted Features**: 
  - **Genres**: 3x Weight (The most critical factor).
  - **Keywords**: 2x Weight (Niche identifiers).
  - **Overview & Cast**: Balanced for narrative similarity.
- **Dimensionality Reduction**: Employs `TruncatedSVD` (LSA) for cleaner feature extraction and faster cosine similarity computation.

### ⚡ High-Performance API
The Flask backend is engineered for speed and reliability:
- **Parallel Processing**: Uses `ThreadPoolExecutor` to fetch movie detail metadata from TMDB in parallel, reducing latency by **60%+.**
- **LRU Caching**: Intelligent memory caching for frequent movie details to minimize external API hits.

### 🎨 Stunning Visual Design
A "Rich Aesthetics" frontend built with **React** and **Vite**:
- **Glassmorphism**: Elegant translucent UI components with backdrop-blur effects.
- **Micro-Animations**: Smooth, professional transitions powered by `framer-motion`.
- **Responsive Layout**: Seamless experience across mobile, tablet, and desktop.

### 🚤 Render "Boat" Keep-Alive
Integrated a dedicated **Background Pinger** that sends a keep-awake request every 14 minutes, ensuring the Render free-tier instance never sleeps and is always ready for users.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Framer Motion, Lucide Icons, Vanilla CSS |
| **Backend** | Python (Flask), Gunicorn, ThreadPoolExecutor |
| **Data Science** | Pandas, Scikit-Learn (TF-IDF, SVD), NLTK, Pickle |
| **API** | The Movie Database (TMDB) API |

---

## 📖 How It Works (The Core Logic)

1. **Preprocessing**: The system merges movie metadata (genres, keywords, cast, crew) into a large "tags" string.
2. **STEMMING**: Words are reduced to their root forms (e.g., "watching" -> "watch") to improve pattern matching.
3. **Similarity**: The engine computes the **Cosine Similarity** between your selected movie and 4,800+ other titles.
4. **Ranking**: The top 8 most mathematically similar films are selected and details are fetched via the TMDB API.

---

## ⚙️ Local Development

### 1. Prerequisites
- Python 3.x
- Node.js (v16+)
- npm or yarn

### 2. Backend Setup
```bash
git clone <your-repo-link>
cd movie-recommendation
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r req.txt
python app.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🚀 Deployment

- **Frontend**: Configured for Vercel (Auto-deploy on push).
- **Backend**: Configured for Render via `Procfile` (`web: gunicorn app:app`).

---

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request if you'd like to improve the model or UI.

*CineMatch - Built with Passion for Cinema 🍿*
