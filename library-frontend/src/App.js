import { useState } from 'react';
import { useQuery } from '@apollo/client';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import Notify from './components/Notify';

import { ALL_AUTHORS } from './queries';

const App = () => {
  const result = useQuery(ALL_AUTHORS);
  const [page, setPage] = useState('authors');
  const [errorMessage, setErrorMessage] = useState(null);

  if (result.loading) {
    return <div>loading...</div>;
  }

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  console.log(result);

  return (
    <div>
      <Notify errorMessage={errorMessage} />
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} setError={notify} />
    </div>
  );
};

export default App;
