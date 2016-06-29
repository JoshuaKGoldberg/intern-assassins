@echo off

REM react
move .\node_modules\react\dist\react.js .\node_modules\react\dist\react-save.js 
copy .\node_modules\react\dist\react.min.js .\node_modules\react\dist\react.js

REM react-dom
move .\node_modules\react-dom\dist\react-dom.js .\node_modules\react-dom\dist\react-dom-save.js 
copy .\node_modules\react-dom\dist\react-dom.min.js .\node_modules\react-dom\dist\react-dom.js 