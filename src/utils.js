const fs = require('fs');
const path = require('path');
const os = require('os');

function getConfigDir() {
  const homeDir = os.homedir();
  const configDir = path.join(homeDir, '.config', 'football-track');

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  return configDir;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateStr = date.toLocaleDateString();
  const todayStr = today.toLocaleDateString();
  const tomorrowStr = tomorrow.toLocaleDateString();

  if (dateStr === todayStr) {
    return 'Today';
  } else if (dateStr === tomorrowStr) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function isMatchLive(startTime) {
  const now = new Date();
  const matchStart = new Date(startTime);
  const matchEnd = new Date(matchStart.getTime() + 2 * 60 * 60 * 1000); // Assume 2 hour matches

  return now >= matchStart && now <= matchEnd;
}

function groupGamesByDate(games) {
  return games.reduce((acc, game) => {
    const dateKey = formatDate(game.startTime);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(game);
    return acc;
  }, {});
}

function filterGamesByDays(games, days, backwards = false) {
  const now = new Date();
  const cutoffTime = backwards
    ? new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
    : new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

  return games.filter(game => {
    const gameTime = new Date(game.startTime);
    return backwards
      ? gameTime >= cutoffTime && gameTime <= now
      : gameTime >= now && gameTime <= cutoffTime;
  });
}

function filterTodayGames(games) {
  const today = new Date().toLocaleDateString();
  return games.filter(game => {
    return new Date(game.startTime).toLocaleDateString() === today;
  });
}

module.exports = {
  getConfigDir,
  formatDate,
  formatTime,
  isMatchLive,
  groupGamesByDate,
  filterGamesByDays,
  filterTodayGames
};