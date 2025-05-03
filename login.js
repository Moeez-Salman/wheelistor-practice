document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.querySelector('.btn');
  const usernameInput = document.querySelector('input[type="text"]');
  const passwordInput = document.querySelector('input[type="password"]');

  loginButton.addEventListener('click', async () => {
      if (!usernameInput.value.trim() || !passwordInput.value.trim()) {
          showErrorMessage("Username and password are required!");
          return;
      }

      loginButton.disabled = true;
      loginButton.textContent = 'Logging in...';

      try {
          const response = await fetch("http://localhost:3000/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  username: usernameInput.value,
                  password: passwordInput.value
              })
          });

          const data = await response.json();
          console.log("Server Response:", data);

          if (data.success) {
              alert("Login successful!");
              window.location.href = "UserDashboard.html"; // Redirect after login
          } else {
              showErrorMessage(data.message);
          }
      } catch (error) {
          console.error("Error:", error);
          showErrorMessage("Server error. Try again later.");
      }

      loginButton.textContent = 'LOG IN';
      loginButton.disabled = false;
  });

  function showErrorMessage(message) {
      let errorMessageDiv = document.querySelector('.error-message');
      if (!errorMessageDiv) {
          errorMessageDiv = document.createElement('div');
          errorMessageDiv.classList.add('error-message');
          errorMessageDiv.style.color = '#ff4d4d';
          errorMessageDiv.style.marginTop = '10px';
          errorMessageDiv.style.fontSize = '14px';
          document.querySelector('.login-box').appendChild(errorMessageDiv);
      }
      errorMessageDiv.textContent = message;
      setTimeout(() => { errorMessageDiv.textContent = ''; }, 3000);
  }
});
