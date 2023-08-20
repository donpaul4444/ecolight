function cache(req, res, next){
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );
    res.setHeader("Expires", "0");
    res.setHeader("Pragma", "no-cache");
    next();
  }
  module.exports= {cache}