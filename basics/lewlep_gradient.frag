#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;


/**
* ?
*/ 
void main() {
    // vec2 uv = (gl_FragCoord.xy - (u_resolution * 0.0)) / u_resolution;
    // vec2 uv = (gl_FragCoord.xy - (u_resolution * sin(u_time))) / u_resolution;
    vec2 uv = (gl_FragCoord.xy - (u_resolution * cos(u_time))) / u_resolution;
    // shapes, colors, fragments output here
    const float PI = 3.14159265359;
    for(int i = 0; i < 5; i++){
    
    }
    vec3 color = vec3(uv.x, .5, uv.y);
    gl_FragColor = vec4(color, 1.0);
} 