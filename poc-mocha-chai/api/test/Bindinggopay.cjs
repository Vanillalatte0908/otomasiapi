const axios = require('axios').default;
const { setAccessToken, getAccessToken } = require('./savetoken.cjs');
const { setregistrationPage, getregistrationPage } = require('./RegistrationURL.cjs'); // Import the URL utilityconst moment = require('moment');
const moment = require('moment'); // Import moment correctly


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
    
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    throw error;
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
        productCode: "direct_gopay",
        cardType: "EMONEY",
        customerName: "Refqi Test",
        mobileNumber: "087825252524",
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
          'X-TIMESTAMP':  timestamp,
          'X-SIGNATURE': signature,
          'PaymentType': 'NON-CC',
        },
      });

      console.log('Status:', response.status);
      console.log('Response Data:', response.data);

      if (response.data && response.data.data.registrationPage) {
        setregistrationPage(response.data.data.registrationPage); // Save the registrationPage URL
      } else {
        console.error('No registrationPage found in the response');
      }

      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('object');
      
      const registrationUrl = getregistrationPage();
      console.log('Opening URL:', registrationUrl);

      if (registrationUrl) {
        const open = await import('open');
        open.default(registrationUrl); // Use open.default for ESM default export
      } else {
        console.error('No registration URL found to open');
      }

    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      throw error;
    }
  });
});
