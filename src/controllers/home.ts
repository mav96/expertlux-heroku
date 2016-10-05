import {Router, Request, Response} from "express";

const ctrl = Router();

ctrl.get("/", (req: Request, res: Response) => {
    res.render("home/index.html");
});

export default ctrl;
