const competitions = [
  {
    name: 'EPL',
    compId: 7,
    displayName: 'Premier League'
  },
  {
    name: 'La liga',
    compId: 11,
    displayName: 'La Liga'
  },
  {
    name: 'Serie A',
    compId: 17,
    displayName: 'Serie A'
  },
  {
    name: 'Ligue 1',
    compId: 35,
    displayName: 'Ligue 1'
  },
  {
    name: 'Bundesliga',
    compId: 25,
    displayName: 'Bundesliga'
  },
  {
    name: 'UCL',
    compId: 572,
    displayName: 'UEFA Champions League'
  }
];

const API_BASE_URL = 'https://webws.365scores.com/web';
const TIMEZONE = 'Asia/Kathmandu';

module.exports = {
  competitions,
  API_BASE_URL,
  TIMEZONE
};