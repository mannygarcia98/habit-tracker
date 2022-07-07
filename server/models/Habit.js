const { Schema, model } = require('mongoose');
const logSchema = require('./Log');

const habitSchema = new Schema({
  habitName: {
    type: String,
    required: 'Habit name is required.'
  },
  log: [logSchema]
});

// need to get habit streak from log the same way the reaction count counts the number of reactions.
// may need to write a function that will add to count if consecutive 'complete' days are added to database
// thoughtSchema.virtual('reactionCount').get(function() { return this.reactions.length; });

const Habit = model('Habit', habitSchema);

module.exports = Habit;
