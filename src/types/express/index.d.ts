import User from "src/user/user.entity";
import { Request } from "express";
import { userResponse } from "src/user/user.entity";

declare global {
    namespace Express {
        interface Request {
            user?: userResponse.data;
        }
    }
}