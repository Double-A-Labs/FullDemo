"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunksaber"] = self["webpackChunksaber"] || []).push([["admin"],{

/***/ "./wwwroot/src/admin/index.js":
/*!************************************!*\
  !*** ./wwwroot/src/admin/index.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _site_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../site.js */ \"./wwwroot/src/site.js\");\n﻿\r\n\r\nconst ErrorMsgElementAdmin = document.getElementById('errorMsgAdmin');\r\nconst annoucementElementAdmin = document.getElementById('annoucementAdmin');\r\nconst socketLabelAdmin = document.getElementById(\"socketLabelAdmin\");\r\n\r\nconst init = () => {\r\n    ErrorMsgElementAdmin.innerHTML = _site_js__WEBPACK_IMPORTED_MODULE_0__.errorMsgElement ? _site_js__WEBPACK_IMPORTED_MODULE_0__.errorMsgElement.innerHTML : '';\r\n    annoucementElementAdmin.innerHTML = _site_js__WEBPACK_IMPORTED_MODULE_0__.annoucementElement ? _site_js__WEBPACK_IMPORTED_MODULE_0__.annoucementElement.innerHTML : 'Waiting to access User Webcam';\r\n    socketLabelAdmin.innerHTML = _site_js__WEBPACK_IMPORTED_MODULE_0__.socketLabel ? _site_js__WEBPACK_IMPORTED_MODULE_0__.socketLabel.innerHTML : 'Waiting for websocket connection';\r\n}\r\n\r\n\r\nwindow.onload = init;\n\n//# sourceURL=webpack://saber/./wwwroot/src/admin/index.js?");

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("./wwwroot/src/admin/index.js"));
/******/ }
]);