const fs = require('fs');
const path = require('path');
const { getConfigDir } = require('./utils');

class ConfigManager {
  constructor() {
    this.configDir = getConfigDir();
    this.configFile = path.join(this.configDir, 'config.json');
    this.teamsFile = path.join(this.configDir, 'teams.json');
    this.loadConfig();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        const data = fs.readFileSync(this.configFile, 'utf8');
        this.config = JSON.parse(data);
      } else {
        this.config = this.getDefaultConfig();
        this.saveConfig();
      }
    } catch (error) {
      console.error('Error loading config:', error.message);
      this.config = this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      notifications: [],
      defaultLeague: 'EPL',
      updateInterval: 30,
      timezone: 'Asia/Kathmandu'
    };
  }

  saveConfig() {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Error saving config:', error.message);
    }
  }


  getNotifications() {
    return this.config.notifications || [];
  }

  addNotification(matchId, teamA, teamB, startTime) {
    if (!this.config.notifications) {
      this.config.notifications = [];
    }

    const exists = this.config.notifications.find(n => n.id === matchId);
    if (!exists) {
      this.config.notifications.push({
        id: matchId,
        teamA,
        teamB,
        startTime
      });
      this.saveConfig();
      return true;
    }
    return false;
  }

  removeNotification(matchId) {
    if (!this.config.notifications) return false;

    const initialLength = this.config.notifications.length;
    this.config.notifications = this.config.notifications.filter(n => n.id !== matchId);

    if (this.config.notifications.length < initialLength) {
      this.saveConfig();
      return true;
    }
    return false;
  }

  getDefaultLeague() {
    return this.config.defaultLeague || 'EPL';
  }

  setDefaultLeague(league) {
    this.config.defaultLeague = league;
    this.saveConfig();
  }

  loadTeamsCache() {
    try {
      if (fs.existsSync(this.teamsFile)) {
        const data = fs.readFileSync(this.teamsFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading teams cache:', error.message);
    }
    return {};
  }

  saveTeamsCache(teams) {
    try {
      fs.writeFileSync(this.teamsFile, JSON.stringify(teams, null, 2));
    } catch (error) {
      console.error('Error saving teams cache:', error.message);
    }
  }
}

module.exports = new ConfigManager();