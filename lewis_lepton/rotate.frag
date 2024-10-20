#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;
uniform float u_time;

mat2 scale(vec2 scale){
    return mat2(scale.x, 0.0, 0.0, scale.y);
} 

mat2 rotate(float angle){
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

const float PI = 3.14159265359;
float polyGEO(vec2 position, float radius, float sides){
    position = position * 2.0 - 1.0;
    float angle = atan(position.x, position.y); 
    float slice = PI * 2.0 / sides;
    return step(radius, cos(floor(0.5 + angle / slice) * slice - angle) * length(position));
}

void main() {
    vec2 uv = ((gl_FragCoord.xy - (u_resolution * 0.0)) / u_resolution);
    vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
    uv += translate;

    // ?coord scale
    // uv -= vec2(0.5);
    // uv = scale(vec2(tan(u_time / 0.5) + 2.0)) * uv;
    // uv += vec2(0.5);

    // ?coord rotate
    uv -= vec2(0.5);
    uv = rotate(PI*u_time
    ) * uv;
    uv += vec2(0.5);

    // uv *= scale(1.0);
    // shapes, colors, fragments output here
    float polygon = polyGEO(uv, 0.3, 5.0);
    vec3 c_geo = vec3(polygon);


    vec3 c_1 = vec3(0.5529, 0.3255, 0.7176);
    vec3 c_2 = vec3(0.0196, 0.0196, 1.0);

    vec3 color = mix(c_geo, c_2, c_1);
    gl_FragColor = vec4(color, 1.0);
} 