const readline = require('readline');
const chalk = require('chalk');
const api = require('./api');
const formatter = require('./formatter');
const configManager = require('./config-manager');
const { competitions } = require('./config');

class InteractiveMode {
  constructor() {
    this.currentLeagueIndex = 0; // Start with first league
    this.currentViewIndex = 0; // Start with Table
    this.currentMenuLevel = 0; // 0 = leagues, 1 = views
    this.leagues = competitions.map(c => c.name);
    this.views = ['Table', 'Fixtures', 'Results'];
    this.cachedData = {};
    this.rawContentCache = {}; // Store raw content separately
    this.isActive = false;
    this.loading = false;
  }

  async start() {
    this.isActive = true;

    // Setup readline for key capture
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    // Initial display
    console.clear();
    await this.displayContent();

    // Set up key handlers
    process.stdin.on('keypress', this.handleKeypress.bind(this));

    // Handle exit
    process.on('SIGINT', () => {
      this.exit();
    });
  }

  handleKeypress(chunk, key) {
    if (!this.isActive || this.loading) return;

    if (key) {
      switch (key.name) {
        case 'h': // Move left
          if (this.currentMenuLevel === 0) {
            this.navigateLeague(-1);
          } else {
            this.navigateView(-1);
          }
          break;
        case 'l': // Move right
          if (this.currentMenuLevel === 0) {
            this.navigateLeague(1);
          } else {
            this.navigateView(1);
          }
          break;
        case 'j': // Move down (switch menu level or navigate)
          if (this.currentMenuLevel === 0) {
            this.currentMenuLevel = 1; // Switch to views menu
            this.updateHighlightingOnly();
          } else {
            this.navigateView(1);
          }
          break;
        case 'k': // Move up (switch menu level or navigate)
          if (this.currentMenuLevel === 1) {
            this.currentMenuLevel = 0; // Switch to leagues menu
            this.updateHighlightingOnly();
          } else {
            this.navigateView(-1);
          }
          break;
        case 'r': // Refresh current data
          this.refreshContent();
          break;
        case 'q': // Quit
        case 'escape':
          this.exit();
          break;
        case 'return': // Enter - refresh/select
          this.refreshContent();
          break;
        case 'tab': // Tab through views
          this.navigateView(1);
          break;
        case '?': // Show help
          this.toggleHelp();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          this.goToLeagueByNumber(parseInt(key.name));
          break;
      }

    }
  }


  updateDisplayOnly() {
    const league = this.leagues[this.currentLeagueIndex];
    const view = this.views[this.currentViewIndex];
    const cacheKey = this.getCacheKey();

    if (this.rawContentCache[cacheKey]) {
      // Use cached raw content and regenerate with current selection
      const rawContent = this.rawContentCache[cacheKey];
      const newDisplay = formatter.formatInteractiveContent(
        league,
        view,
        rawContent,
        this.leagues,
        this.views,
        this.currentLeagueIndex,
        this.currentViewIndex,
        this.currentMenuLevel,
        -1
      );

      // Update the main cache with new display
      this.cachedData[cacheKey] = newDisplay;

      console.clear();
      console.log(newDisplay);
    } else {
      // If no cached data, show loading and then load
      this.displayContent();
    }
  }



  async navigateLeague(direction) {
    this.currentLeagueIndex += direction;
    if (this.currentLeagueIndex < 0) {
      this.currentLeagueIndex = this.leagues.length - 1;
    } else if (this.currentLeagueIndex >= this.leagues.length) {
      this.currentLeagueIndex = 0;
    }

    // Update highlighting immediately
    this.updateHighlightingOnly();
    // Then load content
    await this.displayContent();
  }

  async navigateView(direction) {
    this.currentViewIndex += direction;
    if (this.currentViewIndex < 0) {
      this.currentViewIndex = this.views.length - 1;
    } else if (this.currentViewIndex >= this.views.length) {
      this.currentViewIndex = 0;
    }

    // Update highlighting immediately
    this.updateHighlightingOnly();
    // Then load content
    await this.displayContent();
  }


  async goToLeagueByNumber(number) {
    if (number >= 1 && number <= competitions.length) {
      this.currentLeagueIndex = number - 1; // number corresponds to league index (1-6), adjust for 0-based indexing
      this.updateHighlightingOnly();
      await this.displayContent();
    }
  }

  async refreshContent() {
    const cacheKey = this.getCacheKey();
    delete this.cachedData[cacheKey];
    delete this.rawContentCache[cacheKey];
    await this.displayContent();
  }

  getCacheKey() {
    const league = this.leagues[this.currentLeagueIndex];
    const view = this.views[this.currentViewIndex];
    return `${league}-${view}`;
  }

  updateHighlightingOnly() {
    if (this.loading) return;

    const league = this.leagues[this.currentLeagueIndex];
    const view = this.views[this.currentViewIndex];

    console.clear();

    // Show tabs with updated highlighting but keep existing content
    const highlightingDisplay = formatter.formatInteractiveContent(
      league,
      view,
      'Loading...',
      this.leagues,
      this.views,
      this.currentLeagueIndex,
      this.currentViewIndex,
      this.currentMenuLevel,
      this.tableMode ? this.selectedRowIndex : -1
    );

    console.log(highlightingDisplay);
  }

