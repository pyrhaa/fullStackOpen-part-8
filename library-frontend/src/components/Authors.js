import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_AUTHOR, ALL_AUTHORS } from '../queries';

const Authors = ({ resultAuthors, show, setError }) => {
  const [name, setName] = useState('');
  const [changeBorn, setChangeBorn] = useState('');

  const [updateAuthor] = useMutation(UPDATE_AUTHOR);

  const born = parseInt(changeBorn);

  // console.log('allAuthors: ', resultAuthors);

  const submit = async (e) => {
    e.preventDefault();
    await updateAuthor({
      variables: { name, born },
      refetchQueries: [{ query: ALL_AUTHORS }]
    });
    setName('');
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
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <label>
          Name
          <select value={name} onChange={({ target }) => setName(target.value)}>
            {authors.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Born
          <input
            value={changeBorn}
            onChange={({ target }) => setChangeBorn(target.value)}
          />
        </label>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default Authors;
