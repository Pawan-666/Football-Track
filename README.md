# Football Track CLI

An interactive command-line interface tool to track football fixtures, results, and standings for top leagues including Premier League, Champions League, La Liga, Serie A, Ligue 1, and Bundesliga.

~ `football-track`

<img width="1352" height="804" alt="image" src="https://github.com/user-attachments/assets/323616a8-8534-4eab-b7d4-25493dc0aecd" />


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

### Uninstalling

To remove the global installation:
```bash
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


### Navigation Keys

| Key | Action |
|-----|---------|
| `h/l` | Move horizontally (leagues or views) |
| `j/k` | Move vertically (between menu bars) |
| `1-6` | Jump directly to league by number |
| `r` / `Enter` | Refresh current data |
| `q` / `Esc` | Quit application |
| `?` | Toggle help screen |


### Available Views

#### Table View
- Current league standings
- Team positions, points, games played
- Win/draw/loss statistics

#### Fixtures View

<img width="1370" height="781" alt="image" src="https://github.com/user-attachments/assets/a3d88efb-86c5-4c90-be3d-a233d02a02be" />

- Upcoming matches for the next 7 days
- Match times and team matchups
- Grouped by date for easy browsing

#### Results View

<img width="1352" height="804" alt="image" src="https://github.com/user-attachments/assets/6bf20fab-4fdd-4023-a7ed-4986287caeee" />

- Recent match results from the last 7 days
- Final scores and match details
- Sorted by most recent first


## Data Source

Data is fetched from 365scores.com API, providing real-time information.

## License

MIT License

## Original Project

This CLI tool is based on the [Football-Track GNOME Extension](https://github.com/AbhishekTimalsina/Football-Track) by AbhishekTimalsina. The original extension provides football tracking functionality for GNOME desktop environments, and this project adapts that functionality for command-line usage with an interactive vim-style interface.

---

**Enjoy tracking your favorite football leagues from the terminal! ⚽️**
