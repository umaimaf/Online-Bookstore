const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expired. Please login again.' });
    }
    
    res.status(500).json({ 
        error: 'An unexpected error occurred',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

module.exports = errorHandler; 