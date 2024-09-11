const axios = require('axios').default;
const { setAccessToken, getAccessToken } = require('./savetoken.cjs'); // Import the token utility
const { setregistrationPage, getregistrationPage } = require('./RegistrationURL.cjs');
const moment = require('moment');
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const chromeOptions = new chrome.Options();
chromeOptions.addArguments('start-maximized'); // Start browser maximized

let driver; // Declare WebDriver variable

// Before all tests, fetch and store the access token
before(async () => {
  try {
    const { expect } = await import('chai');

    const requestBody = {
      grantType: 'client_credentials',
    };

    const response = await axios.post('https://partner-dev.linkaja.com/new-api/production/merchant/oauth', requestBody, {
      headers: {
        Authorization: `Basic dWNWNXNSUVNEbkJ3Um5yODpteXBlcnRhbWluYQ==`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', response.status);
    console.log('AccessToken:', response.data.accessToken);

    // Store the access token using the utility function
    setAccessToken(response.data.accessToken);

    expect(response.status).to.equal(200);
    expect(response.data.accessToken).to.be.a('string');

    // Initialize WebDriver
    driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    throw error;
  }
});

// After all tests, close WebDriver
after(async () => {
  if (driver) {
    await driver.quit();
  }
});

describe('Use Access Token', () => {

  it('should use the access token for POST /merchant/Binding', async () => {
    try {
      // Dynamically import chai
      const { expect } = await import('chai');

      const token = getAccessToken(); // Retrieve the access token from the utility
      console.log('Using Token:', token);
      expect(token).to.not.be.undefined; // Ensure token is available

      const requestBody = {
        productCode: "mti_snap_direct_debit_bri_non",
        cardType: "EMONEY",
        customerName: "Refqi Test",
        mobileNumber: "081218244613",
        userId: "test0000006",
        redirectUrl: "https://apistaging.my-pertamina.id/finserv-payment/v1/success",
        callbackUrl: "https://myptm-direct-payment-service.vsan-apps.playcourt.id/direct-payment/v1/customer-payment-method/callback"
      };

      const timestamp = moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      const signature = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6InVjVjVzUlFTRG5Cd1JucjgiLCJjbGllbnRTZWNyZXQiOiJteXBlcnRhbWluYSIsImV4cGlyZXNJbiI6MTcwMjA5Njk2MX0.Bpg2hEo45XwMmX1GhYX_pN_EbwvvxCQKSGkv0z3PbfU'; // Replace with actual signature generation logic

      const response = await axios.post('https://partner-dev.linkaja.com/new-api/production/merchant/card/preRegistration', requestBody, {
        headers: {
          'AccessToken': `Bearer ${token}`, // Use the retrieved token
          'X-MID': '195269895344',
          'X-TIMESTAMP': timestamp,
          'X-SIGNATURE': signature,
          'PaymentType': 'NON-CC',
        },
      });

      console.log(response.data);

      // Check if registrationPage exists inside response.data.data
      if (response.data && response.data.data && response.data.data.registrationPage) {
        const registrationPage = response.data.data.registrationPage;
        setregistrationPage(registrationPage); // Save the registrationPage URL

        // Open the URL in the default browser
        const { default: open } = await import('open'); // Correctly import the 'open' module
        console.log('Opening URL:', registrationPage);
        open(registrationPage);

        // Wait for the page to load
        await driver.get(registrationPage);

        // Automate interactions on the opened page
        // Example: Find an element and interact with it
        // Replace 'elementId' with the actual ID of the element you want to interact with
        const someElement = await driver.findElement(By.id('elementId'));
        await someElement.sendKeys('Test input'); // Example interaction

        // Example assertion
        const resultElement = await driver.findElement(By.id('resultElementId')); // Replace with actual result element ID
        const resultText = await resultElement.getText();
        expect(resultText).to.equal('Expected Result'); // Replace with the expected result

      } else {
        console.error('No registrationPage found in the response');
      }

      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('object');

    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      throw error;
    }
  });
});
