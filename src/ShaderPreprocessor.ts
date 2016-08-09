/**
 * ShaderPreprocessor
 */
class ShaderPreprocessor {

    private static cachedModules : Object = {};

    /**
     * @param {string} moduleName
     * @description Try to get a module source code. Defaults is empty string ""
     */
    private static getCachedModule(moduleName : string) : string {
        return moduleName in this.cachedModules ? this.cachedModules[moduleName] : "";
    }

    public static setShaderModuleSource(moduleName : string, moduleSource : string) {
        this.cachedModules[moduleName] = moduleSource;
    }

    public static tryToIncludeShaderModules(shaderSource : string) : string {
        var newShaderSource = shaderSource;

        while(this.hasModuleToInclude(newShaderSource))
            newShaderSource = this.includeModuleSource(newShaderSource);

        return newShaderSource;
    }

    private static hasModuleToInclude(shaderSource : string) : boolean {
        return shaderSource.search(/#include/g) >= 0;
    }

    private static getModuleNameWithInclude(shaderSource : string) : string {
        var moduleNameWithIncludeStartIndex = shaderSource.search(/#include/g);
        var moduleNameWithIncludeEndIndex   = shaderSource.search(/>.*/g) + 1;
        return shaderSource.substring(moduleNameWithIncludeStartIndex, moduleNameWithIncludeEndIndex);
    }

    private static getModuleName(shaderSource : string) : string {
        var moduleNameWithInclude = this.getModuleNameWithInclude(shaderSource);
        var moduleNameStartIndex = moduleNameWithInclude.search(/</g) + 1;
        var moduleNameEndIndex = moduleNameWithInclude.search(/>/g);
        return moduleNameWithInclude.substring(moduleNameStartIndex, moduleNameEndIndex);
    }

    private static includeModuleSource(shaderSource : string) : string {
        var moduleNameWithInclude = this.getModuleNameWithInclude(shaderSource);
        var moduleName = this.getModuleName(shaderSource);
        var moduleSourceString = this.getCachedModule(moduleName);
        return shaderSource.replace(moduleNameWithInclude, moduleSourceString);
    }
}