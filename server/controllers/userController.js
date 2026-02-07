const User = require("../models/User");
const asyncHandler = require("../middlewares/asyncHandler");

exports.getLeaderboard = asyncHandler(async (req, res) => {
  const users = await User.find()
    .sort({ points: -1 })
    .limit(10)
    .select("name points");

  res.json(users);
});
