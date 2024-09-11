const axios = require('axios').default;
const { setAccessToken, getAccessToken } = require('./savetoken.cjs');
const { setregistrationPage, getregistrationPage } = require('./RegistrationURL.cjs');
const moment = require('moment');
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');


before(async function() {
  this.timeout(10000); // Increase timeout to 10 seconds

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

    setAccessToken(response.data.accessToken);

    expect(response.status).to.equal(200);
    expect(response.data.accessToken).to.be.a('string');

    driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    throw error;
  }
});

const chromeOptions = new chrome.Options();
chromeOptions.addArguments('start-maximized');

let driver;

describe('Use Access Token', () => {

  it('should use the access token for POST /merchant/Binding', async () => {
    try {
      const { expect } = await import('chai');

      const token = getAccessToken();
      console.log('Using Token:', token);
      expect(token).to.not.be.undefined;

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
      const signature = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6InVjVjVzUlFTRG5Cd1JucjgiLCJjbGllbnRTZWNyZXQiOiJteXBlcnRhbWluYSIsImV4cGlyZXNJbiI6MTcwMjA5Njk2MX0.Bpg2hEo45XwMmX1GhYX_pN_EbwvvxCQKSGkv0z3PbfU';

      const response = await axios.post('https://partner-dev.linkaja.com/new-api/production/merchant/card/preRegistration', requestBody, {
        headers: {
          'AccessToken': `Bearer ${token}`,
          'X-MID': '195269895344',
          'X-TIMESTAMP': timestamp,
          'X-SIGNATURE': signature,
          'PaymentType': 'NON-CC',
        },
      });

      console.log(response.data);
      expect(response.status).to.equal(200);
      expect(response.data).to.be.an('object');
      
      if (response.data && response.data.data && response.data.data.registrationPage) {
        const registrationPage = response.data.data.registrationPage;
        setregistrationPage(registrationPage);

        console.log('Opening URL:', registrationPage);
        await driver.get(registrationPage);

        // Example interactions
        const someElement = await driver.findElement(By.id('elementId'));
        await someElement.sendKeys('Test input');

        const resultElement = await driver.findElement(By.id('resultElementId'));
        const resultText = await resultElement.getText();
        expect(resultText).to.equal('Expected Result');

      } else {
        console.error('No registrationPage found in the response');
      }

    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      throw error;
    }
  });
});

after(async () => {
  if (driver) {
    await driver.quit();
  }
});
