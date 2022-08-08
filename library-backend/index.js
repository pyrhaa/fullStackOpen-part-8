const { ApolloServer, UserInputError, gql } = require('apollo-server');
const { v1: uuid } = require('uuid');
const config = require('./utils/config');
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const mongoose = require('mongoose');
const Book = require('./models/book');
const Author = require('./models/author');

logger.info('connecting to', config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message);
  });

const typeDefs = gql`
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
  }
`;

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: (root, args) => {
      let books = await Book.find({})
      if (args.author) {
        return books.filter((book) => book.author === args.author);
      } else if (args.genre) {
        return books.filter((book) => book.genres.includes(args.genre));
      } else if (args.author && args.genre) {
        return books.filter(
          (book) =>
            book.author === args.author && book.genres.includes(args.genre)
        );
      } else {
        return books;
      }
    },
    allAuthors: () => Author.find({})
  },
  Author: {
    bookCount: (root) =>
      books.filter((book) => book.author === root.name).length
  },
  Mutation: {
    addBook: (root, args) => {
      const authExist = authors.find((a) => a.name === args.author);
      const bookExist = books.find((b) => b.title === args.title);
      if (authExist && bookExist) {
        throw new UserInputError('Book title of this author exists', {
          invalidArgs: args.title
        });
      }

      if (!authExist) {
        const newAuthor = {
          name: args.author,
          id: uuid()
        };
        authors = authors.concat(newAuthor);
      }
      const book = { ...args, id: uuid() };
      books = books.concat(book);
      return book;
    },
    editAuthor: (root, args) => {
      const authorExist = authors.find(
        (author) => author.name.toLowerCase() === args.name.toLowerCase()
      );
      if (!authorExist) {
        return null;
      }

      const updatedAuth = { ...authorExist, born: args.setBornTo };
      authors = authors.map((author) =>
        author.name.toLowerCase() === args.name.toLowerCase()
          ? updatedAuth
          : author
      );
      return updatedAuth;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
