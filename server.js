require('dotenv').config();
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const path = require('path'); // Add this line
const app = express();
const port = 3000;

// Replace these with your actual Spotify app credentials
const CLIENT_ID = process.env.CLIENT_ID; // Your client id
const CLIENT_SECRET = process.env.CLIENT_SECRET; // Your client secret
const REDIRECT_URI = 'http://localhost:3000/callback'; // Your redirect uri

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public'))); // Add this line

// Route to start the OAuth flow
app.get('/login', (req, res) => {
    const scope = 'user-read-private user-read-email user-read-recently-played'; // Added user-read-recently-played scope
    res.redirect(`https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;

    try {
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const accessToken = tokenResponse.data.access_token;

        // Fetch user's profile data
        const userResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // Extracting additional information
        const username = userResponse.data.display_name; // Username
        const email = userResponse.data.email; // Email
        const profileImage = userResponse.data.images[0]?.url; // Profile image URL
        const country = userResponse.data.country; // Country

        // Fetch recently played tracks
        const recentlyPlayedResponse = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=20', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        // Log the response data to see what's returned
        console.log('Recently Played Response:', recentlyPlayedResponse.data);

        const recentlyPlayedTracks = recentlyPlayedResponse.data.items; // Extract recently played tracks

        // Create an HTML response to display user information
        res.send(`
            <h1>Welcome, ${username}!</h1>
            <p>Email: ${email}</p>
            <p>Country: ${country}</p>
            ${profileImage ? `<img src="${profileImage}" alt="${username}'s profile image" style="width: 100px; height: auto;" />` : ''}
            <h2>Your Recently Played Tracks:</h2>
            <ul>
                ${recentlyPlayedTracks.map(item => {
                    const track = item.track; // Get the track object
                    return `<li>${track.name} by ${track.artists.map(artist => artist.name).join(', ')}</li>`;
                }).join('')}
            </ul>
        `); // Send user information and recently played tracks as response
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.send('Error fetching user data. Please try again.');
    }
});
setInterval(async () => {
    try {
        const recentlyPlayedResponse = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=20', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        console.log('Updated Recently Played Response:', recentlyPlayedResponse.data);
    } catch (error) {
        console.error('Error fetching recently played tracks:', error);
    }
}, 60000); // Fetch every 60 seconds

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
