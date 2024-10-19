#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float rectGEO(vec2 pos, vec2 scale){
    scale = vec2(0.5) - scale * 0.5;
    vec2 shaper = vec2(step(scale.x, pos.x), step(scale.y, pos.y));
    shaper *= vec2((step(scale.x), 1.0- pos.x), step(scale.y, 1.0 - pos.y));
    return shaper.x * shaper.y;
}

/**
* ?
*/ 
void main() {
    // vec2 uv = (gl_FragCoord.xy - (u_resolution * 0.0)) / u_resolution;
    // vec2 uv = (gl_FragCoord.xy - (u_resolution * sin(u_time))) / u_resolution;
    // vec2 uv = (gl_FragCoord.xy - (u_resolution.xy * 0.0)) / u_resolution;
    // vec2 uv = ((gl_FragCoord.xy - (u_resolution * sin(u_time) * 0.5)) / u_resolution);
    vec2 uv = (sin(u_time) * 2.5)*(gl_FragCoord.xy / u_resolution);
    // shapes, colors, fragments output here
    float circle = circleGEO(uv, 0.2);

    vec3 color = vec3(circle);
    gl_FragColor = vec4(color, 1.0);
} 