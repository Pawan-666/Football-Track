const chalk = require('chalk');
const Table = require('cli-table3');
const { formatDate, formatTime, isMatchLive, groupGamesByDate } = require('./utils');
const { competitions } = require('./config');

class Formatter {
  formatLeagueTabs(activeLeague = null, showFavorites = false) {
    const allLeagues = showFavorites ? ['Favourites', ...competitions.map(c => c.name)] : competitions.map(c => c.name);
    const maxLeagueNameLength = Math.max(...allLeagues.map(l => l.length));
    const tabWidth = Math.max(12, maxLeagueNameLength + 2);
    const totalWidth = Math.max(90, allLeagues.length * (tabWidth + 1) + 10);

    let output = '\n';

    // Top border
    output += chalk.cyan('┌' + '─'.repeat(totalWidth) + '┐\n');

    // Tabs row
    output += chalk.cyan('│ ');

    // Add Favourites tab if needed
    if (showFavorites) {
      const favTab = 'Favourites';
      const isActive = activeLeague === 'Favourites';
      const tabContent = isActive ? chalk.bgWhite.black(favTab.padEnd(tabWidth)) : favTab.padEnd(tabWidth);
      output += tabContent + ' ';
    }

    // Add league tabs
    competitions.forEach(comp => {
      const isActive = activeLeague === comp.name;
      const tabContent = isActive ? chalk.bgWhite.black(comp.name.padEnd(tabWidth)) : comp.name.padEnd(tabWidth);
      output += tabContent + ' ';
    });

    // Fill remaining space
    const usedWidth = allLeagues.length * (tabWidth + 1);
    const remainingSpace = totalWidth - usedWidth - 2;
    output += ' '.repeat(Math.max(0, remainingSpace));
    output += chalk.cyan('│\n');

    // Separator
    output += chalk.cyan('├' + '─'.repeat(totalWidth) + '┤\n');

    return output;
  }

  formatViewTabs(activeView = 'Table', totalWidth = 90) {
    const views = ['Table', 'Fixtures', 'Results'];
    let output = chalk.cyan('│ ');

    views.forEach((view, index) => {
      const isActive = activeView === view;
      const tabContent = isActive ? chalk.bgWhite.black(view.padEnd(15)) : view.padEnd(15);
      output += tabContent;
      if (index < views.length - 1) output += ' ';
    });

    // Fill remaining space
    const remainingSpace = totalWidth - (views.length * 15) - (views.length - 1) - 2;
    output += ' '.repeat(Math.max(0, remainingSpace));
    output += chalk.cyan('│\n');

    // Bottom border of tabs
    output += chalk.cyan('├' + '─'.repeat(totalWidth) + '┤\n');

    return output;
  }

  formatFixtures(games, league = null) {
    if (!games || games.length === 0) {
      return this.formatEmptyContent('No fixtures found.');
    }

    const allLeagues = ['Favourites', ...competitions.map(c => c.name)];
    const maxLeagueNameLength = Math.max(...allLeagues.map(l => l.length));
    const tabWidth = Math.max(12, maxLeagueNameLength + 2);
    const totalWidth = Math.max(90, allLeagues.length * (tabWidth + 1) + 10);

    let output = this.formatLeagueTabs(league);
    output += this.formatViewTabs('Fixtures', totalWidth);

    const groupedGames = groupGamesByDate(games);

    Object.entries(groupedGames).forEach(([date, dateGames]) => {
      output += chalk.cyan('│ ') + chalk.bold.white(date.padEnd(totalWidth - 2)) + chalk.cyan(' │\n');

      dateGames.forEach(game => {
        const homeTeam = game.homeCompetitor?.name || 'TBD';
        const awayTeam = game.awayCompetitor?.name || 'TBD';
        const time = formatTime(game.startTime);
        const isLive = isMatchLive(game.startTime);

        let matchLine = '';
        if (isLive) {
          const homeScore = game.homeCompetitor?.score || 0;
          const awayScore = game.awayCompetitor?.score || 0;
          matchLine = `🔴 ${time}  ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`;
        } else {
          matchLine = `   ${time}  ${homeTeam} vs ${awayTeam}`;
        }

        output += chalk.cyan('│ ') + matchLine.padEnd(totalWidth - 2).substring(0, totalWidth - 2) + chalk.cyan(' │\n');
      });
    });

    output += chalk.cyan('└' + '─'.repeat(totalWidth) + '┘\n');
    return output;
  }

