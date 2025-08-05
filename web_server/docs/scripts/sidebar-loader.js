document.addEventListener('DOMContentLoaded', function() {
    fetch('/docs/sidebar.html')
        .then(response => response.text())
        .then(data => {
            const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
            
            // Make sure the placeholder has the correct column class
            if (!sidebarPlaceholder.classList.contains('col-md-3')) {
                sidebarPlaceholder.classList.add('col-md-3');
            }
            
            sidebarPlaceholder.innerHTML = data;
            
            // Check if we're on the main documentation page
            const isMainDocsPage = window.location.pathname === '/docs/' || window.location.pathname === '/docs/index.html';
            
            // Get all collapse elements
            const collapseElements = document.querySelectorAll('.collapse');
            
            // Initially close all sections
            collapseElements.forEach(element => {
                element.classList.remove('show');
            });

            // If not on main page, open the relevant section based on current URL
            if (!isMainDocsPage) {
                const currentPath = window.location.pathname;
                const currentSection = findSectionForPath(currentPath);
                if (currentSection) {
                    currentSection.classList.add('show');
                }
            }

            // Initialize sidebar functionality
            initializeSidebar();
        })
        .catch(error => console.error('Error loading sidebar:', error));
});

function findSectionForPath(path) {
    const links = document.querySelectorAll('.section-link');
    for (const link of links) {
        if (link.getAttribute('href') === path) {
            return link.closest('.collapse');
        }
    }
    return null;
}

function initializeSidebar() {
    // Handle collapse toggle arrow rotation and section visibility
    const toggles = document.querySelectorAll('.collapse-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function(event) {
            // Get the target collapse element
            const targetId = this.getAttribute('href');
            const targetCollapse = document.querySelector(targetId);
            
            // Close all other sections
            document.querySelectorAll('.collapse').forEach(collapse => {
                if (collapse !== targetCollapse) {
                    collapse.classList.remove('show');
                    const otherToggle = document.querySelector(`[href="#${collapse.id}"]`);
                    if (otherToggle) {
                        otherToggle.classList.add('collapsed');
                    }
                }
            });

            // Toggle the clicked section
            this.classList.toggle('collapsed');
        });
    });

    // Handle section highlighting
    const sections = document.querySelectorAll('h2[id], h3[id]');
    const navLinks = document.querySelectorAll('.section-link');

    function highlightSection() {
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 100) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            const hrefParts = href.split('#');
            if (hrefParts.length > 1 && hrefParts[1] === currentSection) {
                link.classList.add('active');
                // Open the parent collapse section when a link becomes active
                const parentCollapse = link.closest('.collapse');
                if (parentCollapse) {
                    // Close all other sections first
                    document.querySelectorAll('.collapse').forEach(collapse => {
                        if (collapse !== parentCollapse) {
                            collapse.classList.remove('show');
                            const otherToggle = document.querySelector(`[href="#${collapse.id}"]`);
                            if (otherToggle) {
                                otherToggle.classList.add('collapsed');
                            }
                        }
                    });
                    // Open the relevant section
                    parentCollapse.classList.add('show');
                    const toggle = document.querySelector(`[href="#${parentCollapse.id}"]`);
                    if (toggle) {
                        toggle.classList.remove('collapsed');
                    }
                }
            }
        });
    }

    window.addEventListener('scroll', highlightSection);
    highlightSection(); // Initial highlight
} 