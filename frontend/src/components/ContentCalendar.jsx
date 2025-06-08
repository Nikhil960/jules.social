import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // for drag and drop and dateClick
import axios from 'axios';
import './ContentCalendar.css'; // For custom styling

// Mock API base URL - replace with your actual API URL
const API_BASE_URL = '/api/v1'; // Assuming your FastAPI runs on the same domain or proxied

// Helper to get platform icon (simplified)
const getPlatformIcon = (platformName) => {
    // In a real app, you'd have proper icons
    if (!platformName) return '❓';
    if (platformName.toLowerCase().includes('facebook')) return '📘'; // FB icon
    if (platformName.toLowerCase().includes('twitter')) return '🐦'; // Twitter icon
    if (platformName.toLowerCase().includes('instagram')) return '📸'; // IG icon
    if (platformName.toLowerCase().includes('linkedin')) return '💼'; // LinkedIn icon
    return '🌐'; // Default icon
};

const getStatusColor = (status) => {
    switch (status) {
        case 'scheduled': return 'blue';
        case 'posted': return 'green';
        case 'error': return 'red';
        case 'draft': return 'grey';
        default: return 'black';
    }
};

const ContentCalendar = ({ workspaceId }) => {
    const [events, setEvents] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const calendarRef = useRef(null);

    const fetchPosts = async (startDate, endDate) => {
        if (!workspaceId) return;
        setIsLoading(true);
        setError(null);
        try {
            // Adjust date format if your API expects something different
            const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/posts`, {
                params: {
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    limit: 500 // Fetch more posts if needed
                }
            });
            const formattedEvents = response.data.map(post => ({
                id: post.id.toString(), // FullCalendar needs string IDs
                title: `${getPlatformIcon(post.connected_account?.platform?.name)} ${post.content_text?.substring(0, 20) || 'No Content'}...`,
                start: post.scheduled_at, // Assumes scheduled_at is in a format FullCalendar understands (ISO8601)
                allDay: false, // Or true if you treat them as all-day events
                extendedProps: {
                    ...post,
                    platformName: post.connected_account?.platform?.name,
                    statusColor: getStatusColor(post.status)
                },
                backgroundColor: getStatusColor(post.status),
                borderColor: getStatusColor(post.status)
            }));
            setEvents(formattedEvents);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Failed to load posts. Please try again.');
            setEvents([]); // Clear events on error
        }
        setIsLoading(false);
    };

    useEffect(() => {
        // Fetch posts for the initial view
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            const view = calendarApi.view;
            if (view.activeStart && view.activeEnd) {
                 // Add a day to activeEnd because FullCalendar's activeEnd is exclusive
                const endDate = new Date(view.activeEnd);
                endDate.setDate(endDate.getDate()); 
                fetchPosts(view.activeStart, endDate);
            }
        }
    }, [workspaceId]); // Re-fetch if workspaceId changes

    const handleDatesSet = (dateInfo) => {
        // Called when the view's date range changes (e.g., navigating months)
        const { start, end } = dateInfo;
        // Add a day to end because FullCalendar's activeEnd is exclusive for fetching
        const fetchEndDate = new Date(end);
        fetchEndDate.setDate(fetchEndDate.getDate());
        fetchPosts(start, fetchEndDate);
    };

    const handleEventClick = (clickInfo) => {
        setSelectedPost(clickInfo.event.extendedProps);
    };

    const handleEventDrop = async (dropInfo) => {
        const { event, oldEvent } = dropInfo;
        const postId = event.id;
        const newScheduledAt = event.start.toISOString();

        // Optimistic update (optional, for better UX)
        // setEvents(prevEvents => prevEvents.map(e => e.id === postId ? { ...e, start: newScheduledAt } : e));

        try {
            await axios.put(`${API_BASE_URL}/posts/${postId}`, {
                scheduled_at: newScheduledAt,
                // Potentially update status to 'scheduled' if it wasn't
                status: 'scheduled' 
            });
            // Refetch or update event more accurately
            // For now, just log success and rely on next full fetch or manual refresh
            console.log(`Post ${postId} updated to ${newScheduledAt}`);
            // Refresh the specific event or all events
            const calendarApi = calendarRef.current.getApi();
            const view = calendarApi.view;
            const fetchEndDate = new Date(view.activeEnd);
            fetchEndDate.setDate(fetchEndDate.getDate());
            fetchPosts(view.activeStart, fetchEndDate); // Refetch to get updated status/color

        } catch (err) {
            console.error('Error updating post schedule:', err);
            setError('Failed to update post schedule.');
            // Revert optimistic update if you implemented it
            // dropInfo.revert(); // FullCalendar's built-in revert
            // Or manually revert state
            // setEvents(prevEvents => prevEvents.map(e => e.id === postId ? { ...e, start: oldEvent.start } : e));
            alert('Failed to update schedule. Please try again.');
        }
    };

    const renderEventContent = (eventInfo) => {
        return (
            <div className="calendar-event-card">
                <span className="event-icon">{getPlatformIcon(eventInfo.event.extendedProps.platformName)}</span>
                <span className="event-text">{eventInfo.event.title.substring(2).trim()}</span> {/* Remove icon part from title for display */}
                <span 
                    className="event-status-dot"
                    style={{ backgroundColor: eventInfo.event.extendedProps.statusColor }}
                ></span>
            </div>
        );
    };

    const closeModal = () => {
        setSelectedPost(null);
    };

    return (
        <div className="content-calendar-container nb-card">
            {isLoading && <div className="loading-indicator">Loading posts...</div>}
            {error && <div className="error-message">{error}</div>}
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek' // Add more views if needed
                }}
                events={events}
                editable={true} // Allows drag and drop
                droppable={true} // Not strictly needed for event drag-drop within calendar
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                datesSet={handleDatesSet} // Called when navigating months or changing view
                eventContent={renderEventContent} // Custom rendering for event cards
                height="auto" // Adjust as needed, or use aspectRatio
                // Force re-render when workspaceId changes, to trigger initial fetch via useEffect
                key={workspaceId} 
            />

            {selectedPost && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-button" onClick={closeModal} aria-label="Close modal">&times;</button>
                        <h2>Post Details (ID: {selectedPost.id})</h2>
                        <p><strong>Platform:</strong> {selectedPost.connected_account?.platform?.name || 'N/A'}</p>
                        <p><strong>Status:</strong> <span style={{color: getStatusColor(selectedPost.status), fontWeight: 'var(--font-weight-bold)'}}>{selectedPost.status}</span></p>
                        <p><strong>Scheduled At:</strong> {new Date(selectedPost.scheduled_at).toLocaleString()}</p>
                        <p><strong>Content:</strong></p>
                        <pre>{selectedPost.content_text || 'No content'}</pre>
                        {selectedPost.media_url && (
                            <p><strong>Media:</strong> <a href={selectedPost.media_url} target="_blank" rel="noopener noreferrer">View Media</a></p>
                        )}
                        {selectedPost.error_message && (
                            <p><strong>Error:</strong> <span style={{color: 'var(--error)', fontWeight: 'var(--font-weight-bold)'}}>{selectedPost.error_message}</span></p>
                        )}
                        <p><strong>Created At:</strong> {new Date(selectedPost.created_at).toLocaleString()}</p>
                        <p><strong>Last Updated:</strong> {new Date(selectedPost.updated_at || selectedPost.created_at).toLocaleString()}</p>
                        {/* The close button is now at the top right, so this one can be removed or restyled as a primary action if needed */}
                        {/* <button onClick={closeModal} className="nb-button">Close</button> */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentCalendar;