import { gql } from '@apollo/client';

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    author {
      name
      bookCount
      born
    }
    published
    genres
    id
  }
`;

const AUTHOR_DETAILS = gql`
  fragment authorDetails on Author {
    name
    born
    bookCount
    id
  }
`;

export const ALL_AUTHORS = gql`
  query fetchAllAuthors {
    allAuthors {
      ...authorDetails
    }
  }
  ${AUTHOR_DETAILS}
`;

export const ALL_BOOKS = gql`
  query fetchAllBooks($byAuthor: String, $byGenre: String) {
    allBooks(author: $byAuthor, genre: $byGenre) {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`;

export const ADD_BOOK = gql`
  mutation addBook(
    $title: String!
    $published: Int!
    $author: String!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
    ) {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`;

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }

  ${BOOK_DETAILS}
`;

export const UPDATE_AUTHOR = gql`
  mutation editAuthor($name: String!, $born: Int!) {
    editAuthor(name: $name, setBornTo: $born) {
      ...authorDetails
    }
  }
  ${AUTHOR_DETAILS}
`;

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

export const ME = gql`
  query {
    me {
      username
      favouriteGenre
      id
    }
  }
`;
