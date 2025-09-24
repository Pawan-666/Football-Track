const axios = require('axios');
const { API_BASE_URL, TIMEZONE, competitions } = require('./config');

class FootballAPI {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000
    });
  }

  async fetchFixtures(compId) {
    try {
      const response = await this.client.get('/games/fixtures/', {
        params: {
          timezoneName: TIMEZONE,
          competitions: compId
        }
      });
      return response.data.games || [];
    } catch (error) {
      throw new Error(`Failed to fetch fixtures: ${error.message}`);
    }
  }

  async fetchResults(compId) {
    try {
      const response = await this.client.get('/games/results/', {
        params: {
          timezoneName: TIMEZONE,
          competitions: compId
        }
      });
      return response.data.games || [];
    } catch (error) {
      throw new Error(`Failed to fetch results: ${error.message}`);
    }
  }

  async fetchStandings(compId) {
    try {
      const response = await this.client.get('/standings/', {
        params: {
          timezoneName: TIMEZONE,
          competitions: compId
        }
      });
      return response.data.standings?.[0]?.rows || [];
    } catch (error) {
      throw new Error(`Failed to fetch standings: ${error.message}`);
    }
  }

  async fetchFixturesForTeams(teamIds) {
    const allFixtures = [];

    for (const teamId of teamIds) {
      try {
        const response = await this.client.get('/games/fixtures/', {
          params: {
            timezoneName: TIMEZONE,
            competitors: teamId
          }
        });
        allFixtures.push(...(response.data.games || []));
      } catch (error) {
        console.error(`Failed to fetch fixtures for team ${teamId}: ${error.message}`);
      }
    }

    return allFixtures;
  }

  async fetchResultsForTeams(teamIds) {
    const allResults = [];

    for (const teamId of teamIds) {
      try {
        const response = await this.client.get('/games/results/', {
          params: {
            timezoneName: TIMEZONE,
            competitors: teamId
          }
        });
        allResults.push(...(response.data.games || []));
      } catch (error) {
        console.error(`Failed to fetch results for team ${teamId}: ${error.message}`);
      }
    }

    return allResults;
  }

  getCompetitionByName(name) {
    if (!name) return null;
    return competitions.find(comp =>
      comp.name.toLowerCase() === name.toLowerCase() ||
      comp.displayName.toLowerCase().includes(name.toLowerCase())
    );
  }

  getAllCompetitions() {
    return competitions;
  }
}

module.exports = new FootballAPI();