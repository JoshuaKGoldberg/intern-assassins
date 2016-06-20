declare var requirejs: any;

requirejs.config({
    paths: {
        "main": "bundled/main",
        "jszip": "../../../node_modules/xlsx/dist/jszip",
        "react": "../../../node_modules/react/dist/react",
        "react-dom": "../../../node_modules/react-dom/dist/react-dom",
        "xlsx": "../../../node_modules/xlsx/dist/xlsx.core.min"
    }
});

requirejs(["main"]);
