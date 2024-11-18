#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
out vec4 FragColor;

const float PI = 3.14159265359;
float mkBubbleCross(vec2 pos, float he){
    pos = abs(pos);
    pos = vec2(abs(pos.x - pos.y),1.0 - pos.x - pos.y)/sqrt(2.0);

    float p = (he-pos.y-0.25/he)/(6.0*he);
    float q = pos.x/(he * he * 16.0);
    float h = q * q - p * p * p;
    
    float x;
    if( h > 0.0 ) { float r = sqrt(h); x = pow(q+r,1.0/3.0)-pow(abs(q-r),1.0/3.0)*sign(r-q); }
    else { float r = sqrt(p); x = 2.0*r*cos(acos(q/(p*r))/3.0); }
    x = min(x,sqrt(2.0)/2.0);
    
    vec2 z = vec2(x,he*(1.0-2.0*x*x)) - pos;
    return length(z) * sign(z.y);
}

void main(){
    vec2 uv = ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
    // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
    vec2 uv_2 = uv + vec2((sin(u_time / 1.0) * 0.25), 0.0);
    uv *= 14.0;
    uv_2 *= 14.0;
    vec3 c_1 = vec3(0.0392, 0.2471, 0.1176);
    vec3 c_2 = vec3(0.6, 0.4824, 0.102);

    float he = sin(u_time*0.43+4.0); he = (0.001+abs(he)) * ((he>=0.0)?1.0:-1.0);
    float ra = 0.1 + 0.5*(0.5+0.5*sin(u_time*1.7)) + max(0.0,he-0.7);
 
    float p_1 = mkBubbleCross( uv, he ) - ra;
    float p_2 = mkBubbleCross( uv_2, he ) - ra;

    p_1 += fract(p_1 * 2.0);
    p_2 += fract(p_2 * 2.0);


    // p_1 += mkBubbleCross( uv, he ) - ra;

    vec3 c_12 = mix(c_1, c_2, p_2 / p_1);

    FragColor = vec4(c_12, 1.0);
}