// import "babel-polyfill";
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
import minifyHTML from "express-minify-html";
import path from "path";
import helmet from "helmet";

// http://jsman.ru/express/
const app = express();
const logger = morgan("combined");
const environment = app.get("env") || "development"; // production
const hbs = exphbs.create({
    defaultLayout: "default",
    extname: ".html",
    helpers: {
        isRelease: environment !== "development",
    },
    layoutsDir: "views/layouts",
    partialsDir: "views/partials",
});
// app.use(logger);
app.engine(".html", hbs.engine);
app.set("view engine", ".html");
app.set("views", path.join(__dirname, "views"));
app.use(helmet());

if (environment === "production") {
    app.use(minifyHTML({
        htmlMinifier: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            minifyJS: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeEmptyAttributes: true,
        },
        override: true,
    }));
    app.use(compression());
}

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

if (environment === "production") {
    app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.headers["x-forwarded-proto"] !== "https") {
            return res.redirect(`https://${req.hostname}${req.originalUrl}`);
        }
        return next();
    });
}

// https://github.com/expressjs/body-parser
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// https://github.com/expressjs/method-Override
// app.use(methodOverride());

import homeController from "./controllers/home-controller";
app.use("/", homeController);

import mailController from "./controllers/mail-controller";
app.use("/api/mail", mailController);

app.use((req: Request, res: Response, next: NextFunction) => {
    //:${req.app.settings.port}
    let url = `${req.protocol}://${req.hostname}${req.originalUrl}`;
    let err: any = new Error(`Not Found. Url: ${url}`);
    err.status = 404;
    next(err);
});

if (environment === "development") {
    app.use((err: any, req: Request, res: Response) => {
        res.status(err.status || 500).render("error", err);
    });
} else {
    app.use((err: any, req: Request, res: Response) => {
        err.stack = null;
        res.status(err.status || 500).render("error", err);
    });
}

app.set("port", process.env.PORT || 5000);
const server = app.listen(app.get("port"), () => {
    let address = server.address();
    let host = address.address;
    let port = address.port;
    console.log(`App is running on host ${host} and port ${port} in ${environment} mode`);
});

export default app;
