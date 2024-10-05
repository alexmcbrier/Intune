document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Here you would typically send a request to your backend to authenticate.
    // Since Spotify uses OAuth 2.0, you will need to redirect to their authorization URL.
    const clientId = 'YOUR_CLIENT_ID'; // Replace with your Client ID
    const redirectUri = 'http://localhost:3000/callback'; // Update to your redirect URI
    const scopes = 'user-read-private user-read-email';

    // Redirect to Spotify's authorization page
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=token`;
    
    window.location.href = authUrl;
});
