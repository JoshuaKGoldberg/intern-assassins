declare var requirejs: any;

requirejs.config({
    paths: {
        "main": "bundled/main",
        "react": "../../../node_modules/react/dist/react",
        "react-dom": "../../../node_modules/react-dom/dist/react-dom"
    }
});

requirejs(["main"]);
// requirejs(["main"]);
