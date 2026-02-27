const axios = require('axios');
require('dotenv').config();

const URL = 'https://www.fast2sms.com/dev/bulkV2';
const apiKey = process.env.FAST2SMS_API_KEY;
const headers = { authorization: apiKey, 'Content-Type': 'application/json' };

const otp = '123456';
const mobile = '9830204903';
const senderId = 'DTRHLP';
const templateId = '1007168696952182853';
const entityId = '1001046312350943743';

const tests = [
    {
        name: '1. message=templateId (current)',
        payload: { route: 'dlt', sender_id: senderId, message: templateId, variables_values: otp, numbers: mobile },
    },
    {
        name: '2. message=templateId + entity_id',
        payload: { route: 'dlt', sender_id: senderId, message: templateId, variables_values: otp, numbers: mobile, entity_id: entityId },
    },
    {
        name: '3. template_id (original)',
        payload: { route: 'dlt', sender_id: senderId, template_id: templateId, variables_values: otp, numbers: mobile },
    },
    {
        name: '4. template_id + entity_id',
        payload: { route: 'dlt', sender_id: senderId, template_id: templateId, entity_id: entityId, variables_values: otp, numbers: mobile },
    },
    {
        name: '5. message_id=templateId',
        payload: { route: 'dlt', sender_id: senderId, message_id: templateId, variables_values: otp, numbers: mobile },
    },
    {
        name: '6. message_id + entity_id',
        payload: { route: 'dlt', sender_id: senderId, message_id: templateId, entity_id: entityId, variables_values: otp, numbers: mobile },
    },
    {
        name: '7. message=templateId + flash=0',
        payload: { route: 'dlt', sender_id: senderId, message: templateId, variables_values: otp, numbers: mobile, flash: '0' },
    },
    {
        name: '8. message=templateId + variables_values pipe-separated',
        payload: { route: 'dlt', sender_id: senderId, message: templateId, variables_values: otp + '|', numbers: mobile },
    },
    {
        name: '9. message=full text with OTP + template_id',
        payload: { route: 'dlt', sender_id: senderId, message: 'Your OTP for DoctorHelp login is ' + otp + '. It is valid for 10 minutes.', template_id: templateId, entity_id: entityId, variables_values: otp, numbers: mobile },
    },
    {
        name: '10. OTP route (non-DLT fallback)',
        payload: { route: 'otp', variables_values: otp, numbers: mobile },
    },
    {
        name: '11. Quick Transactional (non-DLT fallback)',
        payload: { route: 'q', message: 'Your OTP for DoctorHelp login is ' + otp + '. It is valid for 10 minutes.', language: 'english', flash: 0, numbers: mobile },
    },
];

(async () => {
    for (const test of tests) {
        console.log(`\n--- ${test.name} ---`);
        console.log('Payload:', JSON.stringify(test.payload));
        try {
            const res = await axios.post(URL, test.payload, { headers });
            console.log('✅ SUCCESS:', JSON.stringify(res.data));
        } catch (err) {
            const d = err.response?.data;
            console.log('❌ FAILED:', d ? JSON.stringify(d) : err.message);
        }
    }
    console.log('\n=== DONE ===');
})();
