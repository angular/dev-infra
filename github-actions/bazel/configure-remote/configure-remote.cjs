"use strict";(()=>{var n=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,i)=>(typeof require<"u"?require:t)[i]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw new Error('Dynamic require of "'+e+'" is not supported')});var o=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var l=o(r=>{var u=r&&r.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(r,"__esModule",{value:!0});var s=u(n("fs")),c=u(n("os"));async function a(e){let t=c.default.platform()==="win32";if(e){let i=await f(e);t?i+=`
build --config=remote-cache`:i+=`
build --config=remote`,await s.default.promises.writeFile(e,i,"utf8")}}async function f(e){try{return await s.default.promises.readFile(e,"utf8")}catch{return""}}a(process.env.BAZELRC_PATH).catch(e=>{console.error(e),process.exitCode=1})});l();})();
/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
//# sourceMappingURL=bundle.js.map
