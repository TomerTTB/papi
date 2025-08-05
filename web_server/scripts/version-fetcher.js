// Fetch version from server and update the version span
async function fetchAndDisplayVersion() {
    try {
        // Wait for the footer template to be loaded
        await loadTemplate('footer', 'footer-placeholder');
        
        const response = await fetch('http://localhost:3000/version');
        const version = await response.text();
        console.log('Fetched version:', version); // Debugging
        document.getElementById('papi-version').textContent = version;
    } catch (error) {
        console.error('Error fetching version:', error);
        const versionElement = document.getElementById('papi-version');
        if (versionElement) {
            versionElement.textContent = 'Unknown';
        }
    }
}

// Initialize version fetching when DOM is loaded
document.addEventListener("DOMContentLoaded", fetchAndDisplayVersion); 