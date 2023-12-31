import { useEffect, useState } from "react";
import RatingStar from "./RatingStar";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const API_KEY = "2f8badc";

const App = () => {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedID, setSelectedID] = useState(null);

  //Fetch movie data by search keyword
  useEffect(() => {
    const controller = new AbortController();

    async function fetchMovie() {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error();

        const data = await res.json();

        if (data.Response === "False") throw new Error("Movie not found.");

        setMovies(data.Search);
        setError("");
      } catch (e) {
        if (e.name !== "AbortError") {
          e.message === "Error is not a constructor"
            ? setError("Movie not found.")
            : setError(e.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }

    setSelectedID(null);
    fetchMovie();

    return () => {
      controller.abort();
    };
  }, [query]);

  return (
    <>
      <NavBar>
        <Input query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loading />}
          {error && <Error error={error} />}
          {!isLoading && !error && (
            <MovieList movies={movies} setSelectedID={setSelectedID} />
          )}
        </Box>
        <Box>
          {selectedID ? (
            <MovieDetails
              selectedID={selectedID}
              setSelectedID={setSelectedID}
              setWatched={setWatched}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchedMovieList watched={watched} setWatched={setWatched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
};

const Loading = () => {
  return <p className="loader">Loading...</p>;
};

const Error = ({ error }) => {
  return (
    <p className="error">
      <span>⛔</span>
      {error}
    </p>
  );
};

const NavBar = ({ children }) => {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
};

const Logo = () => {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
};

const Input = ({ query, setQuery }) => {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
};

const NumResults = ({ movies }) => {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
};

const Main = ({ children }) => {
  return <main className="main">{children}</main>;
};

const Box = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
};

const MovieList = ({ movies, setSelectedID }) => {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} setSelectedID={setSelectedID} />
      ))}
    </ul>
  );
};

const Movie = ({ movie, setSelectedID }) => {
  return (
    <li
      key={movie.imdbID}
      onClick={() =>
        setSelectedID((id) => (id === movie.imdbID ? null : movie.imdbID))
      }
    >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
};

const MovieDetails = ({ watched, selectedID, setSelectedID, setWatched }) => {
  const [selectedMovie, setSelectedMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedID);
  const userRated = watched.find(
    (movie) => movie.imdbID === selectedID
  )?.userRating;

  const handleWatched = () => {
    const newMovie = {
      imdbID: selectedID,
      poster: selectedMovie.Poster,
      title: selectedMovie.Title,
      imdbRating: Number(selectedMovie.imdbRating),
      year: selectedMovie.Year,
      runtime: Number(selectedMovie.Runtime.split(" ").at(0)),
      userRating,
    };

    setWatched((watched) => [...watched, newMovie]);
    setSelectedID(null);
  };

  //Fetch movie details by id
  useEffect(() => {
    async function fetchDetails() {
      setIsLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${API_KEY}&i=${selectedID}`
      );

      // if (!res.ok) throw new Error();

      const data = await res.json();
      setIsLoading(false);
      setSelectedMovie(data);
    }

    fetchDetails();
  }, [selectedID]);

  //Change page title according to selected movie
  useEffect(() => {
    if (!selectedMovie.Title) return;
    document.title = `Movie | ${selectedMovie.Title}`;

    return () => {
      document.title = "Movie Bazar";
    };
  }, [selectedMovie.Title]);

  //Close movie details on Escape keypress
  useEffect(() => {
    const callback = (e) => {
      if (e.code === "Escape") {
        setSelectedID(null);
      }
    };

    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  });

  return (
    <div className="details">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={() => setSelectedID(null)}>
              &larr;
            </button>
            <img
              src={selectedMovie.Poster}
              alt={`Poster of movie ${selectedMovie.Title}`}
            />
            <div className="details-overview">
              <h2>{selectedMovie.Title}</h2>
              <p>
                {selectedMovie.Released} &bull; {selectedMovie.Runtime}
              </p>
              <p>{selectedMovie.Genre}</p>
              <p>
                <span>⭐</span> {selectedMovie.imdbRating} IMDB rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {isWatched ? (
                <p>
                  You already rated this movie {userRated} <span>⭐</span>
                </p>
              ) : (
                <>
                  <RatingStar
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />

                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleWatched}>
                      + Add to watch list
                    </button>
                  )}
                </>
              )}
            </div>
            <p>
              <em>{selectedMovie.Plot}</em>
            </p>
            <p>Starring {selectedMovie.Actors}</p>
            <p>Directed by {selectedMovie.Director}</p>
          </section>
        </>
      )}
    </div>
  );
};

const Summary = ({ watched }) => {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
};

const WatchedMovieList = ({ watched, setWatched }) => {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          setWatched={setWatched}
        />
      ))}
    </ul>
  );
};

const WatchedMovie = ({ movie, setWatched }) => {
  const handleWatchedDelete = (id) => {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  };

  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => handleWatchedDelete(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
};

export default App;
