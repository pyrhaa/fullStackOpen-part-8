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
        const allBooks = await Book.find({ genres: { $in: genre } })
          .populate('author')
          .exec();
        const byGenre = allBooks.filter((book) => book.genres.includes(genre));
        return byGenre;
      }

      if (author) {
        const allBooks = await Book.find({ name: author })
          .populate('author')
          .exec();
        const byAuthor = allBooks.filter((book) => book.author.name === author);
        return byAuthor;
      }
      return await Book.find({}).populate('author').exec();
    },
    allAuthors: async () => {
      return Author.find({}).populate('books').exec();
    },
    me: (root, args, context) => {
      return context.currentUser;
    }
  },
  Author: {
    books: async (root) => {
      const allBooks = await Book.find({ name: root.name })
        .populate('author')
        .exec();
      const byAuthor = allBooks.filter(
        (book) => book.author.name === root.name
      );
      return byAuthor;
    },
    bookCount: async (root) => {
      const allBooks = await Book.find({ name: root.name })
        .populate('author')
        .exec();
      const booksLength = allBooks.filter(
        (book) => book.author.name === root.name
      ).length;
      return booksLength;
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
        const savedBook = await book.save();
        authObject.books = authObject.books.concat(savedBook._id);
        await authObject.save();
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
