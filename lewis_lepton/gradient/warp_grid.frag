#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main(){
    vec2 uv = ((gl_FragCoord.xy - (u_resolution * 0.0)) / u_resolution);
    // vec2 translate = vec2((sin(u_time / 1.3) * 0.5),0.0);
    // uv += translate;
 
    // vec3 c_1 = vec3(0.5, 0.9, 0.4);
    vec3 c_1 = vec3(0.498, 0.0745, 0.5255);
    vec3 c_2 = vec3(0.5255, 0.0745, 0.2157);
    vec3 c_3 = vec3(0.0745, 0.5255, 0.3843);


    c_1 += sin(uv.x * cos(u_time / 6.0) * 60.0) + sin(uv.y * cos(u_time / 6.0) * 10.0); 
    c_1 += cos(uv.y * sin(u_time / 3.0) * 10.0) + cos(uv.x * sin(u_time / 2.0) * 10.0); 

    c_1 += sin(u_time / 10.0) * 0.5;

    vec3 color_out = mix(c_1, c_2, c_3);

    gl_FragColor = vec4(color_out, 1.0);
}   

