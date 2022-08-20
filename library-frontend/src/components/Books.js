import React, { useState, useEffect } from 'react';

const Books = ({ show, resultBooks }) => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');

  useEffect(() => {
    if (resultBooks.data) {
      const allBooks = resultBooks.data.allBooks || [];
      setBooks(allBooks);
      let genres = ['All genres'];
      allBooks.forEach((el) => {
        el.genres.forEach((gr) => {
          if (genres.indexOf(gr) === -1) {
            genres.push(gr);
          }
        });
      });
      setGenres(genres);
      setSelectedGenre('All genres');
    }
  }, [resultBooks]);

  useEffect(() => {
    if (selectedGenre === 'All genres') {
      setFilteredBooks(books);
    } else {
      setFilteredBooks(
        books.filter((book) => book.genres.indexOf(selectedGenre) !== -1)
      );
    }
  }, [books, selectedGenre]);

  if (!show) {
    return null;
  }

  if (resultBooks.loading) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filteredBooks.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genres.length > 0 &&
          genres.map((genre) => (
            <button onClick={() => setSelectedGenre(genre)} key={genre}>
              {genre}
            </button>
          ))}
      </div>
    </div>
  );
};

export default Books;
