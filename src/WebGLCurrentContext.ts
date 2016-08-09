class WebGLCurrentContext {

    private static currentContext : WebGLRenderingContext;

    public static get() : WebGLRenderingContext {
        return this.currentContext;
    }

    public static set(newWebglContext : WebGLRenderingContext) {
        this.currentContext = newWebglContext;
    }
}