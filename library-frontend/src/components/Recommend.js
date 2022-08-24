import { useState, useEffect } from 'react';
// import { useQuery } from '@apollo/client';
// import { ME, ALL_BOOKS} from '../queries';
import BooksTab from './BooksTab';

const Recommend = ({ show, resultUser, resultBooks }) => {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);

  useEffect(() => {
    if (resultBooks.data) {
      const allBooks = resultBooks.data.allBooks;
      setBooks(allBooks);
    }
  }, [resultBooks]);

  useEffect(() => {
    if (resultUser.data) {
      setSelectedGenre(resultUser.data.me.favouriteGenre);
    }
  }, [resultUser]);

  useEffect(() => {
    setFilteredBooks(
      books.filter((b) => b.genres.indexOf(selectedGenre) !== -1)
    );
  }, [books, selectedGenre]);

  if (!show) {
    return null;
  }

  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre patterns: <b>{selectedGenre}</b>
      </p>
      <BooksTab books={filteredBooks} />
    </div>
  );
};

export default Recommend;
