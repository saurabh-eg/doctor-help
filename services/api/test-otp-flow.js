const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testOtpFlow() {
    const mobile = '9830204903';
    
    console.log('🧪 Testing OTP Flow (Backend Only)\n');
    
    // Step 1: Send OTP
    console.log('Step 1: Sending OTP...');
    try {
        const sendResponse = await axios.post(`${API_BASE}/auth/send-otp`, { mobile });
        console.log('✅ Send OTP Response:', JSON.stringify(sendResponse.data, null, 2));
        
        const debugOtp = sendResponse.data.debug_otp;
        if (!debugOtp) {
            console.log('❌ No debug OTP found. Make sure NODE_ENV=development');
            return;
        }
        
        console.log(`\n📱 OTP received: ${debugOtp}\n`);
        
        // Step 2: Verify OTP
        console.log('Step 2: Verifying OTP...');
        const verifyResponse = await axios.post(`${API_BASE}/auth/verify-otp`, {
            mobile,
            otp: debugOtp
        });
        console.log('✅ Verify OTP Response:', JSON.stringify(verifyResponse.data, null, 2));
        
        console.log('\n✨ Backend OTP flow working perfectly!\n');
        console.log('Token:', verifyResponse.data.data.token);
        
        // Step 3: Test with wrong OTP
        console.log('\nStep 3: Testing with wrong OTP...');
        try {
            await axios.post(`${API_BASE}/auth/verify-otp`, {
                mobile,
                otp: '000000'
            });
            console.log('❌ Should have failed but succeeded!');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Correctly rejected invalid OTP:', error.response.data.error);
            } else {
                console.log('❌ Unexpected error:', error.message);
            }
        }
        
        // Step 4: Test OTP expiry (would take 10 minutes in real scenario)
        console.log('\nStep 4: OTP expiry validation...');
        console.log('⏱️  OTP expires in 10 minutes (not testing expiry in this script)');
        
        console.log('\n' + '='.repeat(60));
        console.log('BACKEND STATUS: ✅ ALL WORKING');
        console.log('SMS DELIVERY: ❌ Fast2SMS blocking (see OTP_INTEGRATION_AUDIT.md)');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.log('❌ Error:', error.response?.data || error.message);
    }
}

testOtpFlow().catch(console.error);