  formatResults(games, league = null) {
    if (!games || games.length === 0) {
      return this.formatEmptyContent('No results found.');
    }

    const allLeagues = ['Favourites', ...competitions.map(c => c.name)];
    const maxLeagueNameLength = Math.max(...allLeagues.map(l => l.length));
    const tabWidth = Math.max(12, maxLeagueNameLength + 2);
    const totalWidth = Math.max(90, allLeagues.length * (tabWidth + 1) + 10);

    let output = this.formatLeagueTabs(league);
    output += this.formatViewTabs('Results', totalWidth);

    const groupedGames = groupGamesByDate(games);

    Object.entries(groupedGames).forEach(([date, dateGames]) => {
      output += chalk.cyan('│ ') + chalk.bold.white(date.padEnd(totalWidth - 2)) + chalk.cyan(' │\n');

      dateGames.forEach(game => {
        const homeTeam = game.homeCompetitor?.name || 'TBD';
        const awayTeam = game.awayCompetitor?.name || 'TBD';
        const homeScore = game.homeCompetitor?.score || 0;
        const awayScore = game.awayCompetitor?.score || 0;
        const time = formatTime(game.startTime);

        const scoreLine = `   ${time}  ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`;
        output += chalk.cyan('│ ') + scoreLine.padEnd(totalWidth - 2).substring(0, totalWidth - 2) + chalk.cyan(' │\n');
      });
    });

    output += chalk.cyan('└' + '─'.repeat(totalWidth) + '┘\n');
    return output;
  }

  formatStandings(standings, league = null) {
    if (!standings || standings.length === 0) {
      return this.formatEmptyContent('No standings found.');
    }

    const allLeagues = ['Favourites', ...competitions.map(c => c.name)];
    const maxLeagueNameLength = Math.max(...allLeagues.map(l => l.length));
    const tabWidth = Math.max(12, maxLeagueNameLength + 2);
    const totalWidth = Math.max(90, allLeagues.length * (tabWidth + 1) + 10);

    let output = this.formatLeagueTabs(league);
    output += this.formatViewTabs('Table', totalWidth);

    // Table header
    const header = `${chalk.bold('Team'.padEnd(25))} ${'P'.padStart(6)} ${'W'.padStart(6)} ${'D'.padStart(6)} ${'L'.padStart(6)} ${'Pts'.padStart(6)}`;
    output += chalk.cyan('│ ') + header.padEnd(totalWidth - 2) + chalk.cyan(' │\n');
    output += chalk.cyan('├' + '─'.repeat(totalWidth) + '┤\n');

    standings.forEach((row, index) => {
      const position = row.position;
      const team = row.competitor?.name || 'Unknown';
      const played = row.gamePlayed || 0;
      const won = row.gamesWon || 0;
      const drawn = row.gamesEven || 0;
      const lost = row.gamesLost || 0;
      const points = row.points || 0;

      // Format team name with position
      const teamDisplay = `${position}) ${team}`;
      const teamPadded = teamDisplay.length > 25 ? teamDisplay.substring(0, 25) : teamDisplay.padEnd(25);

      // Color coding for positions
      let positionColor = chalk.white;
      if (position <= 4) positionColor = chalk.green; // Champions League
      else if (position <= 6) positionColor = chalk.blue; // Europa League
      else if (position >= standings.length - 2) positionColor = chalk.red; // Relegation

      const rowContent = `${positionColor(teamPadded)} ${String(played).padStart(6)} ${String(won).padStart(6)} ${String(drawn).padStart(6)} ${String(lost).padStart(6)} ${chalk.bold(String(points)).padStart(6)}`;
      output += chalk.cyan('│ ') + rowContent.padEnd(totalWidth - 2) + chalk.cyan(' │\n');

      // Add separator lines every 10 rows for better readability
      if ((index + 1) % 10 === 0 && index < standings.length - 1) {
        output += chalk.cyan('├' + '─'.repeat(totalWidth) + '┤\n');
      }
    });

    output += chalk.cyan('└' + '─'.repeat(totalWidth) + '┘\n');
    return output;
  }

  formatEmptyContent(message) {
    const allLeagues = ['Favourites', ...competitions.map(c => c.name)];
    const maxLeagueNameLength = Math.max(...allLeagues.map(l => l.length));
    const tabWidth = Math.max(12, maxLeagueNameLength + 2);
    const totalWidth = Math.max(90, allLeagues.length * (tabWidth + 1) + 10);

    let output = this.formatLeagueTabs();
    output += this.formatViewTabs('Table', totalWidth);
    output += chalk.cyan('│ ') + chalk.yellow(message).padEnd(totalWidth - 2) + chalk.cyan(' │\n');
    output += chalk.cyan('└' + '─'.repeat(totalWidth) + '┘\n');
    return output;
  }

  formatCompetitionsList(competitions) {
    let output = chalk.bold.cyan('Available Competitions:\n');
    competitions.forEach(comp => {
      output += `  ${chalk.cyan(comp.name)} - ${comp.displayName}\n`;
    });
    return output;
  }

  formatInteractiveContent(activeLeague, activeView, content, leagues, views, leagueIndex, viewIndex, menuLevel = 0, selectedRowIndex = -1) {
    let output = '\n';

    // Calculate dynamic width to fit all leagues properly
    const maxLeagueNameLength = Math.max(...leagues.map(l => l.length));
    const tabWidth = Math.max(12, maxLeagueNameLength + 2);
    const totalWidth = Math.max(110, leagues.length * (tabWidth + 1) + 10);

    // Top border
    output += chalk.gray('┌' + '─'.repeat(totalWidth) + '┐\n');

    // League tabs row with proper highlighting
    output += chalk.gray('│ ');

    leagues.forEach((league, index) => {
      const isSelected = index === leagueIndex;
      const isFocused = menuLevel === 0;
      const numberedLeague = `${index + 1}.${league}`;
      let tabContent = numberedLeague.padEnd(tabWidth);

      if (isSelected && isFocused) {
        // Current selection with focus - bright white background with black text
        tabContent = chalk.bgWhite.black.bold(tabContent);
      } else if (isSelected && !isFocused) {
        // Current selection without focus - cyan background
        tabContent = chalk.bgCyan.black(tabContent);
      } else {
        // All other tabs - dim text
        tabContent = chalk.dim(tabContent);
      }

      output += tabContent + ' ';
    });

    // Fill remaining space for leagues
    const usedWidth = leagues.length * (tabWidth + 1);
    const remainingSpace = totalWidth - usedWidth - 2;
    output += ' '.repeat(Math.max(0, remainingSpace));
    output += chalk.gray('│\n');

    // Separator
    output += chalk.gray('├' + '─'.repeat(totalWidth) + '┤\n');

    // View tabs row with proper highlighting
    output += chalk.gray('│ ');

    views.forEach((view, index) => {
      const isSelected = index === viewIndex;
      const isFocused = menuLevel === 1;
      let tabContent = view.padEnd(15);

      if (isSelected && isFocused) {
        // Current selection with focus - bright white background with black text
        tabContent = chalk.bgWhite.black.bold(tabContent);
      } else if (isSelected && !isFocused) {
        // Current selection without focus - cyan background
        tabContent = chalk.bgCyan.black(tabContent);
      } else {
        // All other tabs - dim text
        tabContent = chalk.dim(tabContent);
      }

      output += tabContent;
      if (index < views.length - 1) output += ' ';
    });

    // Fill remaining space for views
    const viewsUsedWidth = views.length * 15 + (views.length - 1);
    const viewsRemainingSpace = totalWidth - viewsUsedWidth - 2;
    output += ' '.repeat(Math.max(0, viewsRemainingSpace));
    output += chalk.gray('│\n');

    // Bottom border of tabs
    output += chalk.gray('├' + '─'.repeat(totalWidth) + '┤\n');

    // Content area - normal display (scroll handled at top level)
    if (typeof content === 'string') {
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        const paddedLine = line.padEnd(totalWidth - 2);

        // Highlight selected row if in table mode
        if (selectedRowIndex >= 0 && this.isDataRow(line, index) && this.getDataRowIndex(lines, index) === selectedRowIndex) {
          output += chalk.gray('│') + chalk.bgCyan.black(paddedLine) + chalk.gray('│\n');
        } else {
          output += chalk.gray('│') + paddedLine + chalk.gray('│\n');
        }
      });
    }

    // Navigation help at bottom
    output += chalk.gray('├' + '─'.repeat(totalWidth) + '┤\n');
    const navHelp = 'h/l (horizontal) • j/k (menu/vertical) • 1-6 (leagues) • r (refresh) • q (quit)';
    const paddedNavHelp = navHelp.padEnd(totalWidth - 2);
    output += chalk.gray('│') + chalk.dim(paddedNavHelp) + chalk.gray('│\n');

    // Bottom border
    output += chalk.gray('└' + '─'.repeat(totalWidth) + '┘\n');

    return output;
  }

  isDataRow(line, index) {
    // Check if this line contains team data (has a position number and team name)
    const trimmedLine = line.trim();
    return trimmedLine &&
           !line.includes('─') &&
           !line.includes('Team') &&
           !line.includes('P     W     D     L') &&
           !line.includes('Press') &&
           /^\s*\d+\)\s+/.test(trimmedLine);
  }

  getDataRowIndex(lines, lineIndex) {
    // Count how many data rows appear before and including this line
    let dataRowCount = -1;
    for (let i = 0; i <= lineIndex; i++) {
      if (this.isDataRow(lines[i], i)) {
        dataRowCount++;
      }
    }
    return dataRowCount;
  }


  formatStandingsInteractive(standings, frameWidth = null) {
    if (!standings || standings.length === 0) {
      return 'No standings found.';
    }

    let output = '';
    // Use passed frame width or calculate based on content
    const tableWidth = frameWidth ? frameWidth - 2 : 65;

    // Header with proper spacing and alignment
    const headerContent = ' ' + chalk.bold('Team'.padEnd(24)) +
                         chalk.bold('P'.padStart(6)) +
                         chalk.bold('W'.padStart(6)) +
                         chalk.bold('D'.padStart(6)) +
                         chalk.bold('L'.padStart(6)) +
                         chalk.bold('Pts'.padStart(7)); // Extra space for Pts

    output += headerContent.padEnd(tableWidth) + '\n';

    // Header separator line
    output += '─'.repeat(tableWidth) + '\n';

    standings.forEach((row, index) => {
      const position = row.position;
      const team = row.competitor?.name || 'Unknown';
      const played = row.gamePlayed || 0;
      const won = row.gamesWon || 0;
      const drawn = row.gamesEven || 0;
      const lost = row.gamesLost || 0;
      const points = row.points || 0;

      // Format team name with position
      const teamDisplay = `${position}) ${team}`;
      const teamPadded = teamDisplay.length > 25 ? teamDisplay.substring(0, 25) : teamDisplay.padEnd(25);

      // Color coding for positions
      let rowColor = chalk.white;
      if (position <= 4) rowColor = chalk.green;
      else if (position <= 6) rowColor = chalk.blue;
      else if (position >= standings.length - 2) rowColor = chalk.red;

      const coreContent = ' ' + teamPadded.substring(0, 24).padEnd(24) +
                         String(played).padStart(6) +
                         String(won).padStart(6) +
                         String(drawn).padStart(6) +
                         String(lost).padStart(6) +
                         String(points).padStart(7); // Extra space for Pts

      // Pad the entire row to match table width
      const rowText = coreContent.padEnd(tableWidth);

      output += rowColor(rowText) + '\n';
    });

    return output;
  }

  formatFixturesInteractive(games) {
    if (!games || games.length === 0) {
      return 'No fixtures found for the next 7 days.';
    }

    const { groupGamesByDate, formatTime, isMatchLive } = require('./utils');
    const groupedGames = groupGamesByDate(games);
    let output = '';

    Object.entries(groupedGames).forEach(([date, dateGames]) => {
      output += chalk.bold.white(date) + '\n';
      output += '─'.repeat(date.length) + '\n';

      dateGames.forEach(game => {
        const homeTeam = game.homeCompetitor?.name || 'TBD';
        const awayTeam = game.awayCompetitor?.name || 'TBD';
        const time = formatTime(game.startTime);
        const isLive = isMatchLive(game.startTime);

        if (isLive) {
          const homeScore = game.homeCompetitor?.score || 0;
          const awayScore = game.awayCompetitor?.score || 0;
          output += `🔴 ${time}  ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}\n`;
        } else {
          output += `   ${time}  ${homeTeam} vs ${awayTeam}\n`;
        }
      });
      output += '\n';
    });

    return output;
  }

  formatResultsInteractive(games) {
    if (!games || games.length === 0) {
      return 'No results found for the last 7 days.';
    }

    const { groupGamesByDate, formatTime } = require('./utils');
    const groupedGames = groupGamesByDate(games);
    let output = '';

    Object.entries(groupedGames).forEach(([date, dateGames]) => {
      output += chalk.bold.white(date) + '\n';
      output += '─'.repeat(date.length) + '\n';

      dateGames.forEach(game => {
        const homeTeam = game.homeCompetitor?.name || 'TBD';
        const awayTeam = game.awayCompetitor?.name || 'TBD';
        const homeScore = game.homeCompetitor?.score || 0;
        const awayScore = game.awayCompetitor?.score || 0;
        const time = formatTime(game.startTime);

        output += `   ${time}  ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}\n`;
      });
      output += '\n';
    });

    return output;
  }

  formatError(message) {
    return chalk.red(`❌ Error: ${message}`);
  }

  formatSuccess(message) {
    return chalk.green(`✅ ${message}`);
  }

  formatInfo(message) {
    return chalk.blue(`ℹ️  ${message}`);
  }

  formatWarning(message) {
    return chalk.yellow(`⚠️  ${message}`);
  }
}

module.exports = new Formatter();