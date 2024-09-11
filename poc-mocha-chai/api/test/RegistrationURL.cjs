// RegistrationURL.cjs

let registrationPage = '';

// Function to save registration URL
function setregistrationPage(url) {
  registrationPage = url;
}

// Function to get registration URL
function getregistrationPage() {
  return registrationPage;
}

module.exports = { setregistrationPage, getregistrationPage };