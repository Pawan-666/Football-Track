# Football Track CLI

An interactive command-line interface tool to track football fixtures, results, and standings for top leagues including Premier League, Champions League, La Liga, Serie A, Ligue 1, and Bundesliga.

## Features

- 🎮 **Interactive Mode**: Vim-style navigation with instant feedback
- 📊 **League Tables**: View current standings and team positions
- 📅 **Fixtures**: Browse upcoming matches for the next 7 days
- 📊 **Results**: Check recent match results from the last 7 days
- 🎨 **Beautiful Interface**: Color-coded display with responsive navigation
- ⚙️ **Real-time Data**: Live updates from sports APIs

## Installation

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Option 1: Global System Installation (Recommended)

Install globally to use `football-track` from any directory:

```bash
# Clone the repository
git clone <repository-url>
cd Football-Track

# Install dependencies
npm install

# Make binary executable
chmod +x bin/football-track

# Install globally (requires sudo on Linux/macOS)
sudo npm install -g .
```

After global installation, you can run the application from anywhere:
```bash
football-track
```

### Option 2: Local Installation

For development or local use only:

```bash
# Clone and setup
git clone <repository-url>
cd Football-Track
npm install
chmod +x bin/football-track

# Run directly from project directory
./bin/football-track

# Or use npm link for local global access
npm link
```

### Option 3: Direct Installation from npm (if published)

```bash
# Install globally from npm registry
npm install -g football-track-cli

# Run from anywhere
football-track
```

### Uninstalling

To remove the global installation:
```bash
# Uninstall globally
sudo npm uninstall -g football-track-cli
# or if installed from source
sudo npm uninstall -g .
```

For local installations, simply delete the project directory.

## Usage

Simply run the command to start the interactive interface:

```bash
# Start interactive mode (default behavior)
football-track
```

Additional options:
```bash
# Show help
football-track --help

# Show version
football-track --version
```

The application launches directly into interactive mode - no additional flags needed!

## Interactive Navigation

The application launches directly into interactive mode with vim-style navigation:

### Menu Structure
- **Top Bar**: League selection (EPL, La Liga, Serie A, Ligue 1, Bundesliga, UCL)
- **Bottom Bar**: View selection (Table, Fixtures, Results)

### Navigation Keys

| Key | Action |
|-----|---------|
| `h/l` | Move horizontally (leagues or views) |
| `j/k` | Move vertically (between menu bars) |
| `1-6` | Jump directly to league by number |
| `r` / `Enter` | Refresh current data |
| `q` / `Esc` | Quit application |
| `?` | Toggle help screen |

### Menu Levels
1. **Leagues Menu** (Top): Navigate between different competitions
2. **Views Menu** (Bottom): Switch between Table/Fixtures/Results

### Available Views

#### Table View
- Current league standings
- Team positions, points, games played
- Win/draw/loss statistics

#### Fixtures View
- Upcoming matches for the next 7 days
- Match times and team matchups
- Grouped by date for easy browsing

#### Results View
- Recent match results from the last 7 days
- Final scores and match details
- Sorted by most recent first

## Available Leagues

- **EPL** - Premier League (England)
- **La Liga** - La Liga (Spain)
- **Serie A** - Serie A (Italy)
- **Ligue 1** - Ligue 1 (France)
- **Bundesliga** - Bundesliga (Germany)
- **UCL** - UEFA Champions League

## Examples

```bash
# Launch interactive mode (default behavior)
football-track

# Show help information
football-track --help

# Check version
football-track --version
```

### Navigation Examples
Once in interactive mode:
- Press `1` to jump to EPL (default)
- Press `2` to jump to La Liga
- Press `6` to jump to UCL
- Press `j` to move to the views menu
- Press `l` to switch to Fixtures view
- Press `r` to refresh data
- Press `?` to see help
- Press `q` to quit

## Configuration

The CLI stores cached data in `~/.config/football-track/`:
- `config.json` - Application settings
- `teams.json` - Cached team data for faster lookups

## Data Source

Data is fetched from 365scores.com API, providing real-time information for:
- Match fixtures and results
- Live scores and match status
- League standings and statistics
- Team information

## Development

### Project Structure
```
├── bin/football-track          # CLI entry point
├── src/
│   ├── api.js                  # API client for 365scores
│   ├── config.js               # Competition configurations
│   ├── config-manager.js       # Settings management
│   ├── formatter.js            # Output formatting
│   ├── utils.js                # Utility functions
│   ├── interactive.js          # Interactive mode implementation
│   └── commands/
│       ├── index.js
│       └── interactive.js
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

## Original Project

This CLI tool is based on the [Football-Track GNOME Extension](https://github.com/AbhishekTimalsina/Football-Track) by AbhishekTimalsina. The original extension provides football tracking functionality for GNOME desktop environments, and this project adapts that functionality for command-line usage with an interactive vim-style interface.

---

**Enjoy tracking your favorite football leagues from the terminal! ⚽️**
