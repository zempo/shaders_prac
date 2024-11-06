#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

const float PI = 3.14159265359;
float mkPoly(vec2 position, float radius, float sides){
position = position * 2.0 - 1.0;
float angle = atan(position.x, position.y);
float slice = PI * 2.0 / sides;
return step(radius, cos(floor(0.5 + angle / slice) * slice - angle) * length(position));
}

void main(){
    vec2 uv = ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
    // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
    // uv += translate;

    vec3 c_1 = vec3(0.1, fract((sin(uv.y + u_time)) * 2.0), fract(cos(uv.x * u_time) * 5.0));

    gl_FragColor = vec4(c_1, 1.0);
}