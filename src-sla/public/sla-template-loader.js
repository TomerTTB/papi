// Function to load HTML templates
async function loadTemplate(templateName, targetElementId) {
    try {
        const response = await fetch(`/shared/templates/${templateName}.html`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        document.getElementById(targetElementId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading ${templateName} template:`, error);
    }
}

// Load all templates when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        loadTemplate('header', 'header-placeholder'),
        loadTemplate('footer', 'footer-placeholder')
    ]);
}); 