const { UserInputError, AuthenticationError } = require('apollo-server');
const Book = require('../models/book');
const Author = require('../models/author');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { v1: uuid } = require('uuid');
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

const JWT_SECRET = process.env.SECRET;

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
      const { author, genre } = args;
      if (genre) {
        const allBooks = await Book.find({}).populate('author').exec();
        const byGenre = allBooks.filter((book) => book.genres.includes(genre));
        return byGenre;
      }

      if (author) {
        const allBooks = await Book.find({}).populate('author').exec();
        const byAuthor = allBooks.filter((book) => book.author.name === author);
        return byAuthor;
      }
      return Book.find({}).populate('author').exec();
    },
    allAuthors: async () => {
      const authors = await Author.find({});
      return authors;
    },
    me: (root, args, context) => {
      return context.currentUser;
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
    addBook: async (root, args, context) => {
      const authExist = await Author.findOne({ name: args.author });
      const bookExist = await Book.findOne({ title: args.title });
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new AuthenticationError('not authenticated');
      }

      if (authExist && bookExist) {
        throw new UserInputError('Book title of this author exists', {
          invalidArgs: args.title
        });
      }

      if (!authExist) {
        const newAuthor = new Author({
          name: args.author,
          id: uuid()
        });
        try {
          await newAuthor.save();
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args
          });
        }
      }
      const authObject = await Author.findOne({ name: args.author });
      const book = new Book({ ...args, author: authObject, id: uuid() });
      try {
        await book.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        });
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: book });

      return book;
    },
    editAuthor: async (root, args, context) => {
      const authExist = await Author.findOne({ name: args.name });
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new AuthenticationError('not authenticated');
      }

      if (!authExist) {
        return null;
      }
      authExist.born = args.setBornTo;
      try {
        await authExist.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        });
      }
      return authExist.save();
    },
    createUser: async (root, args) => {
      const { username, favouriteGenre } = args;
      const user = new User({ username, favouriteGenre });

      try {
        return user.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        });
      }
    },
    login: async (root, args) => {
      const { username, password } = args;
      const user = await User.findOne({ username });

      if (!user || password !== 'secret') {
        throw new UserInputError('wrong credentials');
      }

      const userForToken = {
        username: user.username,
        id: user._id
      };

      return { value: jwt.sign(userForToken, JWT_SECRET) };
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }
};

module.exports = resolvers;
