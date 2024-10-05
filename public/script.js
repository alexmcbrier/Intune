document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    window.location.href = `callback.html?email=${encodeURIComponent(email)}`;
});
