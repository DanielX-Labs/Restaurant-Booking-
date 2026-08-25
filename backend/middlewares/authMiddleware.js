import jwt from "jsonwebtoken";
export const optionalAuth = (req, _res, next) => {
   const token = req.cookies.token;
   if (!token) return next();
   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role === "user" && decoded.id) req.user = decoded;
      if (decoded.role === "admin" && decoded.email === process.env.ADMIN_EMAIL) req.admin = decoded;
   } catch {
      // An absent, expired, or invalid cookie means signed out for session probes.
   }
   next();
};
export const protect=(req,res,next)=>{
   const token=req.cookies.token;
   if(!token){
      return res.status(401).json({message:"Not Authorized",success:false})
   }
   try {
      const decoded=jwt.verify(token,process.env.JWT_SECRET);
      if (decoded.role !== "user" || !decoded.id) {
         return res.status(403).json({ message: "User access required", success: false });
      }
      req.user=decoded;
      next();
   } catch (error) {
      res.status(401).json({ message: "Invalid token" });
   }
}

export const adminOnly=(req,res,next)=>{
   const token=req.cookies.token;
    if(!token){
      return res.status(401).json({message:"Not Authorized",success:false})
   }
   try {
      const decoded=jwt.verify(token,process.env.JWT_SECRET);
      if(decoded.role !== "admin" || decoded.email !== process.env.ADMIN_EMAIL){
         return res.status(403).json({message:"Admin access required",success:false});
      }
      req.admin=decoded;
      next();
   } catch (error) {
           return res.status(401).json({ message: "Invalid token", success:false });
   }
}
