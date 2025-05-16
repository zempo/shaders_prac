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

const float PI = 3.1415926535897932384626433832795;
const float TAU = PI * 2.;
const float E = 2.71828182845904523536028747135266;

#define RotNum 3
#define angRnd 1.0
#define posRnd 0.0

const float img_weight = sin(0.5*u_time)*0.5+0.5; // Image weight for blending
const float ang = 2.0*3.1415926535/float(RotNum);
mat2 m = mat2(cos(ang),sin(ang),-sin(ang),cos(ang));

// Random number utilities
float hash(float seed) { return fract(sin(seed)*158.5453); }
vec4 getRand4(float seed) { return vec4(hash(seed),hash(seed+123.21),hash(seed+234.32),hash(seed+453.54)); }

// Modified to use our noise texture
vec4 randS(vec2 uv) {
    return texture(u_noise, uv) - vec4(0.5);
}


// ?? usage: vec3 uv_c1 = vec3(uv, 0.0) * vec3(rate);
// ?? usage: coswarp(uv_c1, 3.0);
void coswarp(inout vec3 trip, float warpsScale ){
  trip.xyz += warpsScale * .1 * cos(3. * trip.yzx + (u_time * .25));
  trip.xyz += warpsScale * .05 * cos(11. * trip.yzx + (u_time * .25));
  trip.xyz += warpsScale * .025 * cos(17. * trip.yzx + (u_time * .25));
}

void uvRipple(inout vec2 uv, float intensity, float rate){
  vec2 p = uv -.5;
  float cLength=length(p);
uv = uv +(p/cLength)*cos(cLength*15.0-rate*.5)*intensity;
}

float smoothMod(float x, float y, float e){
  float top = cos(PI * (x/y)) * sin(PI * (x/y));
  float bot = pow(sin(PI * (x/y)),2.);
  float at = atan(top/bot);
  return y * (1./2.) - (1./PI) * at ;
}

vec2 modPolar(vec2 p, float repetitions) {
  float angle = 2.*3.14/repetitions;
  float a = atan(p.y, p.x) + angle/2.;
  float r = length(p);
  //float c = floor(a/angle);
  a = smoothMod(a,angle,033323231231561.9) - angle/2.;
  //a = mix(a,)
  vec2 p2 = vec2(cos(a), sin(a))*r;
  return p2;
}

float stroke(float x, float s, float w){
  float d = step(s, x+ w * .5) - step(s, x - w * .5);
  return clamp(d, 0., 1.);
}

// *Classic Perlin 2D Noise by Stefan Gustavson (improved by Ian McEwan, Ashima Arts)
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
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
    // ??? use image instead
    // fragColor = texture(u_init, uv);
    fragColor = texture(u_img, uv);
}

void main() {
   float zoom = 1.0;
   vec2 uvC = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
   // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
   // uv += translate;
   vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);
    // vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
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
    
    // ?? Advect fluid + image texture 
    vec2 newUV = fract(uv + v*3.0/u_resolution.x);
    float seg = .01 * (TAU + 6.0);
       vec2 mUV = modPolar((newUV * 1.0), seg);
    vec4 fluid = texture(u_buffer1, newUV);
    vec4 texColor = texture(u_img, newUV);

    // Combine fluid with texture (weighted average)
    float p1 = 5.0 * (TAU + 6.0);
        // mouseUV *= modPolar((mouseUV * 1.0), seg);
    FragColor = mix(fluid, texColor, .3);
    
    // Add mouse interaction
    if (u_mouse.x > 0.0 && u_mouse.y > 0.0) {
        vec2 mouseUV = u_mouse/u_resolution;
        float seg = 5.0 * (TAU + 6.0);
        mouseUV *= modPolar((mouseUV * 1.0), seg);
        float dist = distance(uv, mouseUV);
        vec2 force = normalize(uvC - mouseUV) * 0.001/(0.1 + dist*dist);
        FragColor.xy += force;
        FragColor.yz += force;
        FragColor.xz += force;
    }
    
        vec2 uvF = sin(u_frame * .1) + dot(u_mouse.x, u_mouse.y)/u_resolution;
        float seg2 = 5.0 * (TAU + 6.0);
        uvF *= modPolar((uvF * 1.0), seg2);
        float dist = distance(uv, uvF);
        vec2 force2 = normalize(uv - uvF) * 0.003/(0.1 + pow(dist, 2.));
        FragColor.xy += force2;
        FragColor.yz += force2;
        FragColor.xz += force2;

    // Add center motor
    FragColor.xy += (0.01*scr.xy / (dot(scr,scr)/0.1+0.3));
    
    #elif defined(BUFFER_1)
    // PONG BUFFER - Copy with damping
    FragColor = texture(u_buffer0, uv) * 0.99;
    
    #else
    // MAIN DISPLAY - Visualize the result
    vec2 vel = texture(u_buffer0, uv).xy;
    float vorticity = vel.x - vel.y;
    
    // ! Simple color mapping (for debug)
    vec3 col = vec3(0.5) + 0.5*sin(vec3(1.0,2.0,3.0)*vorticity*10.0);
    // FragColor = vec4(col, 1.0);

    
    // Get original texture color
    vec3 texColor = texture(u_img, uv).rgb;
    
    // Create fluid effect color
    vec3 fluidColor = vec3(0.5) + 0.5*cos(vec3(1.0,2.0,3.0)*vorticity*15.0 + u_time);
    
    // Combine with texture using vorticity as blend factor
    float blendFactor = smoothstep(0.0, 0.5, vorticity);
    vec3 finalColor = mix(texColor, fluidColor, blendFactor * 0.7);
    // finalColor += mix(fluidColor, col, blendFactor * .7);
    
    // Add velocity lines
    float velocityLines = 1.0 - smoothstep(0.0, 0.02, abs(dot(normalize(vel), normalize(uv - 0.5))));
    finalColor += velocityLines * 0.3 * vec3(1.0, 1.0, 0.5);
    
    FragColor = vec4(finalColor, 1.0);
    // FragColor = vec4(finalColor, .50);

    // vec3 col = vec3(0.5) + 0.5*sin(vec3(1.0,2.0,3.0)*vorticity*10.0);
    // FragColor +=  vec4(col, .50);
  //  coswarp(col, 1.0); 

    #endif
}