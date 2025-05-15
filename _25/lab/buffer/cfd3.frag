#version 460

#ifdef GL_ES
precision mediump float;
#endif

// Ping-pong buffer system for fluid simulation
uniform sampler2D u_buffer0; // Read buffer
uniform sampler2D u_buffer1; // Write buffer
uniform sampler2D u_noise;   // Noise texture (replaces iChannel1)
uniform sampler2D u_init;    // Initial state texture (replaces iChannel2)
uniform sampler2D   u_img; 
uniform vec2 u_resolution;
uniform float u_time;
uniform int u_frame;
uniform vec2 u_mouse;

out vec4 FragColor;

#define RotNum 3
#define angRnd 1.0
#define posRnd 0.0

const float ang = 2.0*3.1415926535/float(RotNum);
mat2 m = mat2(cos(ang),sin(ang),-sin(ang),cos(ang));

// Random number utilities
float hash(float seed) { return fract(sin(seed)*158.5453); }
vec4 getRand4(float seed) { return vec4(hash(seed),hash(seed+123.21),hash(seed+234.32),hash(seed+453.54)); }

// Modified to use our noise texture
vec4 randS(vec2 uv) {
    return texture(u_noise, uv) - vec4(0.5);
}

float getRot(vec2 uv, float sc) {
    float ang2 = angRnd*randS(uv).x*ang;
    vec2 p = vec2(cos(ang2),sin(ang2));
    float rot=0.0;
    
    for(int i=0;i<RotNum;i++) {
        vec2 p2 = (p+posRnd*randS(uv+p*sc).xy)*sc;
        vec2 v = texture(u_buffer0, fract(uv+p2)).xy-vec2(0.5);
        rot+=cross(vec3(v,0.0),vec3(p2,0.0)).z/dot(p2,p2);
        p = m*p;
    }
    return rot/float(RotNum);
}

void init(out vec4 fragColor, in vec2 uv) {
    fragColor = texture(u_init, uv);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    #ifdef BUFFER_0
    // PING BUFFER - Fluid simulation
    if (u_frame <= 4) {
        init(FragColor, uv);
        return;
    }
    
    vec2 scr = uv*2.0-vec2(1.0);
    float sc = 1.0/max(u_resolution.x, u_resolution.y);
    vec2 v = vec2(0);
    
    for(int level=0;level<20;level++) {
        if (sc > 0.7) break;
        float ang2 = angRnd*ang*randS(uv).y;
        vec2 p = vec2(cos(ang2),sin(ang2));
        
        for(int i=0;i<RotNum;i++) {
            vec2 p2 = p*sc;
            float rot = getRot(uv+p2, sc);
            v += p2.yx*rot*vec2(-1,1);
            p = m*p;
        }
        sc *= 2.0;
    }
    
    // Advect fluid
    vec2 newUV = fract(uv + v*3.0/u_resolution.x);
    FragColor = texture(u_buffer1, newUV);
    
    // Add mouse interaction
    if (u_mouse.x > 0.0 && u_mouse.y > 0.0) {
        vec2 mouseUV = u_mouse/u_resolution;
        float dist = distance(uv, mouseUV);
        vec2 force = normalize(uv - mouseUV) * 0.001/(0.1 + dist*dist);
        FragColor.xy += force;
    }
    
    // Add center motor
    FragColor.xy += (0.01*scr.xy / (dot(scr,scr)/0.1+0.3));
    
    #elif defined(BUFFER_1)
    // PONG BUFFER - Copy with damping
    FragColor = texture(u_buffer0, uv) * 0.99;
    
    #else
    // MAIN DISPLAY - Visualize the result
    vec2 vel = texture(u_buffer0, uv).xy;
    float vorticity = vel.x - vel.y;
    
    // Simple color mapping
    vec3 col = vec3(0.5) + 0.5*sin(vec3(1.0,2.0,3.0)*vorticity*10.0);
    FragColor = vec4(col, 1.0);
    #endif
}