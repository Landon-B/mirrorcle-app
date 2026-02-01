export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const getToday = () => new Date().toISOString().split('T')[0];

export const formatDate = (isoString) => {
  if (!isoString) return 'Today';
  const date = new Date(isoString);
  return date.toLocaleDateString();
};

export const isToday = (isoString) => {
  if (!isoString) return false;
  return isoString.startsWith(getToday());
};

export const isYesterday = (isoString) => {
  if (!isoString) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isoString.startsWith(yesterday.toISOString().split('T')[0]);
};

export const getDaysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getStartOfWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek;
  return new Date(now.setDate(diff)).toISOString().split('T')[0];
};

export const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};
