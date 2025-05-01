// Default image to use when product image fails to load
export const defaultImage = '/images/default-book.png';

// Helper function to get image for a product
export const getImageForProduct = (imageName) => {
    // If no image name provided, return undefined
    if (!imageName) {
        return undefined;
    }

    // If the image is a full URL, return it directly
    if (imageName.startsWith('http')) {
        return imageName;
    }

    // Get all possible extensions
    const validExtensions = ['.webp', '.jpg', '.jpeg', '.png'];
    
    // First try the exact name
    const exactPath = `/images/${imageName}`;
    
    // If the image has a complex name (like from Flipkart), try to simplify it
    if (imageName.includes('-original-') || imageName.includes('_original_')) {
        // Extract the main part of the name (before -original- or similar patterns)
        const simplifiedName = imageName
            .split('-original-')[0]
            .split('_original_')[0]
            // Replace multiple hyphens/underscores with single hyphen
            .replace(/[-_]+/g, '-')
            // Add hyphen at the end if it doesn't have one
            .replace(/([^-])$/, '$1-');

        // Try each extension with the simplified name
        for (const ext of validExtensions) {
            const path = `/images/${simplifiedName}${ext}`;
            // You might want to add some validation here to check if file exists
            return path;
        }
    }

    // If no special handling needed, return the original path
    return exactPath;
};

export default getImageForProduct; 