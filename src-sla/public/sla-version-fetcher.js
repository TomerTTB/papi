// Function to fetch and display version
async function fetchAndDisplayVersion() {
    try {
        // Wait for the footer template to be loaded
        await loadTemplate('footer', 'footer-placeholder');
        
        const response = await fetch('http://localhost:3001/status');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        // Update version in footer
        const versionElement = document.getElementById('papi-version');
        if (versionElement) {
            versionElement.textContent = data.version || 'Unknown';
        }
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