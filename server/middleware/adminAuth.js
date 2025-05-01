const jwt = require('jsonwebtoken');

const verifyAdminToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false,
            error: 'No token provided' 
        });
    }

    try {
        const token = authHeader.split(' ')[1];  // Bearer TOKEN
        const decoded = jwt.verify(token, 'admin_secret_key');
        req.adminId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ 
            success: false,
            error: 'Invalid or expired token' 
        });
    }
};

module.exports = verifyAdminToken; 