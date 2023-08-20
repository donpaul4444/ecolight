
const multer= require("multer")
const path=require("path")
// Create a storage object specifying where to store the uploaded files
const storage = multer.diskStorage({
    destination:  'public/uploads/' // Change the destination folder as needed
    ,
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    },
  });
  


  
  // Optionally, you can add some file filter options to allow only image files
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  };
  
  // Update the multer instance with the fileFilter option
  const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
  });
  
  module.exports=upload