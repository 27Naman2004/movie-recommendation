document.addEventListener("DOMContentLoaded", function () {
  const movieSearch = document.getElementById("movieSearch");
  const autocompleteList = document.getElementById("autocompleteList");
  const selectedMovie = document.getElementById("selectedMovie");
  const recommendBtn = document.getElementById("recommendBtn");
  const loader = document.getElementById("loader");
  const recommendationsSection = document.getElementById(
    "recommendationsSection"
  );
  const moviesGrid = document.getElementById("moviesGrid");
  const errorMessage = document.getElementById("errorMessage");

  let moviesList = [];
  let currentTimeout = null;

  // Fetch movie list from backend
  fetch("/movies")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }
      return response.json();
    })
    .then((movies) => {
      moviesList = movies;
    })
    .catch((error) => {
      console.error("Error fetching movies:", error);
      showError("Failed to load movie database. Please refresh the page.");
    });

  // Autocomplete functionality
  movieSearch.addEventListener("input", function () {
    const value = this.value.toLowerCase();

    // Clear previous timeout
    if (currentTimeout) {
      clearTimeout(currentTimeout);
    }

    // Hide autocomplete if input is empty
    if (!value) {
      autocompleteList.innerHTML = "";
      autocompleteList.style.display = "none";
      selectedMovie.textContent = "Select a movie to get started";
      return;
    }

    // Show loading in autocomplete
    autocompleteList.innerHTML =
      '<div class="autocomplete-item">Loading...</div>';
    autocompleteList.style.display = "block";

    // Debounce the search
    currentTimeout = setTimeout(() => {
      const filteredMovies = moviesList
        .filter((movie) => movie.toLowerCase().includes(value))
        .slice(0, 10); // Limit to 10 results

      autocompleteList.innerHTML = "";

      if (filteredMovies.length === 0) {
        autocompleteList.innerHTML =
          '<div class="autocomplete-item">No movies found</div>';
      } else {
        filteredMovies.forEach((movie) => {
          const item = document.createElement("div");
          item.className = "autocomplete-item";
          item.textContent = movie;
          item.addEventListener("click", () => {
            movieSearch.value = movie;
            selectedMovie.textContent = `Selected: ${movie}`;
            autocompleteList.innerHTML = "";
            autocompleteList.style.display = "none";
          });
          autocompleteList.appendChild(item);
        });
      }
    }, 300);
  });

  // Hide autocomplete when clicking outside
  document.addEventListener("click", function (e) {
    if (
      !movieSearch.contains(e.target) &&
      !autocompleteList.contains(e.target)
    ) {
      autocompleteList.style.display = "none";
    }
  });

  // Update selected movie text when user types
  movieSearch.addEventListener("change", function () {
    if (this.value) {
      selectedMovie.textContent = `Selected: ${this.value}`;
    } else {
      selectedMovie.textContent = "Select a movie to get started";
    }
  });

  // Handle recommendation request
  recommendBtn.addEventListener("click", function () {
    const movie = movieSearch.value;

    if (!movie) {
      showError("Please select a movie first");
      return;
    }

    if (!moviesList.includes(movie)) {
      showError("Movie not found in our database. Please try another one.");
      return;
    }

    // Hide previous errors and results
    errorMessage.style.display = "none";
    recommendationsSection.style.display = "none";

    // Show loader, disable button
    loader.style.display = "block";
    recommendBtn.disabled = true;

    // Fetch recommendations
    fetch("/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ movie: movie }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Server error");
        }
        return response.json();
      })
      .then((data) => {
        if (data.recommendations && data.recommendations.length > 0) {
          displayRecommendations(data.recommendations);
        } else {
          showError("No recommendations found. Please try another movie.");
        }
      })
      .catch((error) => {
        console.error("Error fetching recommendations:", error);
        showError("Error fetching recommendations. Please try again.");
      })
      .finally(() => {
        loader.style.display = "none";
        recommendBtn.disabled = false;
      });
  });

  // Display recommendations
  function displayRecommendations(recommendations) {
    moviesGrid.innerHTML = "";

    recommendations.forEach((movie) => {
      const movieCard = document.createElement("div");
      movieCard.className = "movie-card";

      const ratingDisplay =
        movie.rating !== "N/A"
          ? `<span class="rating-badge">⭐ ${movie.rating}</span>`
          : "⭐ N/A";

      movieCard.innerHTML = `
                        <img class="movie-poster" src="${movie.poster}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/300x450/2c5364/ffffff?text=No+Image'">
                        <p class="movie-title">${movie.title}</p>
                        <p class="movie-meta">${ratingDisplay} | 📅 ${movie.release}</p>
                        <p class="movie-tagline">"${movie.tagline}"</p>
                    `;

      moviesGrid.appendChild(movieCard);
    });

    recommendationsSection.style.display = "block";
  }

  // Show error message
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }
});
