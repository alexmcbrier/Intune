document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const clientId = 'd7eb5749696541d0a3704e975036f853'; // Replace with your Client ID
    const redirectUri = 'http://localhost:3000/callback'; // Update to your redirect URI
    const scopes = 'user-read-private user-read-email';

    // Redirect to Spotify's authorization page
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=token`;

    window.location.href = authUrl;
});
