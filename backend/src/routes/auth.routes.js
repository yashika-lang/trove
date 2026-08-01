import { Router } from "express"; // import the Router class from the express module to create a new router instance
import { registerUser, loginUser, getCurrentUser, } from "../controllers/auth.controller.js"; // import the registerUser function from the auth.controller.js file
import {
    verifyJWT,
    authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = Router();// create a new router instance and in this router instance we can define routes for handling authentication-related requests, such as user registration, login, and logout.


router.post("/login", loginUser); 
router.post("/register", registerUser); // define a route for handling user registration requests. When a POST request is made to the "/register" endpoint, the registerUser function will be called to handle the request and perform the necessary logic for registering a new user.
router.get(
    "/current-user",verifyJWT,authorizeRoles(
        "Admin",
        "Sales",
        "Accountant"
    ),
    getCurrentUser
); // define a route for fetching the current user's information. The verifyJWT middleware will be used to ensure the user is authenticated.

export default router;