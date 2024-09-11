let AccessToken = null; // This will store the token

// Function to set the token
function setAccessToken(token) {
  AccessToken = token;
}

// Function to get the token
function getAccessToken() {
  return AccessToken;
}

module.exports = {
  setAccessToken,
  getAccessToken,
};
