const { test, expect } = require('@playwright/test');
const { endpoints, commonHeaders } = require('../config/endpoints');
const { initializeTestEnvironment, getEndpointsToTest, executeRequest, getTestTitle } = require('./helpers/testUtils');
const fs = require('fs');
const FormData = require('form-data');
const https = require('https');

const selectedEndpoints = initializeTestEnvironment();

// Ensure BASE_URL is set
if (!process.env.BASE_URL) {
    console.warn('BASE_URL environment variable is not set. Using default: http://localhost:3000');
    process.env.BASE_URL = 'http://localhost:3000';
}

// What's in this file?
// Test to verify the attachments upload functionality:
// 1. Verify the API returns a 200 status code and S3 upload details
// 2. Verify the S3 presigned URL is valid and contains required fields
// 3. Verify successful file upload to S3 using the presigned URL
// 4. Verify the upload response returns 204 status code

test.describe('Attachments Upload Validation', () => {
    const endpointsToTest = getEndpointsToTest(endpoints, selectedEndpoints);

    for (const endpoint of endpointsToTest) {
        /**
         * Test to verify the attachments upload flow
         * Verifies that:
         * - Initial response status is 200
         * - Response contains valid S3 upload details
         * - S3 presigned URL and fields are present
         * - File upload to S3 is successful (204)
         */
        test(getTestTitle('Upload Attachments And Verify 204 Status', endpoint), async ({ request }) => {
            const headers = endpoint.config.requiredHeaders;
        
            // First request: Get S3 upload details
            const response = await executeRequest(test, request, endpoint, headers);
            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
        
            const body = await response.json();
            console.log("✅ Got response from main endpoint");
        
            const s3Data = body.s3_objects?.[0];
            expect(s3Data).toBeTruthy();
        
            const s3Url = s3Data.url;
            const fields = s3Data.fields;
        
            console.log("➡️ S3 Upload URL:", s3Url);
            console.log("🧾 S3 Fields:", fields);
            console.log("🔑 Key:", fields.key);
        
            // Verify file exists
            const filePath = endpoint.config.uploadFilePath;
            console.log("📁 Upload file path:", filePath);
            const fileExists = fs.existsSync(filePath);
            console.log("✅ File exists:", fileExists);
            expect(fileExists).toBeTruthy();

            // Create form data
            const form = new FormData();
            
            // Add all S3 fields first
            for (const [key, value] of Object.entries(fields)) {
                console.log(`📎 Appending field: ${key}`);
                form.append(key, value);
            }

            // Add file last, exactly like Python requests
            const fileBuffer = fs.readFileSync(filePath);
            form.append('file', fileBuffer, {
                filename: '0',
                contentType: 'application/octet-stream'
            });

            console.log("⏳ Sending upload request to S3...");

            // Get form length
            const formLength = await new Promise((resolve, reject) => {
                form.getLength((err, length) => {
                    if (err) reject(err);
                    resolve(length);
                });
            });

            // Create a Promise to handle the form submission
            const uploadPromise = new Promise((resolve, reject) => {
                const formHeaders = form.getHeaders();
                formHeaders['content-length'] = formLength;
                
                console.log("📋 Form Headers:", formHeaders);

                const url = new URL(s3Url);
                const options = {
                    method: 'POST',
                    host: url.hostname,
                    path: url.pathname + url.search,
                    headers: formHeaders
                };

                const req = https.request(options, (res) => {
                    let responseBody = '';
                    res.on('data', chunk => { responseBody += chunk; });
                    res.on('end', () => {
                        resolve({
                            status: res.statusCode,
                            body: responseBody,
                            headers: res.headers
                        });
                    });
                });

                req.on('error', (error) => {
                    reject(error);
                });

                form.pipe(req);
            });

            const uploadResponse = await uploadPromise;
            console.log("📬 S3 Upload Status:", uploadResponse.status);
            
            if (uploadResponse.status !== 204) {
                console.log("❌ Upload failed");
                console.log("📄 S3 Upload Response Body:", uploadResponse.body);
            } else {
                console.log("✅ Upload successful");
            }

            expect(uploadResponse.status).toBe(204);
        });

        test(getTestTitle('Upload Attachments With Missing File', endpoint), async ({ request }) => {
            const headers = endpoint.config.requiredHeaders;
        
            // First request: Get S3 upload details
            const response = await executeRequest(test, request, endpoint, headers);
            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
        
            const body = await response.json();
            console.log("✅ Got response from main endpoint");
        
            const s3Data = body.s3_objects?.[0];
            expect(s3Data).toBeTruthy();
        
            const s3Url = s3Data.url;
            const fields = s3Data.fields;
        
            console.log("➡️ S3 Upload URL:", s3Url);
            console.log("🧾 S3 Fields:", fields);
            console.log("🔑 Key:", fields.key);

            // Create form data without the file
            const form = new FormData();
            
            // Add all S3 fields
            for (const [key, value] of Object.entries(fields)) {
                console.log(`📎 Appending field: ${key}`);
                form.append(key, value);
            }

            console.log("⏳ Sending upload request to S3 without file...");

            // Get form length
            const formLength = await new Promise((resolve, reject) => {
                form.getLength((err, length) => {
                    if (err) reject(err);
                    resolve(length);
                });
            });

            // Create a Promise to handle the form submission
            const uploadPromise = new Promise((resolve, reject) => {
                const formHeaders = form.getHeaders();
                formHeaders['content-length'] = formLength;
                
                console.log("📋 Form Headers:", formHeaders);

                const url = new URL(s3Url);
                const options = {
                    method: 'POST',
                    host: url.hostname,
                    path: url.pathname + url.search,
                    headers: formHeaders
                };

                const req = https.request(options, (res) => {
                    let responseBody = '';
                    res.on('data', chunk => { responseBody += chunk; });
                    res.on('end', () => {
                        resolve({
                            status: res.statusCode,
                            body: responseBody,
                            headers: res.headers
                        });
                    });
                });

                req.on('error', (error) => {
                    reject(error);
                });

                form.pipe(req);
            });

            const uploadResponse = await uploadPromise;
            console.log("📬 S3 Upload Status:", uploadResponse.status);
            console.log("📄 S3 Upload Response Body:", uploadResponse.body);

            // Verify the error response
            expect(uploadResponse.status).toBe(400);
            expect(uploadResponse.body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(uploadResponse.body).toContain('<Error>');
            expect(uploadResponse.body).toContain('<Code>InvalidArgument</Code>');
            expect(uploadResponse.body).toContain('<Message>POST requires exactly one file upload per request.</Message>');
            expect(uploadResponse.body).toContain('<ArgumentName>file</ArgumentName>');
            expect(uploadResponse.body).toContain('<RequestId>');
            expect(uploadResponse.body).toContain('<HostId>');
        });

        test(getTestTitle('Upload Attachments With Missing AWSAccessKeyId', endpoint), async ({ request }) => {
            const headers = endpoint.config.requiredHeaders;
        
            // First request: Get S3 upload details
            const response = await executeRequest(test, request, endpoint, headers);
            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
        
            const body = await response.json();
            console.log("✅ Got response from main endpoint");
        
            const s3Data = body.s3_objects?.[0];
            expect(s3Data).toBeTruthy();
        
            const s3Url = s3Data.url;
            const fields = s3Data.fields;
        
            console.log("➡️ S3 Upload URL:", s3Url);
            console.log("🧾 S3 Fields:", fields);
            console.log("🔑 Key:", fields.key);

            // Create form data without AWSAccessKeyId
            const form = new FormData();
            
            // Add all S3 fields except AWSAccessKeyId
            for (const [key, value] of Object.entries(fields)) {
                if (key !== 'AWSAccessKeyId') {
                    console.log(`📎 Appending field: ${key}`);
                    form.append(key, value);
                }
            }

            // Add the file
            const filePath = endpoint.config.uploadFilePath;
            const fileBuffer = fs.readFileSync(filePath);
            form.append('file', fileBuffer, {
                filename: '0',
                contentType: 'application/octet-stream'
            });

            console.log("⏳ Sending upload request to S3 without AWSAccessKeyId...");

            // Get form length
            const formLength = await new Promise((resolve, reject) => {
                form.getLength((err, length) => {
                    if (err) reject(err);
                    resolve(length);
                });
            });

            // Create a Promise to handle the form submission
            const uploadPromise = new Promise((resolve, reject) => {
                const formHeaders = form.getHeaders();
                formHeaders['content-length'] = formLength;
                
                console.log("📋 Form Headers:", formHeaders);

                const url = new URL(s3Url);
                const options = {
                    method: 'POST',
                    host: url.hostname,
                    path: url.pathname + url.search,
                    headers: formHeaders
                };

                const req = https.request(options, (res) => {
                    let responseBody = '';
                    res.on('data', chunk => { responseBody += chunk; });
                    res.on('end', () => {
                        resolve({
                            status: res.statusCode,
                            body: responseBody,
                            headers: res.headers
                        });
                    });
                });

                req.on('error', (error) => {
                    reject(error);
                });

                form.pipe(req);
            });

            const uploadResponse = await uploadPromise;
            console.log("📬 S3 Upload Status:", uploadResponse.status);
            console.log("📄 S3 Upload Response Body:", uploadResponse.body);

            // Verify the error response
            expect(uploadResponse.status).toBe(400);
            expect(uploadResponse.body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(uploadResponse.body).toContain('<Error>');
            expect(uploadResponse.body).toContain('<Code>InvalidArgument</Code>');
            expect(uploadResponse.body).toContain('<Message>Bucket POST must contain a field named \'AWSAccessKeyId\'.  If it is specified, please check the order of the fields.</Message>');
            expect(uploadResponse.body).toContain('<ArgumentName>AWSAccessKeyId</ArgumentName>');
            expect(uploadResponse.body).toContain('<ArgumentValue></ArgumentValue>');
            expect(uploadResponse.body).toContain('<RequestId>');
            expect(uploadResponse.body).toContain('<HostId>');
        });

        test(getTestTitle('Upload Attachments With Invalid AWSAccessKeyId', endpoint), async ({ request }) => {
            const headers = endpoint.config.requiredHeaders;
        
            // First request: Get S3 upload details
            const response = await executeRequest(test, request, endpoint, headers);
            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
        
            const body = await response.json();
            console.log("✅ Got response from main endpoint");
        
            const s3Data = body.s3_objects?.[0];
            expect(s3Data).toBeTruthy();
        
            const s3Url = s3Data.url;
            const fields = s3Data.fields;
        
            console.log("➡️ S3 Upload URL:", s3Url);
            console.log("🧾 S3 Fields:", fields);
            console.log("🔑 Key:", fields.key);

            // Create form data with invalid AWSAccessKeyId
            const form = new FormData();
            
            // Add all S3 fields with invalid AWSAccessKeyId
            for (const [key, value] of Object.entries(fields)) {
                if (key === 'AWSAccessKeyId') {
                    console.log(`📎 Appending invalid field: ${key}`);
                    form.append(key, 'INVALID_ACCESS_KEY');
                } else {
                    console.log(`📎 Appending field: ${key}`);
                    form.append(key, value);
                }
            }

            // Add the file
            const filePath = endpoint.config.uploadFilePath;
            const fileBuffer = fs.readFileSync(filePath);
            form.append('file', fileBuffer, {
                filename: '0',
                contentType: 'application/octet-stream'
            });

            console.log("⏳ Sending upload request to S3 with invalid AWSAccessKeyId...");

            // Get form length
            const formLength = await new Promise((resolve, reject) => {
                form.getLength((err, length) => {
                    if (err) reject(err);
                    resolve(length);
                });
            });

            // Create a Promise to handle the form submission
            const uploadPromise = new Promise((resolve, reject) => {
                const formHeaders = form.getHeaders();
                formHeaders['content-length'] = formLength;
                
                console.log("📋 Form Headers:", formHeaders);

                const url = new URL(s3Url);
                const options = {
                    method: 'POST',
                    host: url.hostname,
                    path: url.pathname + url.search,
                    headers: formHeaders
                };

                const req = https.request(options, (res) => {
                    let responseBody = '';
                    res.on('data', chunk => { responseBody += chunk; });
                    res.on('end', () => {
                        resolve({
                            status: res.statusCode,
                            body: responseBody,
                            headers: res.headers
                        });
                    });
                });

                req.on('error', (error) => {
                    reject(error);
                });

                form.pipe(req);
            });

            const uploadResponse = await uploadPromise;
            console.log("📬 S3 Upload Status:", uploadResponse.status);
            console.log("📄 S3 Upload Response Body:", uploadResponse.body);

            // Verify the error response
            expect(uploadResponse.status).toBe(403);
            expect(uploadResponse.body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(uploadResponse.body).toContain('<Error>');
            expect(uploadResponse.body).toContain('<Code>InvalidAccessKeyId</Code>');
            expect(uploadResponse.body).toContain('<Message>The AWS Access Key Id you provided does not exist in our records.</Message>');
            expect(uploadResponse.body).toContain('<AWSAccessKeyId>');
            expect(uploadResponse.body).toContain('</AWSAccessKeyId>');
            expect(uploadResponse.body).toContain('<RequestId>');
            expect(uploadResponse.body).toContain('<HostId>');
        });

        test(getTestTitle('Upload Attachments With Missing x-amz-security-token', endpoint), async ({ request }) => {
            const headers = endpoint.config.requiredHeaders;
        
            // First request: Get S3 upload details
            const response = await executeRequest(test, request, endpoint, headers);
            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
        
            const body = await response.json();
            console.log("✅ Got response from main endpoint");
        
            const s3Data = body.s3_objects?.[0];
            expect(s3Data).toBeTruthy();
        
            const s3Url = s3Data.url;
            const fields = s3Data.fields;
        
            console.log("➡️ S3 Upload URL:", s3Url);
            console.log("🧾 S3 Fields:", fields);
            console.log("🔑 Key:", fields.key);

            // Create form data without x-amz-security-token
            const form = new FormData();
            
            // Add all S3 fields except x-amz-security-token
            for (const [key, value] of Object.entries(fields)) {
                if (key !== 'x-amz-security-token') {
                    console.log(`📎 Appending field: ${key}`);
                    form.append(key, value);
                }
            }

            // Add the file
            const filePath = endpoint.config.uploadFilePath;
            const fileBuffer = fs.readFileSync(filePath);
            form.append('file', fileBuffer, {
                filename: '0',
                contentType: 'application/octet-stream'
            });

            console.log("⏳ Sending upload request to S3 without x-amz-security-token...");

            // Get form length
            const formLength = await new Promise((resolve, reject) => {
                form.getLength((err, length) => {
                    if (err) reject(err);
                    resolve(length);
                });
            });

            // Create a Promise to handle the form submission
            const uploadPromise = new Promise((resolve, reject) => {
                const formHeaders = form.getHeaders();
                formHeaders['content-length'] = formLength;
                
                console.log("📋 Form Headers:", formHeaders);

                const url = new URL(s3Url);
                const options = {
                    method: 'POST',
                    host: url.hostname,
                    path: url.pathname + url.search,
                    headers: formHeaders
                };

                const req = https.request(options, (res) => {
                    let responseBody = '';
                    res.on('data', chunk => { responseBody += chunk; });
                    res.on('end', () => {
                        resolve({
                            status: res.statusCode,
                            body: responseBody,
                            headers: res.headers
                        });
                    });
                });

                req.on('error', (error) => {
                    reject(error);
                });

                form.pipe(req);
            });

            const uploadResponse = await uploadPromise;
            console.log("📬 S3 Upload Status:", uploadResponse.status);
            console.log("📄 S3 Upload Response Body:", uploadResponse.body);

            // Verify the error response
            expect(uploadResponse.status).toBe(403);
            expect(uploadResponse.body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(uploadResponse.body).toContain('<Error>');
            expect(uploadResponse.body).toContain('<Code>InvalidAccessKeyId</Code>');
            expect(uploadResponse.body).toContain('<Message>The AWS Access Key Id you provided does not exist in our records.</Message>');
            expect(uploadResponse.body).toContain('<AWSAccessKeyId>');
            expect(uploadResponse.body).toContain('</AWSAccessKeyId>');
            expect(uploadResponse.body).toContain('<RequestId>');
            expect(uploadResponse.body).toContain('<HostId>');
        });

        test(getTestTitle('Upload Attachments With Invalid x-amz-security-token', endpoint), async ({ request }) => {
            const headers = endpoint.config.requiredHeaders;
        
            // First request: Get S3 upload details
            const response = await executeRequest(test, request, endpoint, headers);
            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
        
            const body = await response.json();
            console.log("✅ Got response from main endpoint");
        
            const s3Data = body.s3_objects?.[0];
            expect(s3Data).toBeTruthy();
        
            const s3Url = s3Data.url;
            const fields = s3Data.fields;
        
            console.log("➡️ S3 Upload URL:", s3Url);
            console.log("🧾 S3 Fields:", fields);
            console.log("🔑 Key:", fields.key);

            // Create form data with invalid x-amz-security-token
            const form = new FormData();
            
            // Add all S3 fields with invalid x-amz-security-token
            for (const [key, value] of Object.entries(fields)) {
                if (key === 'x-amz-security-token') {
                    console.log(`📎 Appending invalid field: ${key}`);
                    form.append(key, 'INVALID_SECURITY_TOKEN');
                } else {
                    console.log(`📎 Appending field: ${key}`);
                    form.append(key, value);
                }
            }

            // Add the file
            const filePath = endpoint.config.uploadFilePath;
            const fileBuffer = fs.readFileSync(filePath);
            form.append('file', fileBuffer, {
                filename: '0',
                contentType: 'application/octet-stream'
            });

            console.log("⏳ Sending upload request to S3 with invalid x-amz-security-token...");

            // Get form length
            const formLength = await new Promise((resolve, reject) => {
                form.getLength((err, length) => {
                    if (err) reject(err);
                    resolve(length);
                });
            });

            // Create a Promise to handle the form submission
            const uploadPromise = new Promise((resolve, reject) => {
                const formHeaders = form.getHeaders();
                formHeaders['content-length'] = formLength;
                
                console.log("📋 Form Headers:", formHeaders);

                const url = new URL(s3Url);
                const options = {
                    method: 'POST',
                    host: url.hostname,
                    path: url.pathname + url.search,
                    headers: formHeaders
                };

                const req = https.request(options, (res) => {
                    let responseBody = '';
                    res.on('data', chunk => { responseBody += chunk; });
                    res.on('end', () => {
                        resolve({
                            status: res.statusCode,
                            body: responseBody,
                            headers: res.headers
                        });
                    });
                });

                req.on('error', (error) => {
                    reject(error);
                });

                form.pipe(req);
            });

            const uploadResponse = await uploadPromise;
            console.log("📬 S3 Upload Status:", uploadResponse.status);
            console.log("📄 S3 Upload Response Body:", uploadResponse.body);

            // Verify the error response
            expect(uploadResponse.status).toBe(400);
            expect(uploadResponse.body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(uploadResponse.body).toContain('<Error>');
            expect(uploadResponse.body).toContain('<Code>InvalidToken</Code>');
            expect(uploadResponse.body).toContain('<Message>The provided token is malformed or otherwise invalid.</Message>');
            expect(uploadResponse.body).toContain('<Token-0>');
            expect(uploadResponse.body).toContain('</Token-0>');
            expect(uploadResponse.body).toContain('<RequestId>');
            expect(uploadResponse.body).toContain('<HostId>');
        });

        test(getTestTitle('Upload Attachments With Missing Policy', endpoint), async ({ request }) => {
            const headers = endpoint.config.requiredHeaders;
        
            // First request: Get S3 upload details
            const response = await executeRequest(test, request, endpoint, headers);
            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
        
            const body = await response.json();
            console.log("✅ Got response from main endpoint");
        
            const s3Data = body.s3_objects?.[0];
            expect(s3Data).toBeTruthy();
        
            const s3Url = s3Data.url;
            const fields = s3Data.fields;
        
            console.log("➡️ S3 Upload URL:", s3Url);
            console.log("🧾 S3 Fields:", fields);
            console.log("🔑 Key:", fields.key);

            // Create form data without policy
            const form = new FormData();
            
            // Add all S3 fields except policy
            for (const [key, value] of Object.entries(fields)) {
                if (key !== 'policy') {
                    console.log(`📎 Appending field: ${key}`);
                    form.append(key, value);
                }
            }

            // Add the file
            const filePath = endpoint.config.uploadFilePath;
            const fileBuffer = fs.readFileSync(filePath);
            form.append('file', fileBuffer, {
                filename: '0',
                contentType: 'application/octet-stream'
            });

            console.log("⏳ Sending upload request to S3 without policy...");

            // Get form length
            const formLength = await new Promise((resolve, reject) => {
                form.getLength((err, length) => {
                    if (err) reject(err);
                    resolve(length);
                });
            });

            // Create a Promise to handle the form submission
            const uploadPromise = new Promise((resolve, reject) => {
                const formHeaders = form.getHeaders();
                formHeaders['content-length'] = formLength;
                
                console.log("📋 Form Headers:", formHeaders);

                const url = new URL(s3Url);
                const options = {
                    method: 'POST',
                    host: url.hostname,
                    path: url.pathname + url.search,
                    headers: formHeaders
                };

                const req = https.request(options, (res) => {
                    let responseBody = '';
                    res.on('data', chunk => { responseBody += chunk; });
                    res.on('end', () => {
                        resolve({
                            status: res.statusCode,
                            body: responseBody,
                            headers: res.headers
                        });
                    });
                });

                req.on('error', (error) => {
                    reject(error);
                });

                form.pipe(req);
            });

            const uploadResponse = await uploadPromise;
            console.log("📬 S3 Upload Status:", uploadResponse.status);
            console.log("📄 S3 Upload Response Body:", uploadResponse.body);

            // Verify the error response
            expect(uploadResponse.status).toBe(400);
            expect(uploadResponse.body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(uploadResponse.body).toContain('<Error>');
            expect(uploadResponse.body).toContain('<Code>InvalidArgument</Code>');
            expect(uploadResponse.body).toContain('<Message>Bucket POST must contain a field named \'policy\'.  If it is specified, please check the order of the fields.</Message>');
            expect(uploadResponse.body).toContain('<ArgumentName>policy</ArgumentName>');
            expect(uploadResponse.body).toContain('<ArgumentValue></ArgumentValue>');
            expect(uploadResponse.body).toContain('<RequestId>');
            expect(uploadResponse.body).toContain('<HostId>');
        });

        test(getTestTitle('Upload Attachments With Invalid Policy', endpoint), async ({ request }) => {
            const headers = endpoint.config.requiredHeaders;
        
            // First request: Get S3 upload details
            const response = await executeRequest(test, request, endpoint, headers);
            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
        
            const body = await response.json();
            console.log("✅ Got response from main endpoint");
        
            const s3Data = body.s3_objects?.[0];
            expect(s3Data).toBeTruthy();
        
            const s3Url = s3Data.url;
            const fields = s3Data.fields;
        
            console.log("➡️ S3 Upload URL:", s3Url);
            console.log("🧾 S3 Fields:", fields);
            console.log("🔑 Key:", fields.key);

            // Create form data with invalid policy
            const form = new FormData();
            
            // Add all S3 fields with invalid policy
            for (const [key, value] of Object.entries(fields)) {
                if (key === 'policy') {
                    console.log(`📎 Appending invalid field: ${key}`);
                    form.append(key, 'INVALID_POLICY');
                } else {
                    console.log(`📎 Appending field: ${key}`);
                    form.append(key, value);
                }
            }

            // Add the file
            const filePath = endpoint.config.uploadFilePath;
            const fileBuffer = fs.readFileSync(filePath);
            form.append('file', fileBuffer, {
                filename: '0',
                contentType: 'application/octet-stream'
            });

            console.log("⏳ Sending upload request to S3 with invalid policy...");

            // Get form length
            const formLength = await new Promise((resolve, reject) => {
                form.getLength((err, length) => {
                    if (err) reject(err);
                    resolve(length);
                });
            });

            // Create a Promise to handle the form submission
            const uploadPromise = new Promise((resolve, reject) => {
                const formHeaders = form.getHeaders();
                formHeaders['content-length'] = formLength;
                
                console.log("📋 Form Headers:", formHeaders);

                const url = new URL(s3Url);
                const options = {
                    method: 'POST',
                    host: url.hostname,
                    path: url.pathname + url.search,
                    headers: formHeaders
                };

                const req = https.request(options, (res) => {
                    let responseBody = '';
                    res.on('data', chunk => { responseBody += chunk; });
                    res.on('end', () => {
                        resolve({
                            status: res.statusCode,
                            body: responseBody,
                            headers: res.headers
                        });
                    });
                });

                req.on('error', (error) => {
                    reject(error);
                });

                form.pipe(req);
            });

            const uploadResponse = await uploadPromise;
            console.log("📬 S3 Upload Status:", uploadResponse.status);
            console.log("📄 S3 Upload Response Body:", uploadResponse.body);

            // Verify the error response
            expect(uploadResponse.status).toBe(403);
            expect(uploadResponse.body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(uploadResponse.body).toContain('<Error>');
            expect(uploadResponse.body).toContain('<Code>SignatureDoesNotMatch</Code>');
            expect(uploadResponse.body).toContain('<Message>The request signature we calculated does not match the signature you provided. Check your key and signing method.</Message>');
            expect(uploadResponse.body).toContain('<AWSAccessKeyId>');
            expect(uploadResponse.body).toContain('</AWSAccessKeyId>');
            expect(uploadResponse.body).toContain('<StringToSign>INVALID_POLICY</StringToSign>');
            expect(uploadResponse.body).toContain('<SignatureProvided>');
            expect(uploadResponse.body).toContain('</SignatureProvided>');
            expect(uploadResponse.body).toContain('<StringToSignBytes>');
            expect(uploadResponse.body).toContain('</StringToSignBytes>');
            expect(uploadResponse.body).toContain('<RequestId>');
            expect(uploadResponse.body).toContain('<HostId>');
        });

        test(getTestTitle('Upload Attachments With Missing Signature', endpoint), async ({ request }) => {
            const headers = endpoint.config.requiredHeaders;
        
            // First request: Get S3 upload details
            const response = await executeRequest(test, request, endpoint, headers);
            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
        
            const body = await response.json();
            console.log("✅ Got response from main endpoint");
        
            const s3Data = body.s3_objects?.[0];
            expect(s3Data).toBeTruthy();
        
            const s3Url = s3Data.url;
            const fields = s3Data.fields;
        
            console.log("➡️ S3 Upload URL:", s3Url);
            console.log("🧾 S3 Fields:", fields);
            console.log("🔑 Key:", fields.key);

            // Create form data without signature
            const form = new FormData();
            
            // Add all S3 fields except signature
            for (const [key, value] of Object.entries(fields)) {
                if (key !== 'signature') {
                    console.log(`📎 Appending field: ${key}`);
                    form.append(key, value);
                }
            }

            // Add the file
            const filePath = endpoint.config.uploadFilePath;
            const fileBuffer = fs.readFileSync(filePath);
            form.append('file', fileBuffer, {
                filename: '0',
                contentType: 'application/octet-stream'
            });

            console.log("⏳ Sending upload request to S3 without signature...");

            // Get form length
            const formLength = await new Promise((resolve, reject) => {
                form.getLength((err, length) => {
                    if (err) reject(err);
                    resolve(length);
                });
            });

            // Create a Promise to handle the form submission
            const uploadPromise = new Promise((resolve, reject) => {
                const formHeaders = form.getHeaders();
                formHeaders['content-length'] = formLength;
                
                console.log("📋 Form Headers:", formHeaders);

                const url = new URL(s3Url);
                const options = {
                    method: 'POST',
                    host: url.hostname,
                    path: url.pathname + url.search,
                    headers: formHeaders
                };

                const req = https.request(options, (res) => {
                    let responseBody = '';
                    res.on('data', chunk => { responseBody += chunk; });
                    res.on('end', () => {
                        resolve({
                            status: res.statusCode,
                            body: responseBody,
                            headers: res.headers
                        });
                    });
                });

                req.on('error', (error) => {
                    reject(error);
                });

                form.pipe(req);
            });

            const uploadResponse = await uploadPromise;
            console.log("📬 S3 Upload Status:", uploadResponse.status);
            console.log("📄 S3 Upload Response Body:", uploadResponse.body);

            // Verify the error response
            expect(uploadResponse.status).toBe(400);
            expect(uploadResponse.body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(uploadResponse.body).toContain('<Error>');
            expect(uploadResponse.body).toContain('<Code>InvalidArgument</Code>');
            expect(uploadResponse.body).toContain('<Message>Bucket POST must contain a field named \'Signature\'.  If it is specified, please check the order of the fields.</Message>');
            expect(uploadResponse.body).toContain('<ArgumentName>Signature</ArgumentName>');
            expect(uploadResponse.body).toContain('<ArgumentValue></ArgumentValue>');
            expect(uploadResponse.body).toContain('<RequestId>');
            expect(uploadResponse.body).toContain('<HostId>');
        });

        test(getTestTitle('Upload Attachments With Invalid Signature', endpoint), async ({ request }) => {
            const headers = endpoint.config.requiredHeaders;
        
            // First request: Get S3 upload details
            const response = await executeRequest(test, request, endpoint, headers);
            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
        
            const body = await response.json();
            console.log("✅ Got response from main endpoint");
        
            const s3Data = body.s3_objects?.[0];
            expect(s3Data).toBeTruthy();
        
            const s3Url = s3Data.url;
            const fields = s3Data.fields;
        
            console.log("➡️ S3 Upload URL:", s3Url);
            console.log("🧾 S3 Fields:", fields);
            console.log("🔑 Key:", fields.key);

            // Create form data with invalid signature
            const form = new FormData();
            
            // Add all S3 fields with invalid signature
            for (const [key, value] of Object.entries(fields)) {
                if (key === 'signature') {
                    console.log(`📎 Appending invalid field: ${key}`);
                    form.append(key, 'INVALID_SIGNATURE');
                } else {
                    console.log(`📎 Appending field: ${key}`);
                    form.append(key, value);
                }
            }

            // Add the file
            const filePath = endpoint.config.uploadFilePath;
            const fileBuffer = fs.readFileSync(filePath);
            form.append('file', fileBuffer, {
                filename: '0',
                contentType: 'application/octet-stream'
            });

            console.log("⏳ Sending upload request to S3 with invalid signature...");

            // Get form length
            const formLength = await new Promise((resolve, reject) => {
                form.getLength((err, length) => {
                    if (err) reject(err);
                    resolve(length);
                });
            });

            // Create a Promise to handle the form submission
            const uploadPromise = new Promise((resolve, reject) => {
                const formHeaders = form.getHeaders();
                formHeaders['content-length'] = formLength;
                
                console.log("📋 Form Headers:", formHeaders);

                const url = new URL(s3Url);
                const options = {
                    method: 'POST',
                    host: url.hostname,
                    path: url.pathname + url.search,
                    headers: formHeaders
                };

                const req = https.request(options, (res) => {
                    let responseBody = '';
                    res.on('data', chunk => { responseBody += chunk; });
                    res.on('end', () => {
                        resolve({
                            status: res.statusCode,
                            body: responseBody,
                            headers: res.headers
                        });
                    });
                });

                req.on('error', (error) => {
                    reject(error);
                });

                form.pipe(req);
            });

            const uploadResponse = await uploadPromise;
            console.log("📬 S3 Upload Status:", uploadResponse.status);
            console.log("📄 S3 Upload Response Body:", uploadResponse.body);

            // Verify the error response
            expect(uploadResponse.status).toBe(403);
            expect(uploadResponse.body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(uploadResponse.body).toContain('<Error>');
            expect(uploadResponse.body).toContain('<Code>SignatureDoesNotMatch</Code>');
            expect(uploadResponse.body).toContain('<Message>The request signature we calculated does not match the signature you provided. Check your key and signing method.</Message>');
            expect(uploadResponse.body).toContain('<AWSAccessKeyId>');
            expect(uploadResponse.body).toContain('</AWSAccessKeyId>');
            expect(uploadResponse.body).toContain('<StringToSign>');
            expect(uploadResponse.body).toContain('</StringToSign>');
            expect(uploadResponse.body).toContain('<SignatureProvided>INVALID_SIGNATURE</SignatureProvided>');
            expect(uploadResponse.body).toContain('<StringToSignBytes>');
            expect(uploadResponse.body).toContain('</StringToSignBytes>');
            expect(uploadResponse.body).toContain('<RequestId>');
            expect(uploadResponse.body).toContain('<HostId>');
        });
    }
});