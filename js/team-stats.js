/**
 * Lacrosse Stats Tracker - Team Stats Script
 * 
 * This file contains functionality specific to the team stats page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load team data and update UI
    loadTeamStats();
    
    // Set up event listeners
    document.getElementById('save-game-btn').addEventListener('click', saveGameResult);
});

// Load and display team statistics
function loadTeamStats() {
    const teamData = getTeamData();
    if (!teamData) return;
    
    const games = teamData.games || [];
    
    // Calculate overall stats
    let wins = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    let totalShots = 0;
    let totalAssists = 0;
    let totalGroundBalls = 0;
    let totalCausedTurnovers = 0;
    
    games.forEach(game => {
        if (game.teamScore > game.opponentScore) {
            wins++;
        } else if (game.teamScore < game.opponentScore) {
            losses++;
        }
        
        goalsFor += parseInt(game.teamScore) || 0;
        goalsAgainst += parseInt(game.opponentScore) || 0;
        totalShots += parseInt(game.teamStats?.shots) || 0;
        totalAssists += parseInt(game.teamStats?.assists) || 0;
        totalGroundBalls += parseInt(game.teamStats?.groundBalls) || 0;
        totalCausedTurnovers += parseInt(game.teamStats?.causedTurnovers) || 0;
    });
    
    // Update UI with calculated stats
    document.getElementById('wins').textContent = wins;
    document.getElementById('losses').textContent = losses;
    document.getElementById('goals-for').textContent = goalsFor;
    document.getElementById('goals-against').textContent = goalsAgainst;
    document.getElementById('goal-diff').textContent = goalsFor - goalsAgainst;
    
    const totalGames = games.length;
    const winPercentage = calculateWinPercentage(wins, totalGames);
    document.getElementById('win-percentage').textContent = winPercentage + '%';
    document.getElementById('win-percentage').style.width = winPercentage + '%';
    
    // Calculate and update per-game stats
    if (totalGames > 0) {
        document.getElementById('goals-per-game').textContent = (goalsFor / totalGames).toFixed(1);
        document.getElementById('goals-against-per-game').textContent = (goalsAgainst / totalGames).toFixed(1);
    }
    
    document.getElementById('total-shots').textContent = totalShots;
    document.getElementById('total-assists').textContent = totalAssists;
    document.getElementById('total-ground-balls').textContent = totalGroundBalls;
    document.getElementById('total-caused-turnovers').textContent = totalCausedTurnovers;
    
    // Calculate shot percentage
    if (totalShots > 0) {
        const shotPercentage = ((goalsFor / totalShots) * 100).toFixed(1);
        document.getElementById('shot-percentage').textContent = shotPercentage + '%';
    }
    
    // Update game results table
    updateGameResultsTable(games);
}

// Update the game results table with the latest data
function updateGameResultsTable(games) {
    const tableBody = document.getElementById('game-results-body');
    tableBody.innerHTML = '';
    
    if (games.length === 0) {
        tableBody.innerHTML = `
            <tr class="text-center">
                <td colspan="6">No games recorded yet</td>
            </tr>
        `;
        return;
    }
    
    // Sort games by date (newest first)
    games.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    games.forEach(game => {
        const row = document.createElement('tr');
        
        const result = game.teamScore > game.opponentScore ? 'Win' : 
                      game.teamScore < game.opponentScore ? 'Loss' : 'Tie';
        
        const resultClass = result === 'Win' ? 'text-success' : 
                           result === 'Loss' ? 'text-danger' : 'text-warning';
        
        row.innerHTML = `
            <td>${formatDate(game.date)}</td>
            <td>${game.opponent}</td>
            <td>${game.location || 'N/A'}</td>
            <td class="${resultClass}">${result}</td>
            <td>${game.teamScore} - ${game.opponentScore}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-game-btn" data-game-id="${game.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-game-btn" data-game-id="${game.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to the new buttons
    document.querySelectorAll('.view-game-btn').forEach(button => {
        button.addEventListener('click', function() {
            const gameId = this.getAttribute('data-game-id');
            viewGameDetails(gameId);
        });
    });
    
    document.querySelectorAll('.delete-game-btn').forEach(button => {
        button.addEventListener('click', function() {
            const gameId = this.getAttribute('data-game-id');
            deleteGame(gameId);
        });
    });
}

// Save a new game result
function saveGameResult() {
    const date = document.getElementById('game-date').value;
    const opponent = document.getElementById('opponent-name').value;
    const location = document.getElementById('game-location').value;
    const teamScore = parseInt(document.getElementById('team-score').value);
    const opponentScore = parseInt(document.getElementById('opponent-score').value);
    
    // Validate required fields
    if (!date || !opponent || isNaN(teamScore) || isNaN(opponentScore)) {
        showAlert('Please fill in all required fields.', 'danger');
        return;
    }
    
    // Get additional team stats
    const teamStats = {
        shots: parseInt(document.getElementById('team-shots').value) || 0,
        assists: parseInt(document.getElementById('team-assists').value) || 0,
        groundBalls: parseInt(document.getElementById('team-ground-balls').value) || 0,
        turnovers: parseInt(document.getElementById('team-turnovers').value) || 0
    };
    
    // Create new game object
    const newGame = {
        id: generateId(),
        date,
        opponent,
        location,
        teamScore,
        opponentScore,
        teamStats
    };
    
    // Add game to team data
    const teamData = getTeamData();
    if (!teamData.games) {
        teamData.games = [];
    }
    
    teamData.games.push(newGame);
    saveTeamData(teamData);
    
    // Update UI
    loadTeamStats();
    
    // Close modal and show success message
    const modal = bootstrap.Modal.getInstance(document.getElementById('addGameModal'));
    modal.hide();
    
    showAlert('Game result added successfully!');
    
    // Reset form
    document.getElementById('add-game-form').reset();
}

// View game details
function viewGameDetails(gameId) {
    const teamData = getTeamData();
    const game = teamData.games.find(g => g.id === gameId);
    
    if (!game) return;
    
    // Display game details (could be implemented as a modal or detailed view)
    console.log('Game details:', game);
    
    // For now, we'll just show an alert with basic info
    alert(`
        Game vs ${game.opponent}
        Date: ${formatDate(game.date)}
        Score: ${game.teamScore} - ${game.opponentScore}
        Location: ${game.location || 'N/A'}
    `);
}

// Delete a game
function deleteGame(gameId) {
    if (!confirm('Are you sure you want to delete this game record?')) {
        return;
    }
    
    const teamData = getTeamData();
    teamData.games = teamData.games.filter(game => game.id !== gameId);
    saveTeamData(teamData);
    
    // Update UI
    loadTeamStats();
    
    showAlert('Game deleted successfully.');
}
