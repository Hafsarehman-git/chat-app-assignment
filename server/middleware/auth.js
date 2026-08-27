const jwt = require("jsonwebtoken");
function protect(req, res, next) {
  let token = req.cookies.token; 

  if (!token)
    return res.status(401).json({ success: false, message: "No token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ msg: "Token invalid or expired" });
  }
}

module.exports = { protect };
