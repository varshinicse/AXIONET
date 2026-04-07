import React, { useState } from 'react';
import { Container, Nav, Card, Badge, Alert } from 'react-bootstrap';
import { FaUserGraduate, FaUserTie, FaUserShield, FaInfoCircle } from 'react-icons/fa';
import FeedList from '../../components/feed/FeedList/FeedList';
import EventList from '../../components/news-events/EventList/EventList';
import JobList from '../../components/jobs/JobList';
import AnalyticsDashboard from '../../components/analytics/AnalyticsDashboard';
import './RoleSimulator.css';

const RoleSimulator = () => {
    const [activeRole, setActiveRole] = useState('student');

    const renderRoleView = () => {
        switch (activeRole) {
            case 'student':
                return (
                    <div className="role-view-content animate-fade-in">
                        <div className="role-header student-theme">
                            <FaUserGraduate className="role-icon" />
                            <div>
                                <h3>Student View</h3>
                                <p>Simulating access to jobs, community feed, and events.</p>
                            </div>
                        </div>
                        <Alert variant="info" className="d-flex align-items-center">
                            <FaInfoCircle className="me-2" />
                            Showing student-specific features: Explore jobs, interact with the feed, and RSVP to events.
                        </Alert>
                        <div className="simulator-component-preview">
                            <FeedList simulatedRole="student" />
                        </div>
                    </div>
                );
            case 'alumni':
                return (
                    <div className="role-view-content animate-fade-in">
                        <div className="role-header alumni-theme">
                            <FaUserTie className="role-icon" />
                            <div>
                                <h3>Alumni View</h3>
                                <p>Simulating mentorship, networking, and job posting capabilities.</p>
                            </div>
                        </div>
                        <Alert variant="success" className="d-flex align-items-center">
                            <FaInfoCircle className="me-2" />
                            Showing alumni-specific features: Manage mentorships, post opportunities, and connect with students.
                        </Alert>
                        <div className="simulator-component-preview">
                            <FeedList simulatedRole="alumni" />
                        </div>
                    </div>
                );
            case 'staff':
                return (
                    <div className="role-view-content animate-fade-in">
                        <div className="role-header staff-theme">
                            <FaUserShield className="role-icon" />
                            <div>
                                <h3>Staff View</h3>
                                <p>Simulating administrative tools, analytics, and event management.</p>
                            </div>
                        </div>
                        <Alert variant="primary" className="d-flex align-items-center">
                            <FaInfoCircle className="me-2" />
                            Showing staff-specific features: High-level analytics, user management, and system-wide controls.
                        </Alert>
                        <div className="simulator-component-preview">
                            <AnalyticsDashboard simulatedRole="staff" />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="role-simulator-page">
            <div className="simulator-top-banner">
                <Container>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="simulator-title">Role Experience Simulator</h1>
                            <p className="simulator-subtitle text-white-50">Compare feature availability and perspectives across different user roles</p>
                        </div>
                        <Badge bg="warning" text="dark" className="p-2 fs-6">Development Tool</Badge>
                    </div>
                </Container>
            </div>

            <Container className="py-4">
                <Card className="simulator-card shadow-sm border-0">
                    <Card.Header className="bg-white border-0 p-0">
                        <Nav variant="tabs" className="simulator-nav nav-fill">
                            <Nav.Item>
                                <Nav.Link
                                    className={`role-tab ${activeRole === 'student' ? 'active student' : ''}`}
                                    onClick={() => setActiveRole('student')}
                                >
                                    <FaUserGraduate className="me-2" /> Student
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    className={`role-tab ${activeRole === 'alumni' ? 'active alumni' : ''}`}
                                    onClick={() => setActiveRole('alumni')}
                                >
                                    <FaUserTie className="me-2" /> Alumni
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    className={`role-tab ${activeRole === 'staff' ? 'active staff' : ''}`}
                                    onClick={() => setActiveRole('staff')}
                                >
                                    <FaUserShield className="me-2" /> Staff
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Card.Header>
                    <Card.Body className="p-4">
                        {renderRoleView()}
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default RoleSimulator;
