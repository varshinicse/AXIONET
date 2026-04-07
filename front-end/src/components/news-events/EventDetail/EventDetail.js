import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, Button, Spinner, Card, ListGroup } from 'react-bootstrap';
import {
    FaCalendarAlt, FaUser, FaClock, FaArrowLeft, FaEdit,
    FaTrash, FaMapMarkerAlt, FaLink, FaUsers, FaCheckCircle, FaTimesCircle, FaCalendarPlus
} from 'react-icons/fa';
import { newsEventsService } from '../../../services/api/news-events';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import '../NewsDetail/NewsDetailStyle.css'; // Reuse basic styles

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rsvpLoading, setRsvpLoading] = useState(false);
    const [attendees, setAttendees] = useState([]);
    const [showAttendees, setShowAttendees] = useState(false);

    const fetchEvent = useCallback(async () => {
        try {
            setLoading(true);
            const response = await newsEventsService.getById(id);
            if (response && response.data) {
                setEvent(response.data);
                document.title = `${response.data.title} | Event Details`;

                // If user is staff or organizer, fetch attendees
                if (user && (user.role === 'staff' || user._id === response.data.author_id)) {
                    fetchAttendees();
                }
            }
        } catch (error) {
            console.error('Error fetching event:', error);
            toast.error('Failed to load event details');
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    const fetchAttendees = async () => {
        try {
            const response = await newsEventsService.getAttendees(id);
            if (response && response.data) {
                setAttendees(response.data);
            }
        } catch (error) {
            console.error('Error fetching attendees:', error);
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [fetchEvent]);

    const handleRsvp = async () => {
        if (!user) {
            toast.info('Please sign in to RSVP');
            navigate('/signin');
            return;
        }

        try {
            setRsvpLoading(true);
            if (event.rsvp_status === 'registered') {
                await newsEventsService.cancelRsvp(id);
                toast.success('RSVP cancelled');
            } else {
                await newsEventsService.rsvp(id);
                toast.success('Successfully registered for the event!');
            }
            fetchEvent(); // Refresh event data
        } catch (error) {
            console.error('RSVP Error:', error);
            toast.error(error.response?.data?.message || 'Failed to update RSVP');
        } finally {
            setRsvpLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await newsEventsService.delete(id);
                toast.success('Event deleted successfully');
                navigate('/events');
            } catch (error) {
                toast.error('Failed to delete event');
            }
        }
    };

    const addToCalendar = () => {
        // Generate ICS file content
        const eventDate = new Date(event.event_date);
        const startDate = eventDate.toISOString().replace(/-/g, '').split('T')[0];

        let startTime = '000000';
        if (event.event_time) {
            // Convert "18:00" to "180000"
            startTime = event.event_time.replace(/:/g, '') + '00';
        }

        // Add 1 hour to start time for end time (simple approximation)
        let endHour = parseInt(startTime.substring(0, 2)) + 1;
        if (endHour > 23) endHour = 23;
        const endTime = endHour.toString().padStart(2, '0') + startTime.substring(2);

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//AXIONET//Alumni Event Scheduler//EN',
            'BEGIN:VEVENT',
            `SUMMARY:${event.title}`,
            `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
            `LOCATION:${event.location}`,
            `DTSTART:${startDate}T${startTime}`,
            `DTEND:${startDate}T${endTime}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Calendar file (.ics) downloaded!");
    };

    if (loading) return (
        <Container className="py-5 text-center">
            <Spinner animation="border" />
            <p className="mt-3">Loading event...</p>
        </Container>
    );

    if (!event) return (
        <Container className="py-5 text-center">
            <h3>Event Not Found</h3>
            <Link to="/events" className="btn btn-primary mt-3">Back to Events</Link>
        </Container>
    );

    const isOrganizer = user && (user.role === 'staff' || user._id === event.author_id);
    const isFull = event.capacity > 0 && event.attendees_count >= event.capacity;

    return (
        <div className="event-detail-page py-4">
            <Container>
                <Link to="/events" className="btn btn-link p-0 mb-4 text-decoration-none">
                    <FaArrowLeft className="me-2" /> Back to Events
                </Link>

                <Row>
                    <Col lg={8}>
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <Badge bg="primary" className="mb-2 me-2">{event.category}</Badge>
                                        <Badge bg="info" className="mb-2">{event.event_type}</Badge>
                                    </div>
                                    {isOrganizer && (
                                        <div className="d-flex gap-2">
                                            <Button variant="outline-secondary" size="sm" onClick={() => navigate(`/news-events/${id}/edit`)}>
                                                <FaEdit /> Edit
                                            </Button>
                                            <Button variant="outline-danger" size="sm" onClick={handleDelete}>
                                                <FaTrash /> Delete
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <h1 className="mb-3">{event.title}</h1>

                                <div className="d-flex flex-wrap gap-4 text-muted mb-4">
                                    <div className="d-flex align-items-center">
                                        <FaCalendarAlt className="me-2 text-primary" />
                                        {new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    {event.event_time && (
                                        <div className="d-flex align-items-center">
                                            <FaClock className="me-2 text-primary" />
                                            {event.event_time}
                                        </div>
                                    )}
                                    <div className="d-flex align-items-center">
                                        <FaMapMarkerAlt className="me-2 text-primary" />
                                        {event.location}
                                    </div>
                                </div>

                                <hr />

                                <div className="event-description mb-5">
                                    <h4 className="mb-3 text-dark">About This Event</h4>
                                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{event.description}</p>
                                </div>

                                {event.register_link && (
                                    <div className="mb-4">
                                        <Button href={event.register_link} target="_blank" variant="outline-primary" className="d-flex align-items-center w-auto">
                                            <FaLink className="me-2" /> External Registration Link
                                        </Button>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {isOrganizer && attendees.length > 0 && (
                            <Card className="shadow-sm border-0 mb-4">
                                <Card.Header className="bg-white border-bottom-0 py-3 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0"><FaUsers className="me-2" /> Attendees ({attendees.length})</h5>
                                    <Button variant="link" size="sm" onClick={() => setShowAttendees(!showAttendees)}>
                                        {showAttendees ? 'Hide' : 'Show'}
                                    </Button>
                                </Card.Header>
                                {showAttendees && (
                                    <ListGroup variant="flush">
                                        {attendees.map((rsvp, idx) => (
                                            <ListGroup.Item key={idx} className="py-3">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="fw-bold">{rsvp.user?.name}</div>
                                                        <small className="text-muted">{rsvp.user?.role} • {rsvp.user?.dept}</small>
                                                    </div>
                                                    <Badge bg="success" pill>Confirmed</Badge>
                                                </div>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Card>
                        )}
                    </Col>

                    <Col lg={4}>
                        <Card className="shadow-sm border-0 sticky-top" style={{ top: '2rem' }}>
                            <Card.Body className="p-4">
                                <div className="price-tag mb-4">
                                    <h2 className="mb-0">{event.price > 0 ? `$${event.price}` : 'FREE'}</h2>
                                    <small className="text-muted">per person</small>
                                </div>

                                <div className="event-stats mb-4">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Capacity</span>
                                        <span className="fw-bold">{event.capacity > 0 ? event.capacity : 'Unlimited'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>Registered</span>
                                        <span className="fw-bold">{event.attendees_count || 0}</span>
                                    </div>
                                    {event.capacity > 0 && (
                                        <div className="progress mt-2" style={{ height: '8px' }}>
                                            <div
                                                className={`progress-bar ${isFull ? 'bg-danger' : 'bg-success'}`}
                                                style={{ width: `${Math.min((event.attendees_count / event.capacity) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    )}
                                </div>

                                <div className="d-grid gap-3">
                                    <Button
                                        variant={event.rsvp_status === 'registered' ? "outline-danger" : "primary"}
                                        size="lg"
                                        onClick={handleRsvp}
                                        disabled={rsvpLoading || (event.rsvp_status !== 'registered' && isFull)}
                                    >
                                        {rsvpLoading ? <Spinner size="sm" /> : (
                                            event.rsvp_status === 'registered' ? (
                                                <><FaTimesCircle className="me-2" /> Cancel RSVP</>
                                            ) : (
                                                isFull ? 'Event Full' : <><FaCheckCircle className="me-2" /> RSVP Now</>
                                            )
                                        )}
                                    </Button>

                                    <Button variant="outline-secondary" onClick={addToCalendar}>
                                        <FaCalendarPlus className="me-2" /> Add to Calendar
                                    </Button>
                                </div>

                                <div className="mt-4 pt-4 border-top">
                                    <div className="d-flex align-items-center">
                                        <div className="author-avatar me-3" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                                            <FaUser />
                                        </div>
                                        <div>
                                            <small className="text-muted d-block">Organized by</small>
                                            <span className="fw-bold">{event.author?.name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default EventDetail;
