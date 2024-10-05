require('dotenv').config();
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const path = require('path'); 
const app = express();
const port = 3000;

const CLIENT_ID = process.env.CLIENT_ID; 
const CLIENT_SECRET = process.env.CLIENT_SECRET; 
const REDIRECT_URI = 'http://localhost:3000/callback'; 

app.use(express.static(path.join(__dirname, 'public'))); 

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

        const userResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const username = userResponse.data.display_name;
        const email = userResponse.data.email;
        const profileImage = userResponse.data.images[0]?.url; 
        const country = userResponse.data.country;

        const recentlyPlayedResponse = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=20', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        console.log('Recently Played Response:', recentlyPlayedResponse.data);

        const recentlyPlayedTracks = recentlyPlayedResponse.data.items; 

        res.send(`
            <h1>Welcome, ${username}!</h1>
            <p>Email: ${email}</p>
            <p>Country: ${country}</p>
            ${profileImage ? `<img src="${profileImage}" alt="${username}'s profile image" style="width: 100px; height: auto;" />` : ''}
            <h2>Your Recently Played Tracks:</h2>
            <ul>
                ${recentlyPlayedTracks.map(item => {
                    const track = item.track; 
                    return `<li>${track.name} by ${track.artists.map(artist => artist.name).join(', ')}</li>`;
                }).join('')}
            </ul>
        `); 
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.send('Error fetching user data. Please try again.');
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
