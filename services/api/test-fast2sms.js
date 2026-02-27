const axios = require('axios');
require('dotenv').config();

const FAST2SMS_BULK_V2_URL = 'https://www.fast2sms.com/dev/bulkV2';
const normalizeMobile = (value) => String(value || '').replace(/\D/g, '');

async function testFast2SMS() {
    const apiKey = process.env.FAST2SMS_API_KEY;
    const senderId = process.env.FAST2SMS_SENDER_ID;
    const templateId = process.env.FAST2SMS_TEMPLATE_ID;

    console.log('Environment variables:');
    console.log('API KEY:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
    console.log('SENDER_ID:', senderId);
    console.log('TEMPLATE_ID:', templateId);
    console.log('\n---\n');

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const mobile = normalizeMobile('9830204903');

    console.log('Single Test: Final DLT payload (message as template id)');
    console.log('OTP type:', typeof otp);
    console.log('Mobile:', mobile, '| length:', mobile.length);

    if (!/^\d{10}$/.test(mobile)) {
        console.log('❌ FAILED: mobile must be exactly 10 digits');
        process.exit(1);
    }

    try {
        const payload = {
            route: 'dlt',
            sender_id: senderId,
            message: templateId,
            variables_values: String(otp),
            numbers: mobile,
        };
        console.log('Payload:', JSON.stringify(payload, null, 2));
        const response = await axios.post(FAST2SMS_BULK_V2_URL, payload, {
            headers: {
                authorization: apiKey,
                'Content-Type': 'application/json',
            },
        });
        console.log('✅ SUCCESS:', response.data);
    } catch (error) {
        console.log('❌ FAILED:', error.response?.data || error.message);
    }
}

testFast2SMS().catch(console.error);
