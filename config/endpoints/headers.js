const commonHeaders = {
    'Glasseson-Native-App-Id': process.env.GLASSESON_NATIVE_APP_ID,
    'Glasseson-Profile-Name': process.env.GLASSESON_PROFILE_NAME,
    'Glasseson-Client-Id': process.env.GLASSESON_CLIENT_ID,
    'Glasseson-Flow-Id': process.env.GLASSESON_FLOW_ID,
    'Glasseson-User-Id': process.env.GLASSESON_USER_ID,
    'Glasseson-Session-Id': process.env.GLASSESON_SESSION_ID,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

const commonLmHeaders = {
    'Glasseson-Native-App-Id': process.env.GLASSESON_NATIVE_APP_ID_LM,
    'Glasseson-Profile-Name': process.env.GLASSESON_PROFILE_NAME_LM,
    'Glasseson-Client-Id': process.env.GLASSESON_CLIENT_ID_LM,
    'Glasseson-Flow-Id': process.env.GLASSESON_FLOW_ID_LM,
    'Glasseson-User-Id': process.env.GLASSESON_USER_ID_LM,
    'Glasseson-Session-Id': process.env.GLASSESON_SESSION_ID,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

const goeyesAndHeaders = {
    'Glasseson-Native-App-Id': process.env.GLASSESON_NATIVE_APP_ID,
    'Glasseson-Profile-Name': process.env.GLASSESON_PROFILE_NAME,
    'Glasseson-Client-Id': process.env.GLASSESON_CLIENT_ID,
    'Glasseson-Flow-Id': process.env.GLASSESON_FLOW_ID,
    'Glasseson-User-Id': process.env.GLASSESON_USER_ID,
    'Glasseson-Session-Id': process.env.GLASSESON_SESSION_ID,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

const attachmentsHeaders = {
    'Glasseson-Native-App-Id': process.env.GLASSESON_NATIVE_APP_ID_ATTACHMENTS,
    'Glasseson-Profile-Name': process.env.GLASSESON_PROFILE_NAME,
    'Glasseson-Client-Id': process.env.GLASSESON_CLIENT_ID,
    'Glasseson-Session-Id': process.env.GLASSESON_SESSION_ID_ATTACHMENTS,
    'Glasseson-Save-Id': process.env.GLASSESON_SAVE_ID_ATTACHMENTS,
    'Glasseson-File-Type': process.env.GLASSESON_FILE_TYPE_ATTACHMENTS,
    'X-Api-Key': process.env.X_API_KEY,
    'Content-Type': 'application/json'
};

const phiHeaders = {
    'X-Api-Key': process.env.PHI_API_KEY,
    'Content-Type': 'application/json'
};

const pdHeaders = {
    'Glasseson-Client-Id': process.env.GLASSESON_CLIENT_ID_PD,
    'Glasseson-Profile-Name': process.env.GLASSESON_PROFILE_NAME_PD,
    'Referer': process.env.GLASSESON_REFERER_PD,
    'Content-Type': 'application/json'
};

const pdHeadersNative = {
    'Glasseson-Client-Id': process.env.GLASSESON_CLIENT_ID_PD,
    'Glasseson-Profile-Name': process.env.GLASSESON_PROFILE_NAME_PD_NATIVE,
    'Glasseson-Native-App-Id': process.env.GLASSESON_NATIVE_APP_ID_PD_NATIVE,
    'Content-Type': 'application/json'
};

const pdHeadersVerify = {
    'Glasseson-Client-Id': process.env.GLASSESON_CLIENT_ID_PD,
    'Glasseson-Profile-Name': process.env.GLASSESON_PROFILE_NAME_PD,
    'Referer': process.env.GLASSESON_REFERER_PD,
    'Glasseson-Session-Id': process.env.GLASSESON_SESSION_ID,
    'Glasseson-Flow-Id': process.env.GLASSESON_FLOW_ID_PD,
};

const vaHeaders = {
    'Glasseson-Client-Id': process.env.GLASSESON_CLIENT_ID_VA,
    'Glasseson-Profile-Name': process.env.GLASSESON_PROFILE_NAME_VA,
    'Referer': process.env.GLASSESON_REFERER_VA,
    'Glasseson-Session-Id': process.env.GLASSESON_SESSION_ID,
    'Referer': process.env.GLASSESON_REFERER_VA,
    'Content-Type': 'application/json'
};

module.exports = {
    commonHeaders,
    commonLmHeaders,
    goeyesAndHeaders,
    attachmentsHeaders,
    phiHeaders,
    pdHeaders,
    pdHeadersNative,
    pdHeadersVerify,
    vaHeaders
}; 