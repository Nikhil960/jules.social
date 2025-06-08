import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import apiClient from '../services/api';
import toast from '../utils/toastNotifications'; // Import toast
import './ContentCalendar.css';

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

import { useWorkspace } from '../contexts/WorkspaceContext'; // Import useWorkspace
import { useAuth } from '../contexts/AuthContext'; // Import useAuth for token

const ContentCalendar = () => { // Removed workspaceId prop
    const { currentWorkspace } = useWorkspace(); // Get currentWorkspace
    const { token } = useAuth(); // Get token for API calls

    const [events, setEvents] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const calendarRef = useRef(null);

    const fetchPosts = async (startDate, endDate) => {
        if (!currentWorkspace || !token) { // Check for currentWorkspace and token
            setEvents([]); // Clear events if no workspace or token
            if (!currentWorkspace) setError("No workspace selected. Please select a workspace.");
            else setError(null); // Clear error if only token is missing (auth will handle)
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get(`/workspaces/${currentWorkspace.id}/posts`, {
                params: {
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    limit: 500
                }
            });
            const formattedEvents = response.data.map(post => ({
                id: post.id.toString(),
                title: `${getPlatformIcon(post.connected_account?.platform?.name)} ${post.content_text?.substring(0, 20) || 'No Content'}...`,
                start: post.scheduled_at,
                allDay: false,
                extendedProps: { ...post, platformName: post.connected_account?.platform?.name, statusColor: getStatusColor(post.status) },
                backgroundColor: getStatusColor(post.status),
                borderColor: getStatusColor(post.status)
            }));
            setEvents(formattedEvents);
        } catch (err) {
            console.error('Error fetching posts:', err);
            const errorMessage = err.response?.data?.detail || 'Failed to load posts. Please try again.';
            setError(errorMessage); // Set local error state
            toast.error(errorMessage); // Show toast notification
            setEvents([]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        // Fetch posts for the initial view
        if (currentWorkspace && calendarRef.current) { // Check if currentWorkspace is available
            const calendarApi = calendarRef.current.getApi();
            const view = calendarApi.view;
            if (view.activeStart && view.activeEnd) {
                const endDate = new Date(view.activeEnd);
                // endDate.setDate(endDate.getDate()); // FullCalendar's activeEnd is usually exclusive, but API might be inclusive
                fetchPosts(view.activeStart, endDate);
            }
        } else if (!currentWorkspace) {
            setEvents([]); // Clear events if no workspace is selected
            setError("No workspace selected. Please select a workspace from the header.");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentWorkspace, token]); // Re-fetch if currentWorkspace or token changes

    const handleDatesSet = (dateInfo) => {
        // Called when the view's date range changes (e.g., navigating months)
        if (!currentWorkspace) return; // Don't fetch if no workspace
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

        if (!currentWorkspace || !token) { // Guard against missing workspace/token
            alert('Action cannot be performed: No workspace selected or not authenticated.');
            dropInfo.revert();
            return;
        }

        // Optimistic update (optional, for better UX)
        // setEvents(prevEvents => prevEvents.map(e => e.id === postId ? { ...e, start: newScheduledAt } : e)); // Optimistic update

        const promise = apiClient.put(`/posts/${postId}`, {
            scheduled_at: newScheduledAt,
            status: 'scheduled'
        });

        toast.promise(
            promise,
            {
                pending: 'Rescheduling post...',
                success: 'Post rescheduled successfully!',
                error: {
                    render({data}){
                        dropInfo.revert(); // Revert calendar event position on error
                        return data.response?.data?.detail || data.message || 'Failed to update schedule.';
                    }
                }
            }
        ).then(() => {
            // On success, refetch posts to update colors/status accurately
            if (calendarRef.current) {
                const calendarApi = calendarRef.current.getApi();
                const view = calendarApi.view;
                const fetchEndDate = new Date(view.activeEnd);
                // fetchEndDate.setDate(fetchEndDate.getDate()); // Already handled in fetchPosts if needed
                fetchPosts(view.activeStart, fetchEndDate);
            }
        }).catch(() => {
            // Error already handled by toast.promise, and dropInfo.revert() called
            // setError('Failed to update post schedule.'); // Update local state if needed
        });
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
            {!currentWorkspace && !isLoading && <div className="info-message">Please select a workspace to view the calendar.</div>}
            {isLoading && <div className="loading-indicator">Loading posts...</div>}
            {error && <div className="error-message">{error}</div>}
            {currentWorkspace && ( // Only render FullCalendar if a workspace is selected
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
                // Force re-render when currentWorkspace changes, to trigger initial fetch via useEffect
                key={currentWorkspace.id}
                />
            )}

            {selectedPost && currentWorkspace && ( // Also ensure currentWorkspace exists for modal context
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