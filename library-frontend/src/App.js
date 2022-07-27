import { useState } from 'react';
import { useQuery } from '@apollo/client';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import Notify from './components/Notify';

import { ALL_AUTHORS, ALL_BOOKS } from './queries';

const App = () => {
  const resultAuthors = useQuery(ALL_AUTHORS);
  const resultBooks = useQuery(ALL_BOOKS);

  const [page, setPage] = useState('authors');
  const [errorMessage, setErrorMessage] = useState(null);

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  return (
    <div>
      <Notify errorMessage={errorMessage} />
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors show={page === 'authors'} resultAuthors={resultAuthors} />

      <Books show={page === 'books'} resultBooks={resultBooks} />

      <NewBook show={page === 'add'} setError={notify} />
    </div>
  );
};

export default App;
