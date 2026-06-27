const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const app = express();

// --- AAPKE CREDENTIALS ---
const APP_ID = '75a1ed3d7aef48bb8c9f3b66cc00bdad';
const APP_CERTIFICATE = '6765dac1da314d19928c0c5e4d457f40';

// 1. Homepage Guide (Jab aap sirf website kholenge)
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; padding: 40px; line-height: 1.6;">
            <h1 style="color: #2c3e50;">🚀 Spectrum Token Server</h1>
            <p style="color: #27ae60; font-weight: bold;">Status: Online & Ready</p>
            <hr>
            <h3>How to test:</h3>
            <p>Copy this link and paste in browser:</p>
            <code style="background: #ecf0f1; padding: 10px; display: block; border-radius: 5px;">
                ${req.protocol}://${req.get('host')}/rtcToken?channelName=New01&uid=200
            </code>
            <p><b>Required Parameters:</b></p>
            <ul>
                <li><b>channelName:</b> Kid ka Unique ID (e.g., New01)</li>
                <li><b>uid:</b> Integer (Parent ke liye 100, Kid ke liye 200)</li>
            </ul>
        </div>
    `);
});

// 2. Token Generator with Detailed Errors
app.get('/rtcToken', (req, res) => {
    const channelName = req.query.channelName;
    const uid = req.query.uid;

    // ERROR 1: Channel Name missing
    if (!channelName || channelName.trim() === "") {
        return res.status(400).json({ 
            'status': 'FAILED',
            'error': 'MISSING_CHANNEL_NAME', 
            'solution': 'URL ke peeche ?channelName=New01 lagaiye.' 
        });
    }

    // ERROR 2: UID missing or wrong format
    if (!uid || isNaN(uid)) {
        return res.status(400).json({ 
            'status': 'FAILED',
            'error': 'INVALID_OR_MISSING_UID', 
            'solution': 'UID ek number hona chahiye (e.g., &uid=200).' 
        });
    }

    try {
        const role = RtcRole.PUBLISHER; 
        const expirationTimeInSeconds = 3600 * 24; // 24 Hours
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID, 
            APP_CERTIFICATE, 
            channelName, 
            parseInt(uid), 
            role, 
            privilegeExpiredTs
        );

        // Success Response
        console.log(`✅ Success: Token sent for ${channelName}`);
        return res.json({ 
            'status': 'SUCCESS',
            'rtcToken': token,
            'info': {
                'channel': channelName,
                'uid': uid,
                'expires_in': '24 Hours'
            }
        });

    } catch (error) {
        // ERROR 3: Server Side Logic Failure
        return res.status(500).json({ 
            'status': 'SERVER_ERROR',
            'error': 'GENERATION_FAILED', 
            'message': error.message 
        });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
