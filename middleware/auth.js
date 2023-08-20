const users = require("../model/users");
async function authuser(req, res, next) {
  if (req.session.user) {
    const id = req.session.user._id;
    const data = await users.findById(id);
    if (data.status == "Active") {
      next();
    } else {
      res.redirect("/logout");
    }
  } else {
    res.redirect("/logout");
  }
}
function authadmin(req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin");
  }
}
module.exports = { authuser, authadmin };
