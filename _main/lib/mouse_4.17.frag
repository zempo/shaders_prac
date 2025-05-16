#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_mouse; // Mouse position in pixels
uniform vec2 u_resolution; // Screen resolution in pixels

void main() {
    vec2 mouseNorm = u_mouse / u_resolution; // Normalize manually if needed
    gl_FragColor = vec4(mouseNorm.x, mouseNorm.y, 0.0, 1.0);
}