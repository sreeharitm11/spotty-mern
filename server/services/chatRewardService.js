const User = require("../models/User");

const CHAT_REWARD = {
  points: 1,
  cooldownMs: 30000,
  dailyCap: 30,
  minLength: 8,
};

const todayKey = (d = new Date()) => d.toISOString().slice(0, 10);

const maybeRewardChat = async (senderName, text) => {
  const cleanText = String(text || "").trim();
  const now = new Date();
  let user = await User.findOne({ name: senderName });

  if (!user) {
    user = await User.create({
      name: senderName,
      email: undefined,
      isVerified: false,
      points: 0,
    });
  }

  const key = todayKey(now);
  if (user.chatRewardDate !== key) {
    user.chatRewardDate = key;
    user.chatRewardCount = 0;
  }

  const lastRewardAt = user.lastChatRewardAt ? new Date(user.lastChatRewardAt).getTime() : 0;
  const canRewardByLength = cleanText.length >= CHAT_REWARD.minLength;
  const canRewardByCooldown = Date.now() - lastRewardAt >= CHAT_REWARD.cooldownMs;
  const canRewardByDailyCap = (user.chatRewardCount || 0) < CHAT_REWARD.dailyCap;

  const rewarded = canRewardByLength && canRewardByCooldown && canRewardByDailyCap;
  if (rewarded) {
    user.points = Number(user.points || 0) + CHAT_REWARD.points;
    user.chatRewardCount = Number(user.chatRewardCount || 0) + 1;
    user.lastChatRewardAt = now;
    await user.save();
  } else if (user.isModified()) {
    await user.save();
  }

  return {
    rewarded,
    points: Number(user.points || 0),
    rewardMeta: {
      dailyCap: CHAT_REWARD.dailyCap,
      dailyUsed: Number(user.chatRewardCount || 0),
      cooldownMs: CHAT_REWARD.cooldownMs,
      minLength: CHAT_REWARD.minLength,
    },
  };
};

module.exports = { maybeRewardChat };
