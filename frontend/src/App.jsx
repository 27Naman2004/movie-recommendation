import { useState, useEffect } from 'react'
import { Search, Film, Star, Calendar, Info, Loader2, Sparkles, ChevronRight, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [query, setQuery] = useState('')
  const [allMovies, setAllMovies] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Production Backend URL
  // Use localhost if running locally, otherwise use production Render URL
  const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") 
    ? "http://localhost:5000" 
    : "https://movie-recommendation-2-qi8r.onrender.com";

  // Fetch all movie titles for autocomplete
  useEffect(() => {
    fetch(`${API_BASE}/api/movies`)
      .then(res => res.json())
      .then(data => setAllMovies(data))
      .catch(err => console.error("Error fetching movies:", err))
  }, [])

  // Handle autocomplete
  useEffect(() => {
    if (query.trim().length > 1) {
      const filtered = allMovies
        .filter(m => m.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10)
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }, [query, allMovies])

  const handleRecommend = async (movieTitle) => {
    setLoading(true)
    setError(null)
    setQuery(movieTitle)
    setSuggestions([])
    
    try {
      const response = await fetch(`${API_BASE}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movie: movieTitle })
      })
      
      const data = await response.json()
      if (data.recommendations) {
        setRecommendations(data.recommendations)
      } else {
        setError("No recommendations found.")
      }
    } catch (err) {
      setError("Failed to fetch recommendations. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <div className="bg-gradient" />
      
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo">
          <div className="logo-icon-wrapper" style={{ padding: '8px', background: 'var(--primary)', borderRadius: '10px', display: 'flex' }}>
            <Film style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <span>Cine<span style={{ color: 'var(--primary)' }}>Match</span></span>
        </div>
        <div className="nav-links">
          <a href="#">Discover</a>
          <a href="#">Trending</a>
          <a href="#">My List</a>
        </div>
        <button className="primary-btn">
          Get Started
        </button>
      </nav>

      <main className="container" style={{ paddingTop: '8rem', paddingBottom: '5rem' }}>
        {/* Hero Section */}
        <section className="hero text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="badge">
              <Sparkles style={{ width: '14px', height: '14px' }} />
              <span>Next-Gen Recommendations</span>
            </div>
            <h1 className="text-gradient">
              Unlock Your Next <br /> 
              <span className="accent-gradient">Cinematic Obsession</span>
            </h1>
            <p className="hero-subtext">
              Our AI-powered engine analyzes patterns in storytelling to find movies you'll truly love. Just type a title and let the magic happen.
            </p>

            {/* Search Container */}
            <div className="search-container animate-up">
              <div className="search-input-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search for a movie you enjoyed..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && query && handleRecommend(query)}
                />
                {loading && (
                  <Loader2 style={{ position: 'absolute', right: '1.25rem', animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                )}
              </div>

              {/* Autocomplete Suggestions */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="suggestions-panel"
                  >
                    {suggestions.map((movie, i) => (
                      <button
                        key={i}
                        className="suggestion-item"
                        onClick={() => handleRecommend(movie)}
                      >
                        {movie}
                        <ChevronRight style={{ width: '14px', height: '14px', opacity: 0.5 }} />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </section>

        {/* Results Section */}
        <section style={{ marginTop: '5rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {recommendations.length > 0 ? "Curated For You" : "Start Discovering"}
            </h2>
            <p style={{ color: '#64748b' }}>
              {recommendations.length > 0 ? `Based on your taste in "${query}"` : "Enter a movie title to see AI-powered suggestions"}
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 0' }}>
              <Loader2 style={{ width: '40px', height: '40px', color: 'var(--primary)', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }} />
              <p style={{ color: '#94a3b8', animation: 'pulse 2s infinite' }}>Analyzing cinematic patterns...</p>
            </div>
          ) : error ? (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          ) : (
            <div className="movie-grid">
              <AnimatePresence>
                {recommendations.map((movie, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card movie-card flex flex-col"
                  >
                    <div className="movie-poster-container">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="movie-poster"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/500x750/1a1a2e/ffffff?text=Image+Load+Error";
                        }}
                      />
                      <div className="poster-overlay">
                         <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: 800, marginBottom: '8px' }}>
                           <Star style={{ width: '14px', height: '14px', fill: '#fbbf24' }} />
                           {movie.rating}
                         </div>
                         <p style={{ fontSize: '0.8125rem', color: '#cbd5e1' }} className="line-clamp-3">
                           {movie.overview}
                         </p>
                      </div>
                      <div className="rating-badge">
                        <Star style={{ width: '12px', height: '12px', fill: '#fbbf24', color: '#fbbf24' }} />
                        {movie.rating}
                      </div>
                    </div>
                    <div className="movie-info flex-col" style={{ flexGrow: 1 }}>
                      <div className="movie-release">
                        <Calendar style={{ width: '12px', height: '12px' }} />
                        {movie.release}
                      </div>
                      <h3 className="movie-title line-clamp-1">{movie.title}</h3>
                      {movie.tagline && (
                        <p className="movie-tagline line-clamp-1">"{movie.tagline}"</p>
                      )}
                      
                      <div className="mt-auto" style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--glass-border)', marginTop: 'auto' }}>
                         <button style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                           More Details <ChevronRight style={{ width: '14px', height: '14px' }} />
                         </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!loading && recommendations.length === 0 && !error && (
            <div style={{ padding: '5rem 0', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 2rem', border: '1px solid var(--glass-border)' }}>
                <Info style={{ width: '32px', height: '32px', color: '#475569', margin: 'auto' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>Ready to watch something new?</h3>
              <p style={{ color: '#475569' }}>Search for your favorite movie above to get personalized suggestions.</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '4rem 0', background: 'rgba(2, 6, 23, 0.3)', marginTop: '5rem' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          <div className="nav-logo">
             <Film style={{ width: '20px', height: '20px', color: 'var(--primary)' }} />
             <span>Cine<span style={{ color: 'var(--primary)' }}>Match</span></span>
          </div>
          <div style={{ color: '#475569', fontSize: '0.875rem' }}>
            © 2026 CineMatch AI. Built with Premium Aesthetics.
          </div>
          <div style={{ display: 'flex', gap: '2rem', color: '#64748b', fontSize: '0.875rem' }}>
            <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>API</a>
            <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy</a>
            <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Contact</a>
          </div>
        </div>
      </footer>

      {/* Basic Keyframes for Loader */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  )
}

export default App
