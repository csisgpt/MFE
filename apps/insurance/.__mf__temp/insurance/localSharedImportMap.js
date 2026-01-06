
// Windows temporarily needs this file, https://github.com/module-federation/vite/issues/68

    import {loadShare} from "@module-federation/runtime";
    const importMap = {
      
        "pinia": async () => {
          let pkg = await import("__mf__virtual/insurance__prebuild__pinia__prebuild__.js");
            return pkg;
        }
      ,
        "vue": async () => {
          let pkg = await import("__mf__virtual/insurance__prebuild__vue__prebuild__.js");
            return pkg;
        }
      ,
        "vue-router": async () => {
          let pkg = await import("__mf__virtual/insurance__prebuild__vue_mf_2_router__prebuild__.js");
            return pkg;
        }
      
    }
      const usedShared = {
      
          "pinia": {
            name: "pinia",
            version: "2.3.1",
            scope: ["default"],
            loaded: false,
            from: "insurance",
            async get () {
              if (false) {
                throw new Error(`Shared module '${"pinia"}' must be provided by host`);
              }
              usedShared["pinia"].loaded = true
              const {"pinia": pkgDynamicImport} = importMap
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^2.3.1",
              
            }
          }
        ,
          "vue": {
            name: "vue",
            version: "3.5.26",
            scope: ["default"],
            loaded: false,
            from: "insurance",
            async get () {
              if (false) {
                throw new Error(`Shared module '${"vue"}' must be provided by host`);
              }
              usedShared["vue"].loaded = true
              const {"vue": pkgDynamicImport} = importMap
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^3.5.26",
              
            }
          }
        ,
          "vue-router": {
            name: "vue-router",
            version: "4.6.4",
            scope: ["default"],
            loaded: false,
            from: "insurance",
            async get () {
              if (false) {
                throw new Error(`Shared module '${"vue-router"}' must be provided by host`);
              }
              usedShared["vue-router"].loaded = true
              const {"vue-router": pkgDynamicImport} = importMap
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^4.6.4",
              
            }
          }
        
    }
      const usedRemotes = [
      ]
      export {
        usedShared,
        usedRemotes
      }
      