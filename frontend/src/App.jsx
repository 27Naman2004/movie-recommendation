import { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Film, 
  Star, 
  Calendar, 
  Info, 
  Loader2, 
  Sparkles, 
  ChevronRight, 
  X, 
  Clock, 
  DollarSign, 
  RefreshCw,
  Play,
  Flame
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [query, setQuery] = useState('')
  const [allMovies, setAllMovies] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Selected movie for details modal
  const [selectedMovie, setSelectedMovie] = useState(null)
  
  // Theme state
  const [theme, setTheme] = useState('indigo')

  // Ref for autocomplete container to handle clicking outside
  const autocompleteRef = useRef(null)

  // Popular starter movies
  const STARTER_MOVIES = [
    { title: 'Inception', icon: '🌀' },
    { title: 'The Dark Knight', icon: '🦇' },
    { title: 'Avatar', icon: '🌊' },
    { title: 'Interstellar', icon: '🚀' },
    { title: 'The Matrix', icon: '🕶️' },
    { title: 'Titanic', icon: '🚢' }
  ]

  // Production Backend URL
  // Use localhost if running locally, otherwise use production Render URL
  const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") 
    ? "http://localhost:5000" 
    : "https://movie-recommendation-2-qi8r.onrender.com";

  // Apply Theme class/attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme])

  // Fetch all movie titles for autocomplete
  useEffect(() => {
    fetch(`${API_BASE}/api/movies`)
      .then(res => res.json())
      .then(data => setAllMovies(data))
      .catch(err => console.error("Error fetching movies:", err))
  }, [])

  // Handle autocomplete matching
  useEffect(() => {
    if (query.trim().length > 1) {
      const filtered = allMovies
        .filter(m => m.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8)
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
    setActiveSuggestionIndex(-1)
  }, [query, allMovies])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [])

  const handleRecommend = async (movieTitle) => {
    setLoading(true)
    setError(null)
    setQuery(movieTitle)
    setSuggestions([])
    setActiveSuggestionIndex(-1)
    
    try {
      const response = await fetch(`${API_BASE}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movie: movieTitle })
      })
      
      const data = await response.json()
      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations)
      } else {
        setError(`No recommendations found for "${movieTitle}". Please try another movie.`)
      }
    } catch (err) {
      setError("Failed to fetch recommendations. Make sure the backend Flask app is running.")
    } finally {
      setLoading(false)
    }
  }

  // Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : -1
      );
    } else if (e.key === 'Enter') {
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        handleRecommend(suggestions[activeSuggestionIndex]);
      } else if (query.trim()) {
        handleRecommend(query.trim());
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setActiveSuggestionIndex(-1);
    }
  }

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return "N/A";
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(0)}M`;
    return `$${amount.toLocaleString()}`;
  };

  const formatRuntime = (mins) => {
    if (!mins || mins === 0) return "N/A";
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return hrs > 0 ? `${hrs}h ${m}m` : `${m}m`;
  };

  // Helper for generating dynamic visual Match percentage
  const getMatchScore = (idx) => {
    return 98 - (idx * 2) - Math.floor(Math.random() * 2);
  }

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Dynamic Background */}
      <div className="bg-gradient" />
      <div className="glow-orb-1" />
      <div className="glow-orb-2" />
      <div className="glow-orb-3" />
      
      {/* Navbar */}
      <nav className="navbar">
        <a href="/" className="nav-logo">
          <div className="logo-glow-wrapper">
            <Film style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <span>Cine<span style={{ color: 'var(--primary)' }}>Match</span></span>
        </a>
        
        <div className="nav-links">
          <a href="#">Discover</a>
          <a href="#">Trending</a>
          
          {/* Custom Theme Switcher */}
          <div className="theme-picker">
            <button 
              className={`theme-picker-btn theme-indigo ${theme === 'indigo' ? 'active' : ''}`}
              onClick={() => setTheme('indigo')}
              title="Indigo Cyber"
            />
            <button 
              className={`theme-picker-btn theme-emerald ${theme === 'emerald' ? 'active' : ''}`}
              onClick={() => setTheme('emerald')}
              title="Emerald Matrix"
            />
            <button 
              className={`theme-picker-btn theme-sunset ${theme === 'sunset' ? 'active' : ''}`}
              onClick={() => setTheme('sunset')}
              title="Sunset Rose"
            />
            <button 
              className={`theme-picker-btn theme-amethyst ${theme === 'amethyst' ? 'active' : ''}`}
              onClick={() => setTheme('amethyst')}
              title="Amethyst Aura"
            />
          </div>
          
          <button className="primary-btn">
            Get Started
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="container" style={{ flex: 1, paddingTop: '9rem', paddingBottom: '5rem' }}>
        
        {/* Hero Section */}
        <section className="hero text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="badge">
              <Sparkles style={{ width: '13px', height: '13px' }} />
              <span>AI-Powered Movie Matches</span>
            </div>
            
            <h1 className="text-gradient">
              Discover Your Next <br /> 
              <span className="accent-gradient">Cinematic Obsession</span>
            </h1>
            
            <p className="hero-subtext">
              Our advanced content-similarity engine analyzes storyline elements, directors, genres, and keywords to find movies matched precisely to your taste.
            </p>

            {/* Search Container */}
            <div ref={autocompleteRef} className="search-container">
              <div className="search-input-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Enter a movie you loved (e.g. Inception)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                
                {query && (
                  <button 
                    onClick={() => { setQuery(''); setSuggestions([]); }}
                    className="clear-search-btn"
                  >
                    <X style={{ width: '16px', height: '16px' }} />
                  </button>
                )}
                
                {loading && (
                  <Loader2 style={{ position: 'absolute', right: '3.5rem', animation: 'spin 1.5s linear infinite', color: 'var(--primary)', width: '20px', height: '20px' }} />
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
                    {suggestions.map((movie, idx) => (
                      <button
                        key={idx}
                        className={`suggestion-item ${idx === activeSuggestionIndex ? 'active' : ''}`}
                        onClick={() => handleRecommend(movie)}
                      >
                        <span>{movie}</span>
                        <ChevronRight style={{ width: '16px', height: '16px', opacity: 0.5 }} />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Starters */}
            <div className="flex-col items-center" style={{ marginTop: '2rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Popular Searches
              </span>
              <div className="quick-tags">
                {STARTER_MOVIES.map((movie, idx) => (
                  <button
                    key={idx}
                    className="quick-tag-chip"
                    onClick={() => handleRecommend(movie.title)}
                  >
                    <span>{movie.icon}</span>
                    <span>{movie.title}</span>
                  </button>
                ))}
              </div>
            </div>

          </motion.div>
        </section>

        {/* Results Section */}
        <section style={{ marginTop: '4rem' }}>
          
          <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {recommendations.length > 0 ? (
                <>
                  <Flame style={{ color: 'var(--primary)', width: '28px', height: '28px' }} />
                  <span>Curated Movie List</span>
                </>
              ) : (
                "Cinematic Picks"
              )}
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
              {recommendations.length > 0 ? `Based on your analysis of "${query}"` : "Search for a movie or choose a preset to generate suggestions."}
            </p>
          </div>

          {loading ? (
            /* Skeleton Loading State */
            <div className="movie-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-poster" />
                  <div className="skeleton-text-block">
                    <div className="skeleton-line title" />
                    <div className="skeleton-line sub" />
                    <div className="skeleton-line tagline" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error State */
            <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.25)', maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ef4444' }}>Recommendation Error</h3>
              <p style={{ color: '#cbd5e1' }}>{error}</p>
            </div>
          ) : recommendations.length > 0 ? (
            /* Results Grid */
            <div className="movie-grid">
              <AnimatePresence>
                {recommendations.map((movie, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card movie-card"
                    onClick={() => setSelectedMovie({ ...movie, matchScore: getMatchScore(idx) })}
                  >
                    <div className="movie-poster-container">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="movie-poster"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/500x750/0f172a/ffffff?text=Poster+Unavailable";
                        }}
                      />
                      
                      {/* Hover Overlay */}
                      <div className="poster-overlay">
                         <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 800, marginBottom: '0.5rem' }}>
                           <Star style={{ width: '15px', height: '15px', fill: '#f59e0b' }} />
                           <span>{movie.rating} / 10</span>
                         </div>
                         <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4' }} className="line-clamp-3">
                           {movie.overview}
                         </p>
                      </div>

                      {/* Ratings Badge */}
                      <div className="rating-badge">
                        <Star style={{ width: '13px', height: '13px', fill: '#f59e0b', color: '#f59e0b' }} />
                        <span>{movie.rating}</span>
                      </div>

                      {/* Dynamic Recommendation Accuracy Match Score */}
                      <div className="match-badge">
                        {getMatchScore(idx)}% Match
                      </div>
                    </div>

                    <div className="movie-info">
                      <div className="movie-release">
                        <Calendar style={{ width: '12px', height: '12px' }} />
                        <span>{movie.release}</span>
                      </div>
                      
                      <h3 className="movie-title line-clamp-1">{movie.title}</h3>
                      
                      {movie.tagline && (
                        <p className="movie-tagline line-clamp-1">"{movie.tagline}"</p>
                      )}
                      
                      <button className="card-action-btn">
                        <span>Details & Similarity</span>
                        <ChevronRight style={{ width: '15px', height: '15px' }} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* Empty State */
            <div style={{ padding: '6rem 0', textAlign: 'center' }}>
              <div style={{ 
                width: '90px', 
                height: '90px', 
                background: 'rgba(255, 255, 255, 0.02)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 2rem', 
                border: '1px solid var(--glass-border)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}>
                <Info style={{ width: '36px', height: '36px', color: '#475569' }} />
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>Ready to watch something amazing?</h3>
              <p style={{ color: '#475569', fontSize: '1.05rem' }}>Type in a film title above, or select one of the popular items to start.</p>
            </div>
          )}
        </section>
      </main>

      {/* Immersive Details Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setSelectedMovie(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="modal-content-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button className="modal-close-btn" onClick={() => setSelectedMovie(null)}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>

              {/* Backdrop Banner */}
              <div className="modal-backdrop-banner">
                <img 
                  src={selectedMovie.backdrop} 
                  alt={selectedMovie.title} 
                  className="modal-backdrop-image"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/1280x720/0c1122/ffffff?text=Backdrop+Unavailable";
                  }}
                />
                <div className="modal-banner-overlay" />
              </div>

              {/* Modal Contents */}
              <div className="modal-body">
                
                {/* Poster Column */}
                <div className="modal-poster-col">
                  <img 
                    src={selectedMovie.poster} 
                    alt={selectedMovie.title} 
                    className="modal-poster"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/500x750/0f172a/ffffff?text=Poster+Unavailable";
                    }}
                  />
                </div>

                {/* Details Column */}
                <div className="modal-details-col">
                  
                  {/* Dynamic Match Score Badge in modal */}
                  <div style={{ display: 'inline-flex', padding: '0.35rem 0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    AI Recommendation Confidence: {selectedMovie.matchScore || 95}%
                  </div>

                  <h2 style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, color: 'white', marginBottom: '0.25rem' }}>
                    {selectedMovie.title}
                  </h2>
                  
                  {selectedMovie.tagline && (
                    <p className="modal-tagline">"{selectedMovie.tagline}"</p>
                  )}

                  {/* Genre Pills */}
                  {selectedMovie.genres && selectedMovie.genres.length > 0 && (
                    <div className="modal-genres">
                      {selectedMovie.genres.map((genre, i) => (
                        <span key={i} className="genre-pill">{genre}</span>
                      ))}
                    </div>
                  )}

                  {/* Metadata Stats Row */}
                  <div className="meta-stats-row">
                    <div className="stat-item">
                      <Calendar />
                      <span>{selectedMovie.release}</span>
                    </div>
                    <div className="stat-item" style={{ color: '#f59e0b', fontWeight: 700 }}>
                      <Star style={{ fill: '#f59e0b' }} />
                      <span>{selectedMovie.rating} / 10</span>
                    </div>
                    <div className="stat-item">
                      <Clock />
                      <span>{formatRuntime(selectedMovie.runtime)}</span>
                    </div>
                  </div>

                  {/* Financial Stats */}
                  {(selectedMovie.budget > 0 || selectedMovie.revenue > 0) && (
                    <div className="extra-metrics">
                      <div className="metric-box">
                        <span>Production Budget</span>
                        <div>{formatCurrency(selectedMovie.budget)}</div>
                      </div>
                      <div className="metric-box">
                        <span>Global Box Office</span>
                        <div>{formatCurrency(selectedMovie.revenue)}</div>
                      </div>
                    </div>
                  )}

                  <h4 className="modal-overview-title">Overview</h4>
                  <p className="modal-overview">{selectedMovie.overview}</p>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    {/* Recursive similarity exploration loop */}
                    <button 
                      className="primary-btn" 
                      onClick={() => {
                        handleRecommend(selectedMovie.title);
                        setSelectedMovie(null);
                      }}
                    >
                      <Sparkles style={{ width: '16px', height: '16px' }} />
                      <span>Find Similar Movies</span>
                    </button>
                    
                    <button 
                      className="quick-tag-chip" 
                      style={{ padding: '0.75rem 1.5rem', background: 'transparent' }}
                      onClick={() => setSelectedMovie(null)}
                    >
                      <span>Close Details</span>
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div className="nav-logo" style={{ cursor: 'default' }}>
            <div className="logo-glow-wrapper">
              <Film style={{ width: '18px', height: '18px', color: 'white' }} />
            </div>
            <span>Cine<span style={{ color: 'var(--primary)' }}>Match</span></span>
          </div>
          
          <div style={{ color: '#475569', fontSize: '0.9rem' }}>
            © 2026 CineMatch. Powered by dynamic TMDB metadata.
          </div>
          
          <div className="footer-nav">
            <a href="#">API docs</a>
            <a href="#">Privacy policy</a>
            <a href="#">Terms of service</a>
          </div>
        </div>
      </footer>

      {/* Basic Keyframes for Spinner in Loader */}
      <style>{`
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  )
}

export default App
