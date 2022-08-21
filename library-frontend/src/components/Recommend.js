import { useState, useEffect } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { ME, ALL_BOOKS_BY_GENRE, ALL_BOOKS } from '../queries';
import BooksTab from './BooksTab';

const Recommend = ({ show }) => {
  const me = useQuery(ME);
  const [getFavBooks, result] = useLazyQuery(ALL_BOOKS_BY_GENRE, {
    refetchQueries: [{ query: ALL_BOOKS }],
    onError: (error) => {
      console.log(error.graphQLErrors[0].message);
    }
  });
  const [fav, setFav] = useState([]);

  useEffect(() => {
    if (me.data) {
      getFavBooks({ variables: { genre: me.data.me.favouriteGenre } });
    }
  }, [getFavBooks, me]);

  useEffect(() => {
    if (result.data) {
      setFav(result.data.allBooks);
    }
  }, [result]);

  if (!show) {
    return null;
  }
  console.log(result);
  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre patterns:{' '}
        <b>{me.data.me.favouriteGenre}</b>
      </p>
      <BooksTab books={fav} />
    </div>
  );
};

export default Recommend;
