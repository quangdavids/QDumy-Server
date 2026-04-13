const isAdmin = (req,res,next) => {
    if(!req.user || req.user.role !== 'admin') {
        return res.status(403).json({message: "Admin permission only"})
    }
    next()
}

module.exports = {isAdmin}