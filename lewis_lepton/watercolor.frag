#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main(){
    vec2 uv = 6.0 * ((gl_FragCoord.xy - (u_resolution * 0.0)) / u_resolution);
    vec2 translate = vec2(0.0);

    for(int n = 0; n < 8; n++){
       float i = float(n);

        translate = vec2(0.7 / i * sin(i * uv.y + u_time + 0.3 * i) + 0.8, 0.4 / (i * sin(uv.x + u_time + 0.3) + 1.6));
        uv += translate;
    }

    vec3 c_1 = vec3(0.5 * sin(uv.x) + 0.5, 0.5 * sin(uv.y) + 0.5, sin(uv.x + uv.y));
    vec3 c_2 = vec3(0.5 * cos(uv.y), 0.5 * sin(uv.y) + 0.5, sin(uv.x + uv.y));

    float pct = abs(sin(u_time / 2.0));
    vec3 c_mix = mix(c_2, c_1, pct);


    // vec3 color = vec3(uv.x, .75, uv.y);
    gl_FragColor = vec4(c_1, 1.0);
}
