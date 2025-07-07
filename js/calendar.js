/**
 * Lacrosse Stats Tracker - Calendar Script
 * 
 * This file contains functionality specific to the calendar page
 */

let calendar;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize FullCalendar
    initializeCalendar();
    
    // Load events data and update UI
    loadEvents();
    
    // Set up event listeners
    document.getElementById('save-event-btn').addEventListener('click', saveEvent);
    document.getElementById('event-type').addEventListener('change', toggleGameFields);
    document.getElementById('delete-event-btn').addEventListener('click', deleteSelectedEvent);
});

// Initialize FullCalendar
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listMonth'
        },
        navLinks: true,
        editable: true,
        dayMaxEvents: true,
        events: [],
        eventClick: function(info) {
            showEventDetails(info.event);
        },
        eventDrop: function(info) {
            updateEventDate(info.event);
        }
    });
    
    calendar.render();
}

// Load and display events
function loadEvents() {
    const eventsData = getEventsData();
    const teamData = getTeamData();
    
    // Clear existing events
    calendar.removeAllEvents();
    
    // Add events from events data
    eventsData.forEach(event => {
        calendar.addEvent({
            id: event.id,
            title: event.title,
            start: event.date + 'T' + event.time,
            allDay: false,
            extendedProps: {
                type: event.type,
                location: event.location,
                description: event.description,
                isHomeGame: event.isHomeGame
            },
            backgroundColor: getEventColor(event.type),
            borderColor: getEventColor(event.type)
        });
    });
    
    // Also add games from team data if they're not already in events
    if (teamData && teamData.games) {
        teamData.games.forEach(game => {
            // Check if this game is already in events
            const existingEvent = eventsData.find(e => 
                e.type === 'game' && 
                e.title.includes(game.opponent) && 
                e.date === game.date
            );
            
            if (!existingEvent) {
                // Default time if not specified
                const gameTime = '16:00'; // 4:00 PM
                
                calendar.addEvent({
                    id: 'game_' + game.id,
                    title: 'Game vs ' + game.opponent,
                    start: game.date + 'T' + gameTime,
                    allDay: false,
                    extendedProps: {
                        type: 'game',
                        location: game.location,
                        description: `Score: ${game.teamScore} - ${game.opponentScore}`,
                        isHomeGame: game.location && game.location.toLowerCase().includes('home')
                    },
                    backgroundColor: getEventColor('game'),
                    borderColor: getEventColor('game')
                });
            }
        });
    }
    
    // Update upcoming events table
    updateUpcomingEventsTable();
}

// Update upcoming events table
function updateUpcomingEventsTable() {
    const tableBody = document.getElementById('upcoming-events-body');
    tableBody.innerHTML = '';
    
    // Get all events from calendar
    const events = calendar.getEvents();
    
    if (events.length === 0) {
        tableBody.innerHTML = `
            <tr class="text-center">
                <td colspan="6">No upcoming events</td>
            </tr>
        `;
        return;
    }
    
    // Filter for upcoming events (today and future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate >= today;
    });
    
    if (upcomingEvents.length === 0) {
        tableBody.innerHTML = `
            <tr class="text-center">
                <td colspan="6">No upcoming events</td>
            </tr>
        `;
        return;
    }
    
    // Sort by date (soonest first)
    upcomingEvents.sort((a, b) => a.start - b.start);
    
    // Display only the next 10 events
    const eventsToShow = upcomingEvents.slice(0, 10);
    
    eventsToShow.forEach(event => {
        const row = document.createElement('tr');
        
        const eventDate = new Date(event.start);
        const formattedDate = formatDate(eventDate);
        const formattedTime = eventDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const eventType = event.extendedProps.type;
        const typeCapitalized = eventType.charAt(0).toUpperCase() + eventType.slice(1);
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${formattedTime}</td>
            <td>${typeCapitalized}</td>
            <td>${event.title}</td>
            <td>${event.extendedProps.location || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-event-btn" data-event-id="${event.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-event-btn" data-event-id="${event.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to the new buttons
    document.querySelectorAll('.view-event-btn').forEach(button => {
        button.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event-id');
            const event = calendar.getEventById(eventId);
            if (event) {
                showEventDetails(event);
            }
        });
    });
    
    document.querySelectorAll('.delete-event-btn').forEach(button => {
        button.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event-id');
            const event = calendar.getEventById(eventId);
            if (event) {
                deleteEvent(event);
            }
        });
    });
}

