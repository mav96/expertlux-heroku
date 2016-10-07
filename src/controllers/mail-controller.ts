import {Router, Request, Response, NextFunction} from "express";
import bodyParser from "body-parser";
import MailService from "../services/mailgun-service";

const ctrl = Router();

ctrl.post("/", bodyParser.json(), async (req: Request, res: Response, next: NextFunction) => {
    let request = req.body as CrierRequest;
    let from = process.env.MAILGUN_FROM;
    let to = process.env.MAILGUN_TO;
    let subject = "Кричалка. " + request.type;
    let text = `${request.name} ${request.phone}`;
    let service = new MailService();
    service.send(from, to, subject, text).then((responce) => {
        return responce.json();
    }).then((json) => {
        res.json(json);
    }).catch((err) => {
        next(err);
    });
});

class CrierRequest {
    public name: string;
    public phone: string;
    public type: CrierType;
}

enum CrierType {
    /**
     * Консультация
     */
    Consultation,
    /**
     * Печать
     */
    Seal
}

export default ctrl;
