import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_AUTHOR, ALL_AUTHORS } from '../queries';

const Authors = ({ resultAuthors, show, setError }) => {
  const [changeName, setChangeName] = useState('');
  const [changeBorn, setChangeBorn] = useState('');

  const [updateAuthor] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  });

  const submit = async (e) => {
    e.preventDefault();
    console.log('name: ', changeName, 'born: ', changeBorn);
    await updateAuthor({
      variables: { changeName, setBornTo: parseInt(changeBorn) }
    });

    setChangeName('');
    setChangeBorn('');
  };

  if (!show) {
    return null;
  }

  if (resultAuthors.loading) {
    return <div>loading...</div>;
  }

  const authors = resultAuthors.data.allAuthors || [];

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          Name
          <input
            value={changeName}
            onChange={({ target }) => setChangeName(target.value)}
          />
        </div>
        <div>
          Born
          <input
            value={changeBorn}
            onChange={({ target }) => setChangeBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default Authors;
