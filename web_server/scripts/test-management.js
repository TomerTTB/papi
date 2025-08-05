// Test Management functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const productSelect = document.getElementById('productSelect');
    const statusMessage = document.getElementById('statusMessage');
    const fileListContainer = document.getElementById('fileListContainer');
    const noProductSelected = document.getElementById('noProductSelected');
    const noFilesMessage = document.getElementById('noFilesMessage');
    const fileList = document.getElementById('fileList');
    const filesCardTitle = document.getElementById('filesCardTitle');

    // Define the display name mapping
    const displayNameMap = {
        'basic': 'Basic Suite',
        'headers': 'Headers Suite',
        'query_params': 'Query Params Suite',
        'response_structure': 'Response Structure Suite',
        'response_comparison': 'Response Comparison Suite',
        'upload': 'Upload Attachments Suite',
        'validation': 'Validation'
    };
    
    try {
        // Fetch products for dropdown
        const productsResponse = await fetch('http://localhost:3000/productDetails');
        const products = await productsResponse.json();
        
        productSelect.innerHTML = '<option value="" selected disabled>Choose a product...</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.name;
            option.textContent = product.name;
            productSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Failed to load initial data:', error);
        productSelect.innerHTML = '<option value="" disabled>Failed to load products</option>';
    }
    
    // Update files when product changes
    productSelect.addEventListener('change', () => {
        const selectedProduct = productSelect.value;
        fetchProductFiles();
    });
    
    // Function to fetch available files for the selected product
    async function fetchProductFiles() {
        const selectedProduct = productSelect.value;
        
        if (!selectedProduct) {
            fileListContainer.style.display = 'none';
            noProductSelected.style.display = 'block';
            return;
        }
        
        try {
            fileListContainer.style.display = 'block';
            noProductSelected.style.display = 'none';
            fileList.innerHTML = '<div class="text-center my-3"><div class="spinner-border spinner-border-sm" role="status"></div> Loading files...</div>';
            
            const response = await fetch(`http://localhost:3000/csvFiles/${selectedProduct}`);
            const data = await response.json();
            
            if (data.success && data.files && data.files.length > 0) {
                noFilesMessage.style.display = 'none';
                fileList.innerHTML = '';

                // Define the order of test suites
                const testSuiteOrder = {
                    'Basic Suite': 1,
                    'Headers Suite': 2,
                    'Query Params Suite': 3,
                    'Response Structure Suite': 4,
                    'Response Comparison Suite': 5,
                    'Attachments Upload Suite': 6,
                    'Validation': 7
                };

                // Sort files based on predefined order
                data.files.sort((a, b) => {
                    // Extract test type from filename (e.g., GoEyes_Basic.csv → Basic)
                    const getTestType = (filename) => {
                        console.log('Processing filename:', filename);
                        if (filename.startsWith(selectedProduct + '_')) {
                            const testType = filename.substring(selectedProduct.length + 1).replace('.csv', '').toLowerCase();
                            console.log('Extracted test type:', testType);
                            console.log('Mapped display name:', displayNameMap[testType]);
                            return displayNameMap[testType] || testType;
                        }
                        return filename;
                    };

                    const typeA = getTestType(a);
                    const typeB = getTestType(b);
                    console.log('Final typeA:', typeA);
                    console.log('Final typeB:', typeB);

                    // Get order numbers (default to 999 if not in mapping)
                    const orderA = testSuiteOrder[typeA] || 999;
                    const orderB = testSuiteOrder[typeB] || 999;
                    console.log('OrderA:', orderA, 'OrderB:', orderB);

                    return orderA - orderB;
                }).forEach(file => {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'file-item';
                    
                    // Extract test type from filename
                    let displayName = file;
                    console.log('Processing file for display:', file);
                    if (file.startsWith(selectedProduct + '_')) {
                        const testType = file.substring(selectedProduct.length + 1).replace('.csv', '').toLowerCase();
                        console.log('Extracted display test type:', testType);
                        displayName = displayNameMap[testType] || testType;
                        console.log('Final display name:', displayName);
                    }
                    
                    const fileNameDiv = document.createElement('div');
                    fileNameDiv.className = 'file-name';
                    fileNameDiv.textContent = displayName;
                    
                    const downloadBtn = document.createElement('a');
                    downloadBtn.className = 'btn btn-sm btn-outline-primary';
                    downloadBtn.href = `http://localhost:3000/download/${selectedProduct}/${file}`;
                    downloadBtn.textContent = 'Download';
                    
                    fileItem.appendChild(fileNameDiv);
                    fileItem.appendChild(downloadBtn);
                    fileList.appendChild(fileItem);
                });
            } else {
                fileList.innerHTML = '';
                noFilesMessage.style.display = 'block';
                noFilesMessage.textContent = 'No test files available for this product.';
            }
        } catch (error) {
            console.error('Failed to fetch product files:', error);
            fileList.innerHTML = '<div class="text-danger">Failed to load files</div>';
        }
    }
}); 