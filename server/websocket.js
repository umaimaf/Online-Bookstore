const WebSocket = require('ws');
const { saveMessageToDB } = require('./db/dbHelper');

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ port: 5001 });

    wss.on('connection', (ws) => {
        console.log('New client connected');

        ws.on('message', async (data) => {
            try {
                const { user_id, message } = JSON.parse(data);
                console.log('Received message:', { user_id, message });

                // Save message to database
                await saveMessageToDB(user_id, message);

                // Broadcast to all connected admin clients
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'new_message',
                            data: {
                                user_id,
                                message_content: message,
                                created_at: new Date()
                            }
                        }));
                    }
                });

                // Send confirmation back to sender
                ws.send(JSON.stringify({
                    type: 'confirmation',
                    message: 'Message sent successfully'
                }));

            } catch (error) {
                console.error('Error processing message:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Failed to process message'
                }));
            }
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });

    return wss;
}

module.exports = { setupWebSocket }; 