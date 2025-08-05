document.addEventListener('DOMContentLoaded', async () => {
    const environmentList = document.getElementById('environmentList');
    const phiEnvironmentList = document.getElementById('phiEnvironmentList');
    const baseUrlElement = document.getElementById('baseUrl');
    const uploadAttachmentsUrlElement = document.getElementById('uploadAttachmentsUrl');
    const phiBaseUrlElement = document.getElementById('phiBaseUrl');

    try {
        const response = await fetch('http://localhost:3000/environment');
        if (!response.ok) {
            throw new Error('Failed to fetch environment variables');
        }
        const { regular, phi } = await response.json();

        // Find and display BASE_URL and current UPLOAD_ATTACHMENTS
        const baseUrlEnv = regular.find(env => env.name === 'BASE_URL');
        const baseUrlPhiEnv = phi.find(env => env.name === 'BASE_URL_PHI');
        
        if (baseUrlEnv) {
            baseUrlElement.textContent = baseUrlEnv.value;
            
            // Determine which UPLOAD_ATTACHMENTS to display based on current environment
            const currentEnv = baseUrlEnv.value.toLowerCase();
            
            // Map environment to its corresponding UPLOAD_ATTACHMENTS variable
            const envMap = {
                'staging': 'UPLOAD_ATTACHMENTS_STAGING',
                'beta': 'UPLOAD_ATTACHMENTS_BETA',
                'mufasa': 'UPLOAD_ATTACHMENTS_MUFASA',
                'shazam': 'UPLOAD_ATTACHMENTS_SHAZAM',
                'madeye': 'UPLOAD_ATTACHMENTS_MADEYE',
                'sandbox': 'UPLOAD_ATTACHMENTS_SANDBOX'
            };

            // Find the environment key that matches the current value
            const envKey = Object.keys(envMap).find(key => currentEnv.includes(key));
            if (envKey) {
                const uploadAttachmentsVar = envMap[envKey];
                const uploadAttachmentsEnv = regular.find(env => env.name === uploadAttachmentsVar);
                if (uploadAttachmentsEnv) {
                    uploadAttachmentsUrlElement.textContent = uploadAttachmentsEnv.value;
                }
            }
        }

        // Display current PHI URL
        if (baseUrlPhiEnv) {
            phiBaseUrlElement.textContent = baseUrlPhiEnv.value;
        }

        // Clear any existing content
        environmentList.innerHTML = '';
        phiEnvironmentList.innerHTML = '';

        // Create radio buttons for regular environments
        regular.forEach(env => {
            // Skip BASE_URL, UPLOAD_ATTACHMENTS variables, and the environment that matches the current value
            if (env.name === 'BASE_URL' || 
                env.name.startsWith('UPLOAD_ATTACHMENTS') || 
                env.value === baseUrlEnv?.value) {
                return;
            }

            const div = document.createElement('div');
            div.className = 'path-item';
            div.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="environment" id="${env.name}" value="${env.value}">
                        <label class="form-check-label" for="${env.name}">
                            ${env.name}
                        </label>
                    </div>
                    <span class="environment-value text-muted">${env.value}</span>
                </div>
            `;
            environmentList.appendChild(div);
        });

        // Create radio buttons for PHI environments
        phi.forEach(env => {
            // Skip BASE_URL_PHI, PHI API keys, and the environment that matches the current value
            if (env.name === 'BASE_URL_PHI' || 
                env.name.startsWith('PHI_API_KEY') || 
                env.value === baseUrlPhiEnv?.value) {
                return;
            }

            const div = document.createElement('div');
            div.className = 'path-item';
            div.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="phi_environment" id="${env.name}" value="${env.value}">
                        <label class="form-check-label" for="${env.name}">
                            ${env.name}
                        </label>
                    </div>
                    <span class="environment-value text-muted">${env.value}</span>
                </div>
            `;
            phiEnvironmentList.appendChild(div);
        });

        // Add event listeners to regular environment radio buttons
        const radioButtons = document.querySelectorAll('input[name="environment"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', async (e) => {
                const selectedValue = e.target.value;
                try {
                    // Send request to update BASE_URL
                    const baseUrlResponse = await fetch('http://localhost:3000/environment/update', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            name: 'BASE_URL',
                            value: selectedValue
                        })
                    });

                    const baseUrlResult = await baseUrlResponse.json();

                    if (!baseUrlResponse.ok) {
                        throw new Error(baseUrlResult.error || 'Failed to update BASE_URL');
                    }

                    // Determine which attachments URL to use based on the selected environment
                    const selectedEnv = selectedValue.toLowerCase();
                    
                    // Map environment to its corresponding UPLOAD_ATTACHMENTS variable
                    const envMap = {
                        'staging': 'UPLOAD_ATTACHMENTS_STAGING',
                        'beta': 'UPLOAD_ATTACHMENTS_BETA',
                        'mufasa': 'UPLOAD_ATTACHMENTS_MUFASA',
                        'shazam': 'UPLOAD_ATTACHMENTS_SHAZAM',
                        'madeye': 'UPLOAD_ATTACHMENTS_MADEYE',
                        'sandbox': 'UPLOAD_ATTACHMENTS_SANDBOX'
                    };

                    // Find the environment key that matches the selected value
                    const envKey = Object.keys(envMap).find(key => selectedEnv.includes(key));
                    if (envKey) {
                        const attachmentsVarName = envMap[envKey];
                        const attachmentsEnv = regular.find(env => env.name === attachmentsVarName);
                        const attachmentsUrl = attachmentsEnv?.value;

                        if (attachmentsUrl) {
                            // Send request to update BASE_URL_ATTACHMENTS
                            const attachmentsResponse = await fetch('http://localhost:3000/environment/update', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    name: 'BASE_URL_ATTACHMENTS',
                                    value: attachmentsUrl
                                })
                            });

                            const attachmentsResult = await attachmentsResponse.json();

                            if (!attachmentsResponse.ok) {
                                throw new Error(attachmentsResult.error || 'Failed to update BASE_URL_ATTACHMENTS');
                            }

                            // Update the attachments URL display
                            uploadAttachmentsUrlElement.textContent = attachmentsUrl;
                        }
                    }

                    // Show success message
                    alert('Environment updated successfully!');
                    
                    // Refresh the page to show the updated state
                    window.location.reload();
                } catch (error) {
                    console.error('Error updating environment:', error);
                    alert('Failed to update environment: ' + error.message);
                }
            });
        });

        // Add event listeners to PHI environment radio buttons
        const phiRadioButtons = document.querySelectorAll('input[name="phi_environment"]');
        phiRadioButtons.forEach(radio => {
            radio.addEventListener('change', async (e) => {
                const selectedValue = e.target.value;
                try {
                    // Update BASE_URL_PHI
                    const baseUrlResponse = await fetch('http://localhost:3000/environment/update', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            name: 'BASE_URL_PHI',
                            value: selectedValue
                        })
                    });

                    if (!baseUrlResponse.ok) {
                        const result = await baseUrlResponse.json();
                        throw new Error(result.error || 'Failed to update BASE_URL_PHI');
                    }

                    // Determine which API key to use based on the selected environment
                    let apiKeyName;
                    if (selectedValue.includes('preprod')) {
                        apiKeyName = 'PHI_API_KEY_PREPROD';
                    } else if (selectedValue.includes('staging')) {
                        apiKeyName = 'PHI_API_KEY_STAGING';
                    }

                    if (apiKeyName) {
                        // Send request to update PHI_API_KEY
                        const apiKeyResponse = await fetch('http://localhost:3000/environment/update', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                name: 'PHI_API_KEY',
                                environment: apiKeyName // Send the environment name instead of the key value
                            })
                        });

                        if (!apiKeyResponse.ok) {
                            const result = await apiKeyResponse.json();
                            throw new Error(result.error || 'Failed to update PHI_API_KEY');
                        }
                    }

                    // Show success message
                    alert('PHI Environment updated successfully!');
                    
                    // Refresh the page to show the updated state
                    window.location.reload();
                } catch (error) {
                    console.error('Error updating PHI environment:', error);
                    alert('Failed to update PHI environment: ' + error.message);
                }
            });
        });

    } catch (error) {
        console.error('Error:', error);
        environmentList.innerHTML = `
            <div class="alert alert-danger" role="alert">
                Error: Failed to fetch environment variables
            </div>
        `;
        baseUrlElement.textContent = 'Error: Failed to fetch';
        uploadAttachmentsUrlElement.textContent = 'Error: Failed to fetch';
    }
}); 