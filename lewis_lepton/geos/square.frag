#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float rectGEO(vec2 pos, vec2 scale){
    scale = vec2(0.5) - scale * 0.5;
    vec2 shaper = vec2(step(scale.x, pos.x), step(scale.y, pos.y));
    shaper *= vec2(step(scale.x, 1.0 - pos.x), step(scale.y, 1.0 - pos.y));
    return shaper.x * shaper.y;
}

// float NAME(vec2 position, vec2 scale){
//     scale = vec2(0.5) - scale * 0.5;
//     vec2 shaper = vec2(step(scale.x, position.x), step(scale.y, position.y));
//     shaper *= vec2(step(scale.x, 1.0 - position.x), step(scale.y, 1.0 - position.y));
//     return shaper.x * shaper.y;
// }

/**
* ?
*/ 
void main() {
    // vec2 uv = (gl_FragCoord.xy - (u_resolution * 0.0)) / u_resolution;
    // vec2 uv = (gl_FragCoord.xy - (u_resolution * sin(u_time))) / u_resolution;
    // vec2 uv = (gl_FragCoord.xy - (u_resolution.xy * 0.0)) / u_resolution;
    // vec2 uv = ((gl_FragCoord.xy - (u_resolution * sin(u_time) * 0.5)) / u_resolution);
    vec2 uv = ((gl_FragCoord.xy) / u_resolution);
    vec2 translate = vec2((sin(u_time / 3.0) * 0.25),(-sin(u_time / 0.6) * 0.25));
    uv += translate;
    // shapes, colors, fragments output here
    float rect = rectGEO(uv, vec2(0.3, 0.3));
    vec3 c_geo = vec3(rect);

    vec3 c_1 = vec3(uv.x, .5, uv.y);
    vec3 c_2 = vec3(0.502, 1.0, 0.6431);


    vec3 color = mix(c_geo, c_2, c_1);
    gl_FragColor = vec4(color, 1.0);
} 