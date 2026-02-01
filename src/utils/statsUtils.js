export const calculateStreak = (sessions, lastSessionDate) => {
  if (!sessions || sessions.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (!lastSessionDate) return 0;

  const lastDate = lastSessionDate.split('T')[0];

  // If last session was today, count current streak
  if (lastDate === today) {
    return countConsecutiveDays(sessions);
  }

  // If last session was yesterday, streak is still active
  if (lastDate === yesterdayStr) {
    return countConsecutiveDays(sessions);
  }

  // Streak broken
  return 0;
};

const countConsecutiveDays = (sessions) => {
  if (!sessions || sessions.length === 0) return 0;

  const uniqueDates = [...new Set(sessions.map(s => s.date.split('T')[0]))].sort().reverse();

  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = new Date(uniqueDates[i]);
    const previous = new Date(uniqueDates[i + 1]);
    const diffDays = Math.floor((current - previous) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

export const aggregateFeelingsHistory = (sessions) => {
  const counts = {};
  sessions.forEach(session => {
    if (session.feeling) {
      counts[session.feeling] = (counts[session.feeling] || 0) + 1;
    }
  });
  return counts;
};

export const getSessionsInRange = (sessions, startDate) => {
  return sessions.filter(s => s.date >= startDate);
};
