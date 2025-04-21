// server/socket/socketHandler.js
const { generateRoomCode } = require('../utils/helpers');
const Poll = require('../models/Poll');
const User = require('../models/User');

module.exports = function (io) {
    const activeRooms = new Map();

    // Helper function to update room state
    const updateRoomState = async (roomId) => {
        try {
            const poll = await Poll.findOne({ roomId });
            if (!poll) return;

            const voteCounts = poll.getVoteCounts();
            const isActive = poll.isActive && new Date() < poll.expiresAt;

            const roomData = {
                id: poll.roomId,
                question: poll.question,
                options: poll.options,
                votes: voteCounts,
                voters: poll.votes.map(v => ({ userId: v.userId, username: v.username, optionIndex: v.optionIndex })),
                expiresAt: poll.expiresAt,
                isActive
            };

            activeRooms.set(roomId, roomData);
            io.to(roomId).emit('room_update', roomData);

            // Check if poll has expired
            if (poll.isActive && new Date() > poll.expiresAt) {
                poll.isActive = false;
                await poll.save();
                io.to(roomId).emit('poll_expired', { roomId });
            }
        } catch (error) {
            console.error(`Error updating room state for ${roomId}:`, error);
        }
    };

    // Set up interval to check for expired polls
    setInterval(async () => {
        for (const [roomId] of activeRooms) {
            await updateRoomState(roomId);
        }
    }, 1000);

    io.on('connection', async (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Auth data from socket connection
        const userId = socket.handshake.auth.userId;
        const username = socket.handshake.auth.username;

        if (!userId || !username) {
            socket.emit('error', { message: 'Authentication required' });
            socket.disconnect();
            return;
        }

        // Verify user exists in database
        try {
            const user = await User.findOne({ userId });

            if (!user) {
                socket.emit('error', { message: 'User not found' });
                socket.disconnect();
                return;
            }

            // Update last active time
            user.lastActive = new Date();
            await user.save();
        } catch (error) {
            console.error('Error verifying user:', error);
            socket.emit('error', { message: 'Authentication failed' });
            socket.disconnect();
            return;
        }

        // Create a new poll room
        socket.on('create_room', async (data, callback) => {
            try {
                const { question, options, createdBy } = data;

                if (!question || !options || options.length < 2 || !createdBy) {
                    return callback({
                        success: false,
                        error: 'Invalid poll data. Question and at least 2 options are required.'
                    });
                }

                // Generate a unique room ID (6 character alphanumeric)
                const roomId = generateRoomCode();

                // Set expiry time (1hr  from now)
                const expiresAt = new Date(Date.now() + 3600 * 1000);

                // Create new poll in database
                const newPoll = new Poll({
                    roomId,
                    question,
                    options,
                    createdBy,
                    expiresAt,
                    isActive: true,
                    votes: []
                });

                await newPoll.save();

                // Add socket to room
                socket.join(roomId);

                // Update room state
                await updateRoomState(roomId);

                callback({ success: true, roomId });
            } catch (error) {
                console.error('Error creating room:', error);
                callback({ success: false, error: 'Failed to create room' });
            }
        });

        // Join an existing poll room
        socket.on('join_room', async (data, callback) => {
            try {
                const { roomId, userId, username } = data;

                if (!roomId || !userId || !username) {
                    return callback({ success: false, error: 'Invalid join data' });
                }

                // Check if room exists
                const poll = await Poll.findOne({ roomId });
                if (!poll) {
                    return callback({ success: false, error: 'Room not found' });
                }

                // Join socket to room
                socket.join(roomId);

                // Update room state
                await updateRoomState(roomId);

                callback({ success: true });
            } catch (error) {
                console.error('Error joining room:', error);
                callback({ success: false, error: 'Failed to join room' });
            }
        });

        // Cast a vote
        socket.on('cast_vote', async (data, callback) => {
            try {
                const { roomId, userId, optionIndex } = data;

                if (!roomId || userId === undefined || optionIndex === undefined) {
                    return callback?.({ success: false, error: 'Invalid vote data' }) ||
                        socket.emit('error', { message: 'Invalid vote data' });
                }

                // Find poll
                const poll = await Poll.findOne({ roomId });
                if (!poll) {
                    return callback?.({ success: false, error: 'Room not found' }) ||
                        socket.emit('error', { message: 'Room not found' });
                }

                // Check if poll is still active
                if (!poll.isActive || new Date() > poll.expiresAt) {
                    return callback?.({ success: false, error: 'This poll has expired' }) ||
                        socket.emit('error', { message: 'This poll has expired' });
                }

                // Check if user has already voted
                const existingVote = poll.votes.find(v => v.userId === userId);
                if (existingVote) {
                    return callback?.({ success: false, error: 'You have already voted' }) ||
                        socket.emit('error', { message: 'You have already voted' });
                }

                // Add vote
                poll.votes.push({
                    userId,
                    username,
                    optionIndex
                });

                await poll.save();

                // Update room state
                await updateRoomState(roomId);

                callback?.({ success: true }) || socket.emit('vote_recorded', { success: true });
            } catch (error) {
                console.error('Error casting vote:', error);
                callback?.({ success: false, error: 'Failed to cast vote' }) ||
                    socket.emit('error', { message: 'Failed to cast vote' });
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};