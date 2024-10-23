#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float circleGEO(vec2 position, float radius){
    return step(radius, length(position - vec2(0.5)));
}

void main(){
    vec2 uv = ((gl_FragCoord.xy - (u_resolution * 0.0)) / u_resolution);
    // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
    // uv += translate;

    float x_cnt = 4.0;
    float y_cnt = 4.0;

    vec3 c_1 = vec3(0.0);
    c_1.r += sin(fract(uv.x * x_cnt) + (u_time / 0.5));
    c_1.g += cos(u_time);
    c_1.b += fract(uv.y * y_cnt);

    int loop = int(y_cnt * x_cnt);

    for(int i = 1; i < 16; i++){
        vec2 curr_pos = vec2(uv.x, uv.y);
        float g_curr = circleGEO(uv, 0.2);
    }

    float g_1 = circleGEO(vec2(uv.x + 0.38, uv.y - 0.38), 0.05);

    vec3 c_g = vec3(g_1);

    vec3 c_mix = mix(c_1, c_g, 0.2);


    gl_FragColor = vec4(c_mix, 1.0);
}