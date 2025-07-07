# Lacrosse Stats Tracker

A web application for tracking lacrosse team and player statistics, as well as managing game schedules and events.

## Features

### Team Statistics
- Record and track game results
- View team performance metrics (wins, losses, goals for/against)
- Track offensive and defensive team statistics
- Visualize win percentage and other key metrics

### Player Statistics
- Manage player roster with positions
- Record individual player performance in games
- Track key statistics like goals, assists, ground balls, etc.
- View player performance across all games or filter by specific games

### Game Calendar
- Schedule games, practices, tournaments, and other events
- View events in a monthly, weekly, or list format
- Get upcoming event notifications
- Manage event details (location, time, opponent)

## How to Use

### Getting Started
1. Open `index.html` in your web browser
2. Navigate through the application using the navigation bar

### Team Stats
1. Go to the Team Stats page
2. Click "Add Game" to record a new game result
3. Fill in the game details and team statistics
4. View team performance metrics and game history

### Player Stats
1. Go to the Player Stats page
2. Click "Add Player" to add players to your roster
3. Select a player to view their statistics
4. Click "Add Stats" to record player performance for specific games
5. Filter player game stats by selecting different games

### Game Calendar
1. Go to the Game Calendar page
2. Click "Add Event" to schedule a new event
3. View your schedule in different formats (month, week, list)
4. Click on events to view details or make changes

## Technical Details

This application is built using:
- HTML5
- CSS3 (with Bootstrap 5)
- JavaScript (Vanilla)
- FullCalendar.js for calendar functionality
- Local Storage for data persistence

## Data Storage

All data is stored locally in your browser's localStorage. This means:
- Data persists between sessions
- Data is not shared between devices
- Clearing browser data will erase your stats

## Testing

To test the application:

1. **Team Stats Testing**:
   - Add several game results with different scores
   - Verify that win/loss record and percentages calculate correctly
   - Check that team offensive and defensive stats aggregate properly

2. **Player Stats Testing**:
   - Add multiple players with different positions
   - Record stats for players across different games
   - Verify that individual and aggregate stats display correctly
   - Test filtering by specific games

3. **Calendar Testing**:
   - Add different types of events (games, practices, etc.)
   - Test calendar navigation between months
   - Verify that events appear in the upcoming events list
   - Test event editing and deletion

## Future Enhancements

Potential future improvements:
- User accounts and authentication
- Cloud data storage
- Team management (multiple teams)
- Advanced statistics and analytics
- Export data to CSV/PDF
- Mobile application version
