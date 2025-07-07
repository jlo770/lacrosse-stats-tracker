/**
 * Lacrosse Stats Tracker - Main Application Script
 * 
 * This file contains common functionality used across the application
 */

// Initialize local storage if not already set up
function initializeLocalStorage() {
    // Check if teams data exists, if not initialize it
    if (!localStorage.getItem('lacrosseTeam')) {
        const defaultTeam = {
            name: 'My Lacrosse Team',
            games: [],
            players: []
        };
        localStorage.setItem('lacrosseTeam', JSON.stringify(defaultTeam));
    }
    
    // Check if events data exists, if not initialize it
    if (!localStorage.getItem('lacrosseEvents')) {
        localStorage.setItem('lacrosseEvents', JSON.stringify([]));
    }
}

// Load team data from local storage
function getTeamData() {
    const teamData = localStorage.getItem('lacrosseTeam');
    return teamData ? JSON.parse(teamData) : null;
}

// Save team data to local storage
function saveTeamData(teamData) {
    localStorage.setItem('lacrosseTeam', JSON.stringify(teamData));
}

// Load events data from local storage
function getEventsData() {
    const eventsData = localStorage.getItem('lacrosseEvents');
    return eventsData ? JSON.parse(eventsData) : [];
}

// Save events data to local storage
function saveEventsData(eventsData) {
    localStorage.setItem('lacrosseEvents', JSON.stringify(eventsData));
}

// Format date for display (MM/DD/YYYY)
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });
}

// Calculate win percentage
function calculateWinPercentage(wins, totalGames) {
    if (totalGames === 0) return 0;
    return Math.round((wins / totalGames) * 100);
}

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Show alert message
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Find the container to append the alert to
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeLocalStorage();
});
