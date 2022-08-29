import { useState } from 'react';
import { useQuery, useApolloClient, useSubscription } from '@apollo/client';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import Notify from './components/Notify';
import LoginForm from './components/LoginForm';
import Recommend from './components/Recommend';

import { ALL_AUTHORS, ALL_BOOKS, ME, BOOK_ADDED } from './queries';

export const updateCache = (cache, query, addedBook) => {
  const uniqById = (a) => {
    let seen = new Set();
    return a.filter((item) => {
      let k = item.id;
      return seen.has(k) ? false : seen.add(k);
    });
  };
  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqById(allBooks.concat(addedBook))
    };
  });
};

const App = () => {
  const resultAuthors = useQuery(ALL_AUTHORS);
  const resultBooks = useQuery(ALL_BOOKS);
  const currentUser = useQuery(ME);

  const [token, setToken] = useState(null);
  const client = useApolloClient();

  const [page, setPage] = useState('authors');
  const [errorMessage, setErrorMessage] = useState(null);

  console.log('resultBook: ', resultBooks);

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded;
      window.alert(`${addedBook.title} added`);

      updateCache(client.cache, { query: ALL_BOOKS }, addedBook);
    }
  });

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };

  if (resultAuthors.loading || resultBooks.loading) {
    return <div>loading...</div>;
  }

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  if (!token) {
    return (
      <>
        <Notify errorMessage={errorMessage} />
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('login')}>login</button>
        </div>
        <Authors
          show={page === 'authors'}
          resultAuthors={resultAuthors}
          setError={notify}
          token={token}
        />
        <Books show={page === 'books'} resultBooks={resultBooks} />
        <LoginForm
          show={page === 'login'}
          setToken={setToken}
          setError={notify}
          setPage={setPage}
        />
      </>
    );
  }

  return (
    <div>
      <Notify errorMessage={errorMessage} />
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('recommend')}>recommend</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => logout()}>logout</button>
      </div>
      <Authors
        show={page === 'authors'}
        resultAuthors={resultAuthors}
        token={token}
        setError={notify}
      />
      <Books show={page === 'books'} resultBooks={resultBooks} />
      <Recommend
        show={page === 'recommend'}
        resultBooks={resultBooks}
        resultUser={currentUser}
      />
      <NewBook show={page === 'add'} setError={notify} />
    </div>
  );
};

export default App;
