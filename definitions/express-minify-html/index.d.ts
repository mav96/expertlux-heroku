declare module "express-minify-html" {
    import minifyHtml from "html-minifier";
    import express from "express";

    interface Options {
        htmlMinifier?: minifyHtml.Options
        override?: boolean;
    }

    export default function minify(options?: Options): express.RequestHandler;
}