  async displayContent() {
    if (this.loading) return;

    console.clear();
    this.loading = true;

    const league = this.leagues[this.currentLeagueIndex];
    const view = this.views[this.currentViewIndex];
    const cacheKey = this.getCacheKey();

    try {
      // Show loading message
      console.log(formatter.formatInteractiveContent(
        league,
        view,
        'Loading...',
        this.leagues,
        this.views,
        this.currentLeagueIndex,
        this.currentViewIndex,
        this.currentMenuLevel,
        -1
      ));

      // Check cache first
      if (this.cachedData[cacheKey]) {
        console.clear();
        console.log(this.cachedData[cacheKey]);
        this.loading = false;
        return;
      }

      let content = '';

      if (view === 'Table') {
        content = await this.getStandingsContent(league);
      } else if (view === 'Fixtures') {
        content = await this.getFixturesContent(league);
      } else if (view === 'Results') {
        content = await this.getResultsContent(league);
      }

      // Cache the content
      this.cachedData[cacheKey] = content;

      console.clear();
      console.log(content);
    } catch (error) {
      console.clear();
      console.log(formatter.formatInteractiveContent(
        league,
        view,
        `Error: ${error.message}`,
        this.leagues,
        this.views,
        this.currentLeagueIndex,
        this.currentViewIndex,
        this.currentMenuLevel,
        -1
      ));
    }

    this.loading = false;
  }

  async getStandingsContent(league) {

    const competition = api.getCompetitionByName(league);
    if (!competition) {
      throw new Error(`League "${league}" not found`);
    }

    const standings = await api.fetchStandings(competition.compId);

    // Calculate frame width to match formatInteractiveContent
    const maxLeagueNameLength = Math.max(...this.leagues.map(l => l.length));
    const tabWidth = Math.max(12, maxLeagueNameLength + 2);
    const totalWidth = Math.max(110, this.leagues.length * (tabWidth + 1) + 10);

    const formattedStandings = formatter.formatStandingsInteractive(standings, totalWidth);

    // Cache the raw content for future scroll operations
    const cacheKey = `${league}-Table`;
    this.rawContentCache[cacheKey] = formattedStandings;

    return formatter.formatInteractiveContent(
      league,
      'Table',
      formattedStandings,
      this.leagues,
      this.views,
      this.currentLeagueIndex,
      this.currentViewIndex,
      this.currentMenuLevel,
      this.tableMode ? this.selectedRowIndex : -1
    );
  }

  async getFixturesContent(league) {
    const competition = api.getCompetitionByName(league);
    if (!competition) {
      throw new Error(`League "${league}" not found`);
    }
    const games = await api.fetchFixtures(competition.compId);

    // Filter to next 7 days
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const filteredGames = games.filter(game => {
      const gameTime = new Date(game.startTime);
      return gameTime >= now && gameTime <= weekFromNow;
    });

    filteredGames.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    const formattedFixtures = formatter.formatFixturesInteractive(filteredGames);

    // Cache the raw content for future scroll operations
    const cacheKey = `${league}-Fixtures`;
    this.rawContentCache[cacheKey] = formattedFixtures;

    return formatter.formatInteractiveContent(
      league,
      'Fixtures',
      formattedFixtures,
      this.leagues,
      this.views,
      this.currentLeagueIndex,
      this.currentViewIndex,
      this.currentMenuLevel,
      -1
    );
  }

  async getResultsContent(league) {
    const competition = api.getCompetitionByName(league);
    if (!competition) {
      throw new Error(`League "${league}" not found`);
    }
    const games = await api.fetchResults(competition.compId);

    // Filter to last 7 days
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const filteredGames = games.filter(game => {
      const gameTime = new Date(game.startTime);
      return gameTime >= weekAgo && gameTime <= now;
    });

    filteredGames.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    const formattedResults = formatter.formatResultsInteractive(filteredGames);

    // Cache the raw content for future scroll operations
    const cacheKey = `${league}-Results`;
    this.rawContentCache[cacheKey] = formattedResults;

    return formatter.formatInteractiveContent(
      league,
      'Results',
      formattedResults,
      this.leagues,
      this.views,
      this.currentLeagueIndex,
      this.currentViewIndex,
      this.currentMenuLevel,
      -1
    );
  }

  showHelp() {
    // Navigation is now always visible at bottom, no need to show it separately
  }

  toggleHelp() {
    console.log(chalk.cyan('\n━━━ VIM NAVIGATION HELP ━━━'));
    console.log(chalk.white('Navigation:'));
    console.log('  h/l         Move horizontally (leagues or views)');
    console.log('  j/k         Move vertically (between menu bars)');
    console.log('  1-6         Jump to league by number');
    console.log('');
    console.log(chalk.white('Menu Levels:'));
    console.log('  Top bar     Leagues (EPL, La Liga, Serie A, etc.)');
    console.log('  Bottom bar  Views (Table, Fixtures, Results)');
    console.log('  j/k         Switch between menu bars');
    console.log('  h/l         Navigate within current menu bar');
    console.log('');
    console.log(chalk.white('Actions:'));
    console.log('  r / Enter   Refresh current data');
    console.log('  q / Esc     Quit interactive mode');
    console.log('  ?           Toggle this help');
    console.log('');
    console.log(chalk.dim('Press any key to continue...'));

    process.stdin.once('keypress', () => {
      this.displayContent();
    });
  }

  exit() {
    this.isActive = false;
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    console.clear();
    console.log(chalk.green('✨ Thanks for using Football Track CLI!'));
    process.exit(0);
  }
}

module.exports = InteractiveMode;