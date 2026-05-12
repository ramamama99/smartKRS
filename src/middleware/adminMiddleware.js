const adminMiddleware = (req, res, next) => {
    // Middleware ini selalu dipasang setelah authMiddleware
    // jadi req.userRole udah ada
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Akses ditolak, hanya admin' })
    }
    next()
}

module.exports = adminMiddleware