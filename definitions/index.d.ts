declare module "express-minify-html" {
    import minifyHtml from "html-minifier";
    import express from "express";

    function e(options?: Options): express.RequestHandler;

    interface Options {
        htmlMinifier?: minifyHtml.Options
        override?: boolean;
    }
    
    export = e;
}
