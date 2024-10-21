#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

mat2 scale(vec2 scale){
    return mat2(scale.x, 0.0, 0.0, scale.y);
} 

float circleGEO(vec2 position, float radius){
    return step(radius, length(position - vec2(0.5)));
}

const float PI = 3.14159265359;
float polyGEO(vec2 position, float radius, float sides){
    position = position * 2.0 - 1.0;
    float angle = atan(position.x, position.y); 
    float slice = PI * 2.0 / sides;
    return step(radius, cos(floor(0.5 + angle / slice) * slice - angle) * length(position));
}

/**
* ?
*/ 
void main() {
    // vec2 uv = (gl_FragCoord.xy - (u_resolution * 0.0)) / u_resolution;
    // vec2 uv = (gl_FragCoord.xy - (u_resolution * sin(u_time))) / u_resolution;
    // vec2 uv = (gl_FragCoord.xy - (u_resolution.xy * 0.0)) / u_resolution;
    // vec2 uv = ((gl_FragCoord.xy - (u_resolution * sin(u_time) * 0.5)) / u_resolution);
    vec2 uv = ((gl_FragCoord.xy - (u_resolution * 0.0)) / u_resolution);
    vec2 translate = vec2((-sin(u_time / 1.0) * 0.25),0.0);
    uv += translate;

    // ?coord scale
    uv -= vec2(0.5);
    uv = scale(vec2(cos(u_time / 0.5) + 2.0)) * uv;
    uv += vec2(0.5);

    // uv *= scale(1.0);
    // shapes, colors, fragments output here
    float polygon = polyGEO(uv, 0.3, 8.0);
    vec3 c_geo = vec3(polygon);


    vec3 c_1 = vec3(0.4, 0.5, 0.6);
    vec3 c_2 = vec3(0.4, 0.6, 0.5);

    vec3 color = mix(c_geo, c_2, c_1);
    gl_FragColor = vec4(color, 1.0);
} 