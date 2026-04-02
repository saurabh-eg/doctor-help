import axios from 'axios';

const FAST2SMS_BULK_V2_URL = 'https://www.fast2sms.com/dev/bulkV2';
const FAST2SMS_TIMEOUT_MS = Number(process.env.FAST2SMS_TIMEOUT_MS || 15000);
type Fast2SmsRoute = 'q' | 'dlt';
type Fast2SmsRouteMode = 'auto' | 'quick' | 'dlt';

const normalizeMobile = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, '');

    // Accept common Indian formats: 10-digit local, +91XXXXXXXXXX, 91XXXXXXXXXX
    if (/^91\d{10}$/.test(digitsOnly)) {
        return digitsOnly.slice(2);
    }

    return digitsOnly;
};

const getRouteMode = (): Fast2SmsRouteMode => {
    const mode = (process.env.FAST2SMS_ROUTE_MODE || '').trim().toLowerCase();
    if (mode === 'quick') return 'quick';
    if (mode === 'dlt') return 'dlt';
    return 'auto';
};

const getRoutePlan = (mode: Fast2SmsRouteMode): Fast2SmsRoute[] => {
    if (mode === 'quick') return ['q'];
    if (mode === 'dlt') return ['dlt'];

    // Backward compatibility: keep FAST2SMS_USE_DLT as preference in auto mode.
    const preferDlt = process.env.FAST2SMS_USE_DLT !== 'false';
    return preferDlt ? ['dlt', 'q'] : ['q', 'dlt'];
};

const buildPayload = (
    route: Fast2SmsRoute,
    normalizedMobile: string,
    otpString: string,
): Record<string, string | number> | null => {
    if (route === 'dlt') {
        const senderId = process.env.FAST2SMS_SENDER_ID;
        const templateId = process.env.FAST2SMS_TEMPLATE_ID;
        if (!senderId || !templateId) {
            console.error('Fast2SMS DLT credentials (SENDER_ID / TEMPLATE_ID) are missing.');
            return null;
        }

        return {
            route: 'dlt',
            sender_id: senderId,
            message: templateId,
            variables_values: `${otpString}|`,
            flash: 0,
            numbers: normalizedMobile,
        };
    }

    const templateText = process.env.FAST2SMS_TEMPLATE_TEXT
        || `Your OTP for DoctorHelp login is ${otpString}. It is valid for 10 minutes.`;
    const message = templateText.replace(/\{#(var|VAR|numeric)#\}/g, otpString);
    return {
        route: 'q',
        message,
        language: 'english',
        flash: 0,
        numbers: normalizedMobile,
    };
};

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

    const routeMode = getRouteMode();
    const routesToTry = getRoutePlan(routeMode);

    try {
        let lastDiagnostics: unknown = null;

        for (const route of routesToTry) {
            const payload = buildPayload(route, normalizedMobile, otpString);
            if (!payload) {
                if (routeMode !== 'auto') return false;
                continue;
            }

            console.info(`Fast2SMS [${route === 'dlt' ? 'DLT' : 'Quick'}] sending to ${normalizedMobile}`);

            const requestConfig = {
                params: {
                    authorization: apiKey,
                    ...payload,
                },
                timeout: FAST2SMS_TIMEOUT_MS,
            };

            try {
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
                if (isSuccess) {
                    console.info('Fast2SMS SMS sent successfully:', response.data.request_id);
                    return true;
                }

                lastDiagnostics = response.data;
                console.error(`Fast2SMS ${route.toUpperCase()} send failed:`, response.data);
            } catch (error: any) {
                lastDiagnostics = {
                    code: error?.code,
                    message: error?.message,
                    status: error?.response?.status,
                    data: error?.response?.data,
                };
                console.error(`Fast2SMS ${route.toUpperCase()} send OTP error:`, lastDiagnostics);
            }

            if (routeMode !== 'auto') {
                break;
            }
        }

        console.error('Fast2SMS failed on all configured routes.', { routeMode, routesToTry, lastDiagnostics });
        return false;
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