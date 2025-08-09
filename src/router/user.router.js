import express from "express";
import userController from "../controllers/userController/user.controller.js";
import { upload } from "../midwares/user/fileUpload.midware.js";
import { rateLimitor } from "../midwares/user/rateLimitor.midware.js";

const router = express.Router();

// user Route
router.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },

    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  userController.registerController,
);

router.post("/loggedIn", userController.logIn);

// // maintanance route
// router.get('/maintain', (req, res) =>{
//     res.send('hello this is page is under test')
// })

// test router
router.post("/test", userController.testController);

export default router;
