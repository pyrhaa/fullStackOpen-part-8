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
    bookCount: Int
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
  Book: {
    author: async (root) => {
      const author = await Author.findOne({ _id: root.author });
      return {
        name: author.name,
        born: author.born
      };
    }
  },
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (_root, args) => {
      const { genre } = args;
      if (genre) {
        const allBooks = await Book.find({}).populate('author').exec();
        const byGenre = allBooks.filter((book) => book.genres.includes(genre));
        return byGenre;
      }
      return Book.find({}).populate('author').exec();
    },
    allAuthors: async () => {
      const authors = await Author.find({});
      return authors;
    }
  },
  Author: {
    bookCount: async (author) => {
      const authorCounted = await Author.findOne({ name: author.name });

      return authorCounted
        ? Book.collection.countDocuments({ author: { $eq: authorCounted._id } })
        : 0;
    }
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
