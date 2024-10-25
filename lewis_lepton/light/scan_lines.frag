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

    float size = 500.0;
    float alpha = sin(floor(size * uv.y * uv.x) + u_time * 5.0 + 1.0 / 2.0); 
    float alpha2 = sin(floor(size * uv.y * uv.x) + u_time * 5.0 + 1.0 / 2.0); 

    alpha += atan(floor(size * uv.y * uv.x) + u_time * 5.0 + 1.0 / 2.0);
    alpha2 -= atan(floor(size * uv.y * uv.x) + u_time * 5.0 + 1.0 / 2.0);

    vec3 c_1 = vec3(0.6431, 0.9373, 0.0549);
    vec3 c_2 = vec3(0.2392, 0.3451, 0.0275);

    vec4 p_1 = vec4(c_1, alpha);
    vec4 p_2 = vec4(c_2, alpha2);

    gl_FragColor = mix(p_1, p_2, 0.2); 
} 