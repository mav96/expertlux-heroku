import { Request, Response, NextFunction } from "express";
import express from "express";
import morgan from "morgan";
import exphbs from "express-handlebars";
// import bodyParser from "body-parser";
// import methodOverride from "method-override";
import serveStatic from "serve-static";
import serveFavicon from "serve-favicon";
import compression from "compression";
import responseTime from "response-time";
import path from "path";

// http://jsman.ru/express/
const app = express();
const logger = morgan("combined");
const environment = app.get("env");
const hbs = exphbs.create({
    defaultLayout: "default",
    extname: ".html",
    helpers: {
        environment: environment,
        release: environment === "production",
        debug: environment === "development",
    },
    layoutsDir: "views/layouts",
    partialsDir: "views/partials",
});
app.engine(".html", hbs.engine);
app.set("view engine", ".html");
app.set("views", path.join(__dirname, "views"));

app.use(compression());

app.use(serveStatic(path.join(__dirname, "content"), {
    maxAge: "7d",
    setHeaders: (res, path) => {
        if (serveStatic.mime.lookup(path) === "text/html") {
            res.setHeader("Cache-Control", "public, max-age=0");
        }
    },
}));
app.use(serveStatic(path.join(__dirname, "views")));
app.use(serveFavicon(path.join(__dirname, "content", "favicons", "favicon.ico")));

if (environment === "development") {
    app.use(responseTime());
}

// https://github.com/expressjs/body-parser
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// https://github.com/expressjs/method-Override
// app.use(methodOverride());

import homeController from "./controllers/home";
app.use("/", homeController);

app.use((req: Request, res: Response, next: NextFunction) => {
    let err: any = new Error("Not Found");
    err.status = 404;
    next(err);
});

switch (environment) {
    case "development": {
        // что оно делает?
        // app.enable("verbose errors");

        app.use(logger);
        app.use((err: any, req: Request, res: Response) => {
            res.status(err.status || 500).render("error", err);
        });
        break;
    }
    case "production": {
        app.use((err: any, req: Request, res: Response) => {
            err.stack = null;
            res.status(err.status || 500).render("error", err);
        });
        break;
    }
    default: break;
}

const port = process.env.PORT || 5000;
app.set("port", port);
app.listen(port, () => {
    console.log(`Express app is running on port ${port} in ${environment} mode`);
});

export default app;
