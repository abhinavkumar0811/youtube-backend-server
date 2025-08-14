import express from "express";
import userController from "../controllers/userController/user.controller.js";
import { upload } from "../midwares/user/fileUpload.midware.js";
import { rateLimitor } from "../midwares/user/rateLimitor.midware.js";
import { jwtVarify } from "../midwares/user/authorize.midware.js";
import { Route } from "express";

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

router.post("/loggedIn", rateLimitor, userController.logIn);
router.post("/logout", jwtVarify , userController.signOut)
router.patch("/changepassword", jwtVarify, userController.changedPassword);
router.get('/user', jwtVarify, userController.getUser),
router.patch('/updateuserdata', jwtVarify, userController.updateUserData)

// // maintanance route
// router.get('/maintain', (req, res) =>{
//     res.send('hello this is page is under test')
// })

// test router
router.post("/test", userController.testController);

export default router;
