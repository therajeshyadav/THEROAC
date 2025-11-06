import React from 'react';
import { Link } from 'react-router-dom';
import { createDetailsURL } from '../utils/urlUtils';

const EventCard = ({ event }) => {
    const detailsURL = createDetailsURL('events', event.title, event.organization, event.id);

    return (
        <div className="event-card mb-3 p-4 border rounded">
            <h4>{event.title}</h4>
            <p><strong>Organization:</strong> {event.organization}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Date:</strong> {event.date}</p>
            <p>{event.description}</p>
            <Link to={detailsURL} className="btn btn-primary">
                View Details
            </Link>
        </div>
    );
};

export default EventCard;