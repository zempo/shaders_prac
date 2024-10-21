#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

const int LOOP = 12;
void main(){
    const float ZOOM = 22.0;
    vec2 uv = ZOOM * ((gl_FragCoord.xy - u_resolution / 2.0) / min(u_resolution.y, u_resolution.x));
    // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
    // uv += translate;

    float len;
    for(int i = 0; i < LOOP; i++){
        len = length(vec2(uv.x, uv.y));

        uv.x = uv.x - cos(uv.y + sin(len)) + cos(u_time / 9.0);
        uv.y = uv.y + sin(uv.x + cos(len)) + sin(u_time / 12.0); 
    }

    // vec3 c_1 = vec3();
    gl_FragColor = vec4(tan(len * (0.01 + (sin(u_time) / 60.0))), cos(len * 0.2), cos(len * 0.1), 1.0);
}
