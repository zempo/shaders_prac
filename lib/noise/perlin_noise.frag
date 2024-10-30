#version 460

#ifdef GL_ES
precision mediump float;
#endif
 
uniform vec2 u_resolution;
uniform float u_time;
out vec4 FragColor;


const float PI = 3.14159265359;
const float PI_2 = PI * 2.0;
float mkPoly(vec2 position, float radius, float sides){
position = position * 2.0 - 1.0;
float angle = atan(position.x, position.y);
float slice = PI * 2.0 / sides;
return step(radius, cos(floor(0.5 + angle / slice) * slice - angle) * length(position));
}

float noise(vec3 inp) {
    vec3 i = floor(inp);
    vec3 f = fract(inp);

    f = f * f * (3.0 - 2.0 * f); // Smootherstep interpolation

    float n = dot(i, vec3(1.0, 57.0, 113.0)); // New, smoother hash basis
    return fract(sin(n) * 43758.5453);
}

float perlin_part(vec3 inp)
{
    vec3 fl = floor(inp);
    vec3 fr = fract(inp);
    
    fr = smoothstep(0.0, 1.0, fr);
    
    // changing to "+ 2.0" makes it glitchy
    float L = fl.x;
    float R = fl.x + 1.0;
    float T = fl.y;
    float B = fl.y + 1.0;
    float T0 = fl.z;
    float T1 = fl.z + 1.0;
    
    float LT0 = noise(vec3(L, T, T0));
    float LT1 = noise(vec3(L, T, T1));
    float LB0 = noise(vec3(L, B, T0));
    float LB1 = noise(vec3(L, B, T1));
    float RT0 = noise(vec3(R, T, T0));
    float RT1 = noise(vec3(R, T, T1));
    float RB0 = noise(vec3(R, B, T0));
    float RB1 = noise(vec3(R, B, T1));
    
    float LT = LT0 * (1.0 - fr.z) + LT1 * fr.z;
    float LB = LB0 * (1.0 - fr.z) + LB1 * fr.z;
    float RT = RT0 * (1.0 - fr.z) + RT1 * fr.z;
    float RB = RB0 * (1.0 - fr.z) + RB1 * fr.z;
    
    float l = LT * (1.0 - fr.y) + LB * fr.y;
    float r = RT * (1.0 - fr.y) + RB * fr.y;
    
    float final = l * (1.0 - fr.x) + r * fr.x;
    
    return final;
}

vec3 colors0[10] = vec3[10](
    vec3(0.1, 0.4, 0.7), // Deep blue
    vec3(0.2, 0.5, 0.8), // Soft sky blue
    vec3(0.15, 0.45, 0.65), // Muted ocean blue
    vec3(0.1, 0.45, 0.6), // Teal blue
    vec3(0.08, 0.35, 0.55), // Dark cyan
    vec3(0.12, 0.48, 0.7), // Sea blue
    vec3(0.1, 0.4, 0.5), // Slate teal
    vec3(0.18, 0.42, 0.7), // Cornflower blue
    vec3(0.1, 0.35, 0.65), // Stormy blue
    vec3(0.12, 0.4, 0.6)); // Aqua marine
    
vec3 colors1[3] = vec3[3](
    vec3(0.48, 0.09, 0.15), // Deep Ruby
    vec3(0.69, 0.19, 0.66), // Amethyst Purple
    vec3(0.85, 0.50, 0.54));  // Olive Green
    
vec3 colors2[3] = vec3[3](
    vec3(1.0, 0.78, 0.86),  // Light Pink
    vec3(1.0, 0.56, 0.71),  // Hot Pink
    vec3(1.0, 0.88, 0.0));    // Sunset Yellow
    
vec3 colors3[3] = vec3[3](
    vec3(0.18, 0.1, 0.32),  // Dark Cosmic Blue
    vec3(0.52, 0.33, 0.75), // Purple Nebula
    vec3(0.9, 0.8, 0.18));   // Pastel Aqua);    // Sunset Yellow

float perlin(vec3 inp)
{
    // int layers = 15;
    int layers = 15;
    // float mult = 0.85;
    float mult = 0.85;

    
    inp += 3.0;

    float f = 0.0;
    float m = 1.0;
    float s = 0.0;
    for (int i = 0; i < layers; i++)
    {
        f += perlin_part(inp / m) * m;
        s += m;
        m *= mult;
    }
    f /= s;
    return 0.5 + 0.5 * sin(f * PI_2);
}


void main(){
    float ZOOM = 4.5;
    vec2 uv = ZOOM * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
    // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
    // uv += translate;

    uv += u_time * 0.04;
    
    bool PLUS_SHADING = true;
    
    /**
        float r = perlin(vec3(uv * 0.7, u_time * 0.05));
    float g = perlin(vec3(1.0 + uv * 0.7, u_time * 0.05));
    float b = perlin(vec3(2.0 + uv * 0.7, u_time * 0.05));
    */ 
    float r = perlin(vec3(uv * 0.7, u_time * 0.05));
    float g = perlin(vec3(2.0 + uv * 0.7, u_time * 0.05));
    float b = perlin(vec3(1.0 + uv * 0.7, u_time * 0.05));
    // float d = perlin(vec3(3.0 + uv * 2.0, u_time * 0.07)) * 3.0; 
    float d = PLUS_SHADING ? perlin(vec3(3.0 + uv * 2.0, u_time * 0.07)) * 3.0 : 1.0;
    
    float v = 5.0;
    
    FragColor = vec4(round(vec3(r * 2.8, 0.1 * g, b) / d * v) / v, 1.0);
}