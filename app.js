const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let db = null;

const movieDetails = (movie) => {
  return {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  };
};

const directorDetails = (name) => {
  return {
    directorId: name.director_id,
    directorName: name.director_name,
  };
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
//get
app.get("/movies/", async (request, response) => {
  const moviesQuery = `
    SELECT 
        movie_name
    FROM 
        movie;`;
  const movieList = await db.all(moviesQuery);
  response.send(movieList.map((movie) => ({ movieName: movie.movie_name })));
});
//get
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(movieDetails(movie));
});
//get
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) => {
      directorDetails(eachDirector);
    })
  );
});

//get
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const moviesQuery = `
    SELECT 
        movie_name
    FROM 
        movie
    WHERE 
        director_id = ${directorId};`;
  const moviesArray = await db.all(moviesQuery);
  response.send(
    moviesArray.map((movies) => ({
      movieName: movies.movie_name,
    }))
  );
});

//post

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES (${directorId},'${movieName}','${leadActor}');`;
  const addMovie = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//put

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
    UPDATE 
     movie 
    SET 
     director_id = ${directorId},
     movie_name = '${movieName}',
     lead_actor = '${leadActor}'
    WHERE 
     movie_id = ${movieId};`;
  const update = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//delete

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie 
    WHERE 
     movie_id = ${movieId};`;
  const deleteMovie = await db.run(deleteQuery);
  response.send("Movie Removed");
});

module.exports = app;
