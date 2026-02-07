const User = require("../models/User");

const DEFAULT_LEADERBOARD_USERS = [
  { name: "Aarav", points: 92 },
  { name: "Diya", points: 88 },
  { name: "Rohan", points: 84 },
  { name: "Meera", points: 79 },
  { name: "Kabir", points: 73 },
  { name: "Isha", points: 68 },
  { name: "Nikhil", points: 61 },
  { name: "Ananya", points: 57 },
];

const seedLeaderboardUsers = async () => {
  const ops = DEFAULT_LEADERBOARD_USERS.map((u) => ({
    updateOne: {
      filter: { name: u.name },
      update: {
        $setOnInsert: {
          name: u.name,
          points: u.points,
          avatar: "",
          isVerified: false,
          passwordHash: "",
        },
      },
      upsert: true,
    },
  }));

  if (ops.length > 0) {
    await User.bulkWrite(ops, { ordered: false });
  }
};

module.exports = seedLeaderboardUsers;
