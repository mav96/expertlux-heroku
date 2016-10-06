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
app.use(logger);
app.engine(".html", hbs.engine);
app.set("view engine", ".html");
app.set("views", path.join(__dirname, "views"));

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
    const host = server.address().address;
    const port = server.address().port;
    console.log(`App is running on host ${host} and port ${port} in ${environment} mode`);
});

export default app;