// Toggle game-specific fields based on event type
function toggleGameFields() {
    const eventType = document.getElementById('event-type').value;
    document.getElementById('game-specific-fields').style.display = 
        eventType === 'game' ? 'block' : 'none';
}

// Save a new event
function saveEvent() {
    const eventType = document.getElementById('event-type').value;
    const title = document.getElementById('event-title').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const location = document.getElementById('event-location').value;
    const description = document.getElementById('event-description').value;
    
    // Validate required fields
    if (!eventType || !title || !date || !time) {
        showAlert('Please fill in all required fields.', 'danger');
        return;
    }
    
    // Get additional game-specific info
    let isHomeGame = false;
    if (eventType === 'game') {
        isHomeGame = document.getElementById('home-game-check').checked;
    }
    
    // Create new event object
    const newEvent = {
        id: generateId(),
        type: eventType,
        title,
        date,
        time,
        location,
        description,
        isHomeGame
    };
    
    // Add event to events data
    const eventsData = getEventsData();
    eventsData.push(newEvent);
    saveEventsData(eventsData);
    
    // Update UI
    loadEvents();
    
    // Close modal and show success message
    const modal = bootstrap.Modal.getInstance(document.getElementById('addEventModal'));
    modal.hide();
    
    showAlert('Event added successfully!');
    
    // Reset form
    document.getElementById('add-event-form').reset();
    document.getElementById('game-specific-fields').style.display = 'none';
}

// Show event details
function showEventDetails(event) {
    // Set current event ID for delete/edit operations
    document.getElementById('eventDetailsModal').setAttribute('data-event-id', event.id);
    
    // Populate modal with event details
    document.getElementById('detail-title').textContent = event.title;
    
    const eventType = event.extendedProps.type;
    document.getElementById('detail-type').textContent = 
        eventType.charAt(0).toUpperCase() + eventType.slice(1);
    
    const eventDate = new Date(event.start);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('detail-datetime').textContent = `${formattedDate} - ${formattedTime}`;
    document.getElementById('detail-location').textContent = event.extendedProps.location || 'Not specified';
    document.getElementById('detail-description').textContent = event.extendedProps.description || 'No description provided.';
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('eventDetailsModal'));
    modal.show();
}

// Delete the currently selected event
function deleteSelectedEvent() {
    const eventId = document.getElementById('eventDetailsModal').getAttribute('data-event-id');
    const event = calendar.getEventById(eventId);
    
    if (event) {
        deleteEvent(event);
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('eventDetailsModal'));
        modal.hide();
    }
}

// Delete an event
function deleteEvent(event) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }
    
    const eventId = event.id;
    
    // Check if this is a game event from team data
    if (eventId.startsWith('game_')) {
        showAlert('Game events created from team stats cannot be deleted here. Please delete the game from the Team Stats page.', 'warning');
        return;
    }
    
    // Remove from calendar
    event.remove();
    
    // Remove from storage
    const eventsData = getEventsData();
    const updatedEvents = eventsData.filter(e => e.id !== eventId);
    saveEventsData(updatedEvents);
    
    // Update UI
    updateUpcomingEventsTable();
    
    showAlert('Event deleted successfully.');
}

// Update event date when dragged on calendar
function updateEventDate(event) {
    const eventId = event.id;
    
    // Check if this is a game event from team data
    if (eventId.startsWith('game_')) {
        // Revert the change
        event.revert();
        showAlert('Game events created from team stats cannot be modified here. Please update the game from the Team Stats page.', 'warning');
        return;
    }
    
    const newDate = event.start.toISOString().split('T')[0];
    const newTime = event.start.toTimeString().substring(0, 5);
    
    // Update in storage
    const eventsData = getEventsData();
    const eventIndex = eventsData.findIndex(e => e.id === eventId);
    
    if (eventIndex !== -1) {
        eventsData[eventIndex].date = newDate;
        eventsData[eventIndex].time = newTime;
        saveEventsData(eventsData);
        
        // Update UI
        updateUpcomingEventsTable();
        
        showAlert('Event date updated successfully.');
    }
}

// Get color based on event type
function getEventColor(type) {
    switch (type.toLowerCase()) {
        case 'game':
            return '#dc3545'; // Red
        case 'practice':
            return '#0d6efd'; // Blue
        case 'tournament':
            return '#6f42c1'; // Purple
        default:
            return '#198754'; // Green
    }
}
