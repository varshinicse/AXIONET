import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { connectionService } from '../services/api/connection';
import { useAuth } from './AuthContext';
import socketService from '../services/socketService';
import { toast } from 'react-toastify';

const ConnectionsContext = createContext();

export const ConnectionsProvider = ({ children }) => {
    const { user } = useAuth();
    const [connections, setConnections] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [connectionRequests, setConnectionRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user's connections (mutual)
    const fetchConnections = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await connectionService.getConnections();
            setConnections(data.connections || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching connections:', err);
            setError('Failed to load connections.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Fetch followers
    const fetchFollowers = useCallback(async () => {
        if (!user) return;
        try {
            const data = await connectionService.getFollowers();
            setFollowers(data || []);
        } catch (err) {
            console.error('Error fetching followers:', err);
        }
    }, [user]);

    // Fetch following
    const fetchFollowing = useCallback(async () => {
        if (!user) return;
        try {
            const data = await connectionService.getFollowing();
            setFollowing(data || []);
        } catch (err) {
            console.error('Error fetching following:', err);
        }
    }, [user]);

    // Fetch connection requests
    const fetchConnectionRequests = useCallback(async () => {
        if (!user) return;
        try {
            const data = await connectionService.getConnectionRequests();
            setConnectionRequests(data || []);
        } catch (err) {
            console.error('Error fetching connection requests:', err);
        }
    }, [user]);

    // Send a connection request
    const sendConnectionRequest = async (userId) => {
        try {
            await connectionService.sendConnectionRequest(userId);
            return true;
        } catch (err) {
            console.error('Error sending connection request:', err);
            return false;
        }
    };

    // Respond to a connection request
    const respondToConnectionRequest = async (requestId, status) => {
        try {
            await connectionService.respondToRequest(requestId, status);
            // Refresh counts and lists
            fetchConnectionRequests();
            fetchFollowers();
            fetchFollowing();
            fetchConnections();
            return true;
        } catch (err) {
            console.error('Error responding to connection request:', err);
            return false;
        }
    };

    // Remove a connection
    const removeConnection = async (connectionId) => {
        try {
            await connectionService.removeConnection(connectionId);
            fetchConnections();
            fetchFollowers();
            fetchFollowing();
            return true;
        } catch (err) {
            console.error('Error removing connection:', err);
            return false;
        }
    };

    // Check connection status with another user
    const checkConnectionStatus = async (userId) => {
        try {
            return await connectionService.getConnectionStatus(userId);
        } catch (err) {
            console.error('Error checking connection status:', err);
            return { status: 'error' };
        }
    };

    // Initialize data
    useEffect(() => {
        if (user) {
            fetchConnections();
            fetchFollowers();
            fetchFollowing();
            fetchConnectionRequests();

            // Setup Real-time Listeners
            const handleNewRequest = (data) => {
                toast.info(`New follow request from ${data.from_user.name}`);
                fetchConnectionRequests();
            };

            const handleRequestAccepted = (data) => {
                toast.success(`${data.by_user.name} accepted your follow request!`);
                fetchFollowing();
                fetchConnections();
            };

            const handleRequestRejected = (data) => {
                fetchConnectionRequests();
            };

            socketService.onConnectionRequest(handleNewRequest);
            socketService.onRequestAccepted(handleRequestAccepted);
            socketService.onRequestRejected(handleRequestRejected);

            return () => {
                socketService.offConnectionRequest(handleNewRequest);
                socketService.offRequestAccepted(handleRequestAccepted);
                socketService.offRequestRejected(handleRequestRejected);
            };
        } else {
            setConnections([]);
            setFollowers([]);
            setFollowing([]);
            setConnectionRequests([]);
            setLoading(false);
        }
    }, [user, fetchConnections, fetchFollowers, fetchFollowing, fetchConnectionRequests]);

    const value = {
        connections,
        followers,
        following,
        connectionRequests,
        loading,
        error,
        fetchConnections,
        fetchFollowers,
        fetchFollowing,
        fetchConnectionRequests,
        sendConnectionRequest,
        respondToConnectionRequest,
        removeConnection,
        checkConnectionStatus
    };

    return (
        <ConnectionsContext.Provider value={value}>
            {children}
        </ConnectionsContext.Provider>
    );
};

export const useConnections = () => {
    return useContext(ConnectionsContext);
};

export default ConnectionsContext;