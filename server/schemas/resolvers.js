const { AuthenticationError } = require('apollo-server-express');
const { User, Habit } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('habits');

        return userData;
      }

      throw new AuthenticationError('Not logged in');
    },
    // users: async () => {
    //   return User.find().select("-__v -password").populate("thoughts").populate("friends");
    // },
    user: async (parent, { email }) => {
      return User.findOne({ email })
        .select('-__v -password')
        .populate('habits');
    },
    habits: async (parent, { email }) => {
      const params = email ? { email } : {};
      return Habit.find(params);
    },
    habit: async (parent, { _id }) => {
      return Habit.findOne({ _id });
    }
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user };
    },
    addLog: async (parent, { HabitId, reactionBody }, context) => {
      if (context.user) {
        const updatedHabit = await Habit.findOneAndUpdate(
          { _id: HabitId },
          {
            $push: {
              reactions: { reactionBody, username: context.user.username }
            }
          },
          { new: true, runValidators: true }
        );

        return updatedHabit;
      }

      throw new AuthenticationError('You need to be logged in!');
    }
    // addFriend: async (parent, { friendId }, context) => {
    //   if (context.user) {
    //     const updatedUser = await User.findOneAndUpdate({ _id: context.user._id }, { $addToSet: { friends: friendId } }, { new: true }).populate("friends");

    //     return updatedUser;
    //   }

    //   throw new AuthenticationError("You need to be logged in!");
    // },
  }
};

module.exports = resolvers;
