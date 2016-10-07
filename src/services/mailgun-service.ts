import fetch from "node-fetch";
export default class MailgunService {
    public send(from: string, to: string, subject: string, text: string) {
        let domain = process.env.MAILGUN_DOMAIN;
        let key = process.env.MAILGUN_API_KEY;
        let token = new Buffer(key).toString("base64");
        let url = `https://api.mailgun.net/v3/${domain}/messages`;
        let body = `from=${from}&to=${to}&subject=${subject}&text=${text}`;
        let headers = {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
        };
        return fetch(url, {
            body: body,
            headers: headers,
            method: "POST",
        });
    }
}
