/**
 * Lacrosse Stats Tracker - Player Stats Script
 * 
 * This file contains functionality specific to the player stats page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load player data and update UI
    loadPlayerRoster();
    updatePlayerSelect();
    updateGameSelect();
    
    // Set up event listeners
    document.getElementById('save-player-btn').addEventListener('click', savePlayer);
    document.getElementById('save-player-stats-btn').addEventListener('click', savePlayerStats);
    document.getElementById('player-select').addEventListener('change', displayPlayerStats);
    document.getElementById('game-select').addEventListener('change', filterPlayerGameStats);
    
    // Show/hide goalie stats based on position
    document.getElementById('player-position-input').addEventListener('change', function() {
        const isGoalie = this.value === 'Goalie';
        document.getElementById('goalie-stats-section').style.display = isGoalie ? 'block' : 'none';
    });
});

// Load and display player roster
function loadPlayerRoster() {
    const teamData = getTeamData();
    if (!teamData || !teamData.players) return;
    
    const players = teamData.players;
    const tableBody = document.getElementById('player-roster-body');
    tableBody.innerHTML = '';
    
    if (players.length === 0) {
        tableBody.innerHTML = `
            <tr class="text-center">
                <td colspan="8">No players added yet</td>
            </tr>
        `;
        return;
    }
    
    // Sort players by number
    players.sort((a, b) => parseInt(a.number) - parseInt(b.number));
    
    players.forEach(player => {
        // Calculate player stats
        const playerStats = calculatePlayerStats(player);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player.number}</td>
            <td>${player.name}</td>
            <td>${player.position}</td>
            <td>${playerStats.gamesPlayed}</td>
            <td>${playerStats.goals}</td>
            <td>${playerStats.assists}</td>
            <td>${playerStats.points}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-player-btn" data-player-id="${player.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-player-btn" data-player-id="${player.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to the new buttons
    document.querySelectorAll('.view-player-btn').forEach(button => {
        button.addEventListener('click', function() {
            const playerId = this.getAttribute('data-player-id');
            document.getElementById('player-select').value = playerId;
            document.getElementById('player-select').dispatchEvent(new Event('change'));
        });
    });
    
    document.querySelectorAll('.delete-player-btn').forEach(button => {
        button.addEventListener('click', function() {
            const playerId = this.getAttribute('data-player-id');
            deletePlayer(playerId);
        });
    });
}

// Update player select dropdown
function updatePlayerSelect() {
    const teamData = getTeamData();
    if (!teamData || !teamData.players) return;
    
    const players = teamData.players;
    const playerSelect = document.getElementById('player-select');
    
    // Clear existing options except the first one
    while (playerSelect.options.length > 1) {
        playerSelect.remove(1);
    }
    
    // Sort players by number
    players.sort((a, b) => parseInt(a.number) - parseInt(b.number));
    
    // Add player options
    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player.id;
        option.textContent = `#${player.number} - ${player.name} (${player.position})`;
        playerSelect.appendChild(option);
    });
}

// Update game select dropdown
function updateGameSelect() {
    const teamData = getTeamData();
    if (!teamData || !teamData.games) return;
    
    const games = teamData.games;
    const gameSelect = document.getElementById('game-select');
    const statsGameSelect = document.getElementById('stats-game-select');
    
    // Clear existing options except the first one
    while (gameSelect.options.length > 1) {
        gameSelect.remove(1);
    }
    
    // Clear stats game select completely
    while (statsGameSelect.options.length > 0) {
        statsGameSelect.remove(0);
    }
    
    // Add default option to stats game select
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Game';
    statsGameSelect.appendChild(defaultOption);
    
    // Sort games by date (newest first)
    games.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add game options
    games.forEach(game => {
        // For main game select
        const option1 = document.createElement('option');
        option1.value = game.id;
        option1.textContent = `${formatDate(game.date)} vs ${game.opponent}`;
        gameSelect.appendChild(option1);
        
        // For stats game select
        const option2 = document.createElement('option');
        option2.value = game.id;
        option2.textContent = `${formatDate(game.date)} vs ${game.opponent}`;
        statsGameSelect.appendChild(option2);
    });
}

// Save a new player
function savePlayer() {
    const number = document.getElementById('player-number-input').value;
    const name = document.getElementById('player-name-input').value;
    const position = document.getElementById('player-position-input').value;
    
    // Validate required fields
    if (!number || !name || !position) {
        showAlert('Please fill in all required fields.', 'danger');
        return;
    }
    
    // Create new player object
    const newPlayer = {
        id: generateId(),
        number,
        name,
        position,
        gameStats: []
    };
    
    // Add player to team data
    const teamData = getTeamData();
    if (!teamData.players) {
        teamData.players = [];
    }
    
    teamData.players.push(newPlayer);
    saveTeamData(teamData);
    
    // Update UI
    loadPlayerRoster();
    updatePlayerSelect();
    
    // Close modal and show success message
    const modal = bootstrap.Modal.getInstance(document.getElementById('addPlayerModal'));
    modal.hide();
    
    showAlert('Player added successfully!');
    
    // Reset form
    document.getElementById('add-player-form').reset();
}

// Save player game stats
function savePlayerStats() {
    const playerId = document.getElementById('player-select').value;
    const gameId = document.getElementById('stats-game-select').value;
    
    // Validate required fields
    if (!playerId || !gameId) {
        showAlert('Please select a player and game.', 'danger');
        return;
    }
    
    // Get stats values
    const stats = {
        goals: parseInt(document.getElementById('stats-goals').value) || 0,
        assists: parseInt(document.getElementById('stats-assists').value) || 0,
        shots: parseInt(document.getElementById('stats-shots').value) || 0,
        groundBalls: parseInt(document.getElementById('stats-ground-balls').value) || 0,
        causedTurnovers: parseInt(document.getElementById('stats-caused-turnovers').value) || 0,
        turnovers: parseInt(document.getElementById('stats-turnovers').value) || 0
    };
    
    // Add goalie stats if applicable
    const playerData = getTeamData().players.find(p => p.id === playerId);
    if (playerData && playerData.position === 'Goalie') {
        stats.saves = parseInt(document.getElementById('stats-saves').value) || 0;
        stats.goalsAgainst = parseInt(document.getElementById('stats-goals-against').value) || 0;
    }
    
    // Get team data
    const teamData = getTeamData();
    const playerIndex = teamData.players.findIndex(p => p.id === playerId);
    
    if (playerIndex === -1) {
        showAlert('Player not found.', 'danger');
        return;
    }
    
    // Check if stats for this game already exist
    const existingStatIndex = teamData.players[playerIndex].gameStats.findIndex(s => s.gameId === gameId);
    
    if (existingStatIndex !== -1) {
        // Update existing stats
        teamData.players[playerIndex].gameStats[existingStatIndex] = {
            ...teamData.players[playerIndex].gameStats[existingStatIndex],
            ...stats
        };
    } else {
        // Add new stats
        teamData.players[playerIndex].gameStats.push({
            gameId,
            ...stats
        });
    }
    
    // Save updated team data
    saveTeamData(teamData);
    
    // Update UI
    displayPlayerStats();
    
    // Close modal and show success message
    const modal = bootstrap.Modal.getInstance(document.getElementById('addPlayerStatsModal'));
    modal.hide();
    
    showAlert('Player stats saved successfully!');
    
    // Reset form
    document.getElementById('add-player-stats-form').reset();
}

// Display player stats
function displayPlayerStats() {
    const playerId = document.getElementById('player-select').value;
    
    if (!playerId) {
        document.getElementById('player-stats-container').style.display = 'none';
        document.getElementById('no-player-selected').style.display = 'block';
        return;
    }
    
    document.getElementById('player-stats-container').style.display = 'block';
    document.getElementById('no-player-selected').style.display = 'none';
    
    const teamData = getTeamData();
    const player = teamData.players.find(p => p.id === playerId);
    
    if (!player) return;
    
    // Update player info
    document.getElementById('player-number').textContent = player.number;
    document.getElementById('player-name').textContent = player.name;
    document.getElementById('player-position').textContent = player.position;
    
    // Calculate and display player stats
    const playerStats = calculatePlayerStats(player);
    
    document.getElementById('player-goals').textContent = playerStats.goals;
    document.getElementById('player-assists').textContent = playerStats.assists;
    document.getElementById('player-points').textContent = playerStats.points;
    document.getElementById('player-ground-balls').textContent = playerStats.groundBalls;
    document.getElementById('player-shots').textContent = playerStats.shots;
    document.getElementById('player-shot-percentage').textContent = playerStats.shotPercentage + '%';
    
    // Display game-by-game stats
    displayPlayerGameStats(player);
}

// Display player game-by-game stats
function displayPlayerGameStats(player) {
    const gameId = document.getElementById('game-select').value;
    const teamData = getTeamData();
    const tableBody = document.getElementById('player-game-stats-body');
    tableBody.innerHTML = '';
    
    if (!player.gameStats || player.gameStats.length === 0) {
        tableBody.innerHTML = `
            <tr class="text-center">
                <td colspan="7">No game stats recorded yet</td>
            </tr>
        `;
        return;
    }
    
    // Filter stats by selected game if not "all"
    let gameStats = player.gameStats;
    if (gameId !== 'all') {
        gameStats = gameStats.filter(stat => stat.gameId === gameId);
    }
    
    if (gameStats.length === 0) {
        tableBody.innerHTML = `
            <tr class="text-center">
                <td colspan="7">No stats for selected game</td>
            </tr>
        `;
        return;
    }
    
    // Sort by game date (newest first)
    gameStats.sort((a, b) => {
        const gameA = teamData.games.find(g => g.id === a.gameId);
        const gameB = teamData.games.find(g => g.id === b.gameId);
        
        if (!gameA || !gameB) return 0;
        
        return new Date(gameB.date) - new Date(gameA.date);
    });
    
    gameStats.forEach(stat => {
        const game = teamData.games.find(g => g.id === stat.gameId);
        if (!game) return;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(game.date)}</td>
            <td>${game.opponent}</td>
            <td>${stat.goals || 0}</td>
            <td>${stat.assists || 0}</td>
            <td>${stat.shots || 0}</td>
            <td>${stat.groundBalls || 0}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger delete-stat-btn" data-game-id="${stat.gameId}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-stat-btn').forEach(button => {
        button.addEventListener('click', function() {
            const gameId = this.getAttribute('data-game-id');
            deletePlayerStat(player.id, gameId);
        });
    });
}

// Filter player game stats based on selected game
function filterPlayerGameStats() {
    const playerId = document.getElementById('player-select').value;
    if (!playerId) return;
    
    const teamData = getTeamData();
    const player = teamData.players.find(p => p.id === playerId);
    
    if (!player) return;
    
    displayPlayerGameStats(player);
}

// Calculate player stats
function calculatePlayerStats(player) {
    if (!player.gameStats) {
        return {
            gamesPlayed: 0,
            goals: 0,
            assists: 0,
            points: 0,
            shots: 0,
            shotPercentage: 0,
            groundBalls: 0
        };
    }
    
    const stats = {
        gamesPlayed: player.gameStats.length,
        goals: 0,
        assists: 0,
        points: 0,
        shots: 0,
        groundBalls: 0
    };
    
    player.gameStats.forEach(game => {
        stats.goals += parseInt(game.goals) || 0;
        stats.assists += parseInt(game.assists) || 0;
        stats.shots += parseInt(game.shots) || 0;
        stats.groundBalls += parseInt(game.groundBalls) || 0;
    });
    
    stats.points = stats.goals + stats.assists;
    stats.shotPercentage = stats.shots > 0 ? Math.round((stats.goals / stats.shots) * 100) : 0;
    
    return stats;
}

// Delete a player
function deletePlayer(playerId) {
    if (!confirm('Are you sure you want to delete this player?')) {
        return;
    }
    
    const teamData = getTeamData();
    teamData.players = teamData.players.filter(player => player.id !== playerId);
    saveTeamData(teamData);
    
    // Update UI
    loadPlayerRoster();
    updatePlayerSelect();
    
    // Reset player display if the deleted player was selected
    if (document.getElementById('player-select').value === playerId) {
        document.getElementById('player-select').value = '';
        document.getElementById('player-stats-container').style.display = 'none';
        document.getElementById('no-player-selected').style.display = 'block';
    }
    
    showAlert('Player deleted successfully.');
}

// Delete a player's game stat
function deletePlayerStat(playerId, gameId) {
    if (!confirm('Are you sure you want to delete these stats?')) {
        return;
    }
    
    const teamData = getTeamData();
    const playerIndex = teamData.players.findIndex(p => p.id === playerId);
    
    if (playerIndex === -1) return;
    
    teamData.players[playerIndex].gameStats = teamData.players[playerIndex].gameStats.filter(
        stat => stat.gameId !== gameId
    );
    
    saveTeamData(teamData);
    
    // Update UI
    displayPlayerStats();
    
    showAlert('Player stats deleted successfully.');
}
