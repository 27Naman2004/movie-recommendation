import numpy as np
import pandas as pd
import ast
import re
import pickle
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity


def preprocess_and_train(top_k=30):
    print("Loading data...")
    movies = pd.read_csv('data/movies.csv')
    credits = pd.read_csv('data/credits.csv')

    # Merge
    movies = movies.merge(credits, on='title')
    movies = movies[['movie_id', 'title', 'overview', 'genres', 'keywords', 'cast', 'crew']]
    movies.dropna(inplace=True)

    # --- Helpers ---
    def parse_features(obj, key='name'):
        if pd.isna(obj):
            return []
        try:
            parsed = ast.literal_eval(obj)
            if isinstance(parsed, list):
                return [item[key] for item in parsed if key in item]
        except Exception:
            return []
        return []

    def get_director(obj):
        if pd.isna(obj):
            return []
        try:
            crew_list = ast.literal_eval(obj)
            for member in crew_list:
                if member.get('job') == 'Director':
                    return [member['name']]
        except Exception:
            return []
        return []

    print("Preprocessing features...")
    movies['genres'] = movies['genres'].apply(parse_features)
    movies['keywords'] = movies['keywords'].apply(parse_features)
    movies['cast'] = movies['cast'].apply(lambda x: parse_features(x)[:5])
    movies['crew'] = movies['crew'].apply(get_director)
    movies['overview'] = movies['overview'].fillna('').apply(lambda x: x.split())

    for feature in ['genres', 'keywords', 'cast', 'crew']:
        movies[feature] = movies[feature].apply(lambda x: [re.sub(r'\s+', '', str(i)) for i in x])

    # Weighted overview for more context
    movies['tags'] = movies.apply(
        lambda row: row['overview'] * 2 + row['genres'] + row['keywords'] + row['cast'] + row['crew'],
        axis=1
    )

    df = movies[['movie_id', 'title', 'tags']].copy()

    print("Processing text...")
    df['tags'] = df['tags'].apply(lambda x: " ".join(x).lower())

    ps = PorterStemmer()
    def stem_text(text):
        return " ".join([ps.stem(word) for word in text.split()])

    df['tags'] = df['tags'].apply(stem_text)

    print("Vectorizing text...")
    tfidf = TfidfVectorizer(
        max_features=3000,
        stop_words='english',
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.8
    )
    vectors = tfidf.fit_transform(df['tags'])

    print("Reducing dimensions...")
    svd = TruncatedSVD(n_components=200, random_state=42)
    reduced_vectors = svd.fit_transform(vectors)

    print("Computing top-k similarity neighbors...")
    sim_matrix = cosine_similarity(reduced_vectors).astype('float32')
    indices = np.argsort(sim_matrix, axis=1)[:, -(top_k+1):-1][:, ::-1]  # top-k per movie
    scores = np.take_along_axis(sim_matrix, indices, axis=1)

    # Store only top-k results as dict
    similarity_sparse = {
        i: list(zip(indices[i], scores[i]))
        for i in range(len(sim_matrix))
    }

    print("Saving optimized models...")
    movie_data = {
        'movie_id': df['movie_id'].values,
        'title': df['title'].values,
        'tags': df['tags'].values
    }

    pickle.dump(movie_data, open('models/movie_dict.pkl', 'wb'), protocol=4)
    pickle.dump(similarity_sparse, open('models/similarity.pkl', 'wb'), protocol=4)
    pickle.dump(tfidf, open('models/tfidf.pkl', 'wb'), protocol=4)
    pickle.dump(svd, open('models/svd.pkl', 'wb'), protocol=4)

    print("Optimized movie recommendation system ready!")
    print(f"Dataset size: {len(df)} movies")
    print(f"Stored top-{top_k} neighbors per movie (instead of full NxN).")


# --- Recommendation Function ---
def recommend(movie_title, top_n=5):
    movie_data = pickle.load(open('models/movie_dict.pkl', 'rb'))
    similarity_sparse = pickle.load(open('models/similarity.pkl', 'rb'))

    titles = movie_data['title']
    title_to_idx = {t: i for i, t in enumerate(titles)}

    if movie_title not in title_to_idx:
        return f"Movie '{movie_title}' not found!"

    idx = title_to_idx[movie_title]
    neighbors = similarity_sparse[idx][:top_n]
    recs = [titles[i] for i, _ in neighbors]
    return recs


if __name__ == "__main__":
    preprocess_and_train(top_k=30)   # build & save models
    # test
    print(recommend("The Dark Knight", top_n=5))
