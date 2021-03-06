const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const { User, Habit } = require("../models");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select("-__v -password").populate("habits");

        return userData;
      }

      throw new AuthenticationError("Not logged in");
    },
    habits: async () => {
      return Habit.find();
    },
    habit: async (parent, { _id }) => {
      return Habit.findOne({ _id });
    },
    users: async () => {
      return User.find().select("-__v -password").populate("habits");
    },
    user: async (parent, { username }) => {
      return User.findOne({ username }).select("-__v -password").populate("habits");
    },
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
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },
    addHabit: async (parent, args, context) => {
      if (context.user) {
        const habit = await Habit.create({ ...args, username: context.user.username });

        await User.findByIdAndUpdate({ _id: context.user._id }, { $push: { habits: habit._id } }, { new: true });

        return habit;
      }

      throw new AuthenticationError("You need to be logged in.");
    },
    addCompletedAt: async (parent, { habitId, completedAt }, context) => {
      // if (context.user) {
      //   const updatedHabit = await Habit.findOneAndUpdate({ _id: habitId }, { $push: completedAt }, { new: true, runValidator: true });

      //   return updatedHabit;
      // }

      // throw new AuthenticationError("You need to be logged in!");

      return await Habit.findOneAndUpdate({ _id: habitId }, { $push: completedAt }, { new: true, runValidator: true });
    },
    editHabitName: async (parent, { habitId, habitName }, context) => {
      if (context.user) {
        const updatedHabit = await Habit.findOneAndUpdate({ _id: habitId }, { habitName }, { new: true });

        return updatedHabit;
      }

      throw new AuthenticationError("You need to be logged in!");
      // return await Habit.findOneAndUpdate({ _id: habitId }, { habitName }, { new: true });
    },
  },
};

module.exports = resolvers;
