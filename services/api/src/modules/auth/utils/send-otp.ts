import axios from 'axios';

const FAST2SMS_BULK_V2_URL = 'https://www.fast2sms.com/dev/bulkV2';
const FAST2SMS_TIMEOUT_MS = Number(process.env.FAST2SMS_TIMEOUT_MS || 15000);

const normalizeMobile = (value: string): string => value.replace(/\D/g, '');

/**
 * Send OTP via Fast2SMS.
 * Uses Quick Transactional route ('q') as primary method.
 * Falls back to DLT route if FAST2SMS_USE_DLT=true is set in .env
 * (once DLT template mapping is synced by Fast2SMS).
 */
export const sendOTP = async (mobile: string, otp: string): Promise<boolean> => {
    const apiKey = process.env.FAST2SMS_API_KEY;
    const normalizedMobile = normalizeMobile(mobile);
    const otpString = String(otp);

    if (!apiKey) {
        console.error('Fast2SMS API key is missing.');
        return false;
    }

    if (!/^\d{10}$/.test(normalizedMobile)) {
        console.error(`Invalid mobile format for Fast2SMS: ${mobile}`);
        return false;
    }

    const useDLT = process.env.FAST2SMS_USE_DLT !== 'false';

    try {
        let payload: Record<string, string | number>;

        if (useDLT) {
            // DLT route — use once Fast2SMS syncs your DLT template
            const senderId = process.env.FAST2SMS_SENDER_ID;
            const templateId = process.env.FAST2SMS_TEMPLATE_ID;
            if (!senderId || !templateId) {
                console.error('Fast2SMS DLT credentials (SENDER_ID / TEMPLATE_ID) are missing.');
                return false;
            }
            payload = {
                route: 'dlt',
                sender_id: senderId,
                message: templateId,
                variables_values: `${otpString}|`,
                flash: 0,
                numbers: normalizedMobile,
            };
        } else {
            // Quick Transactional route — works immediately with 100+ INR wallet
            const templateText = process.env.FAST2SMS_TEMPLATE_TEXT
                || `Your OTP for DoctorHelp login is ${otpString}. It is valid for 10 minutes.`;
            const message = templateText.replace(/\{#(var|VAR|numeric)#\}/g, otpString);
            payload = {
                route: 'q',
                message,
                language: 'english',
                flash: 0,
                numbers: normalizedMobile,
            };
        }

        console.info(`Fast2SMS [${useDLT ? 'DLT' : 'Quick'}] sending to ${normalizedMobile}`);

        const requestConfig = {
            params: {
                authorization: apiKey,
                ...payload,
            },
            timeout: FAST2SMS_TIMEOUT_MS,
        };

        // Retry once for transient network or timeout failures.
        const response = await axios.get(FAST2SMS_BULK_V2_URL, requestConfig).catch(async (firstError: any) => {
            const shouldRetry = !firstError?.response || firstError?.code === 'ECONNABORTED';
            if (!shouldRetry) {
                throw firstError;
            }
            console.warn('Fast2SMS first attempt failed, retrying once:', firstError?.code || firstError?.message);
            return axios.get(FAST2SMS_BULK_V2_URL, requestConfig);
        });

        const isSuccess = response.status >= 200 && response.status < 300 && response.data?.return === true;
        if (!isSuccess) {
            console.error('Fast2SMS send failed:', response.data);
        } else {
            console.info('Fast2SMS SMS sent successfully:', response.data.request_id);
        }

        return isSuccess;
    } catch (error: any) {
        const diagnostics = {
            code: error?.code,
            message: error?.message,
            status: error?.response?.status,
            data: error?.response?.data,
        };
        console.error('Fast2SMS send OTP error:', diagnostics);
        return false;
    }
};