import mysql from 'mysql2/promise';
import 'dotenv/config';

const DEFAULT_CONFIG = {
  host: 'localhost',
  user: 'root',
  port: 3306,
  password: 'Soft.Ju@24',
  database: 'moviesdb',
}

const connectionString = process.env.DATABASE_URL ?? DEFAULT_CONFIG;

const connection = await mysql.createConnection(connectionString);


export class MovieModel {
  static async getAll({ genre }) {
    if (genre) {
      const loweCaseGenre = genre.toLowerCase();
      const [genres] = await connection.query(
        'SELECT id, name FROM genre WHERE LOWER(name) = ?',
        [loweCaseGenre]
      );
      if (genres.length === 0) {
        return [];
      }

      const [{ id }] = genres;
      const [movies] = await connection.query(
        `SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM movie_genres
        JOIN movie ON movie.id = movie_genres.movie_id
        WHERE genre_id = ?;`,
        [id]
      );
      return movies;
    }
    const [movies] = await connection.query(
      'SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM movie;'
    );

    return movies;

  }

  static async getById({ id }) {
    const [movies] = await connection.query(
      'SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM movie WHERE id = UUID_TO_BIN(?);',
      [id]
    );
    if (movies.length === 0) {
      return null;
    }
    return movies[0];
  }

  static async create({ input }) {
    const {
      genre: genreInput,
      title,
      year,
      duration,
      director,
      rate,
      poster
    } = input;

    const [uuidResult] = await connection.query(
      'SELECT UUID() uuid;'
    );
    const [{ uuid }] = uuidResult;
    try {
      await connection.query(
        'INSERT INTO movie (id, title, year, duration, director, rate, poster) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?);',
        [uuid, title, year, duration, director, rate, poster]
      );
    } catch (error) {
      throw new Error('Error creating movie');
    }

    const [movies] = await connection.query(
      'SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM movie WHERE id = UUID_TO_BIN(?);',
      [uuid]
    );

    return movies[0];
  }

  static async delete({ id }) {
    const [result] = await connection.query(
      'DELETE FROM movie WHERE id = UUID_TO_BIN(?);',
      [id]
    );
    if (result.affectedRows === 0) {
      return false;
    }
    return true;
  }

  static async update({ id, input }) {
    const { genre: genreInput, ...rest } = input;
    const [result] = await connection.query(
      'UPDATE movie SET ? WHERE id = UUID_TO_BIN(?);',
      [rest, id]
    );
    if (result.affectedRows === 0) {
      return null;
    }

    const [movies] = await connection.query(
      'SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM movie WHERE id = UUID_TO_BIN(?);',
      [id]
    );

    return movies[0];
  }
}