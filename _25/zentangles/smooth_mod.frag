#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
//uniform sampler2D u_tex;
out vec4 FragColor;

const float PI = 3.1415926535897932384626433832795;
const float TAU = PI * 2.;
const float E = 2.71828182845904523536028747135266;
// http://dev.thi.ng/gradients/
vec3 c_palette( float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

float line(float x, float y, float line_width, float edge_width){
  return smoothstep(x-line_width/2.0-edge_width, x-line_width/2.0, y) - smoothstep(x+line_width/2.0, x+line_width/2.0+edge_width, y);
}

float circle(vec2 pt, vec2 center, float radius, float line_width, float edge_thickness){
  pt -= center;
  float len = length(pt);
  float result = smoothstep(radius-line_width/2.0-edge_thickness, radius-line_width/2.0, len) - smoothstep(radius + line_width/2.0, radius + line_width/2.0 + edge_thickness, len);
return result;
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
  
 //	Classic Perlin 2D Noise
//	by Stefan Gustavson
//
vec4 permute(vec4 x)
{
    return mod(((x*34.0)+1.0)*x, 289.0);
}

void main(){
  float zoom = 1.0;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  // vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

// to subdivide uv space
  // uv = fract(uv * 4.0) - 0.5;
  // uv = fract(uv * 2.0) - .5;
  // float rate = sin(pow(u_time * 1.0,-2.0) + u_time);
  float rate0 = u_time * .5;
  float rate = pow(u_time,E * .33);
  float rate2 = u_time * .005;
  float segments = 1.0 * (TAU + 2.0 + (TAU * sin(rate)));
  // uv = modPolar((uv * 2.), segments);

  // ?? perm 1: rbg bloom
  // vec3 cp1 = c_palette(
  //   rate + uv.y - uv.x,
  //   vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.3922, 0.3922, 0.2627), vec3(0.1686, 0.5373, 0.4824));

  // ?? perm 2: tie dye flower
    // uv = modPolar((uv * rate2), segments);
    // vec3 cp1 = c_palette(
    // (rate * .001) * uv.x,
    // vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.3922, 0.3922, 0.2627), vec3(0.1686, 0.5373, 0.4824));

  // ?? perm 3: tie dye flower
    // segments = 1.0 * (TAU + 10.0 + (TAU * sin(rate)));
    // uv = modPolar((uv * 2.0), segments);
    // vec3 cp1 = c_palette(
    // uv.x + uv.y + rate,
    // vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765));

    // ?? perm 4: candy cane + floral petals (includes ripple)
    //     segments = 1.0 * (TAU + 2.0 + (TAU * sin(rate)));
    // uv = modPolar((uv * 2.0), segments);
    // uvRipple(uv, 1.51, rate);
    // vec3 cp1 = vec3(uv.x, 0.0, uv.y) * vec3(rate) + vec3(pow(uv.x, 2.), pow(uv.y * uv.x, -20.), pow(uv.y * uv.x, 2.));
    // ?? perm 5: psychadelic neuron
    //     segments = 1.0 * (TAU + 6.0 + (TAU * sin(rate)));
    // uv = modPolar((uv * 1.0), segments);
    // uvRipple(uv, 1.51, rate);
    // vec3 cp1 = c_palette(
    // rate + uv.y - uv.x,
    // vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765));
    // ?? perm 5: psychadelic neuron sillouette
    // **** and sub-perms!!!!
        segments = 1.0 * (TAU + 6.0 + (TAU * sin(rate)));
    uv = modPolar((uv * 1.0), segments);
    uvRipple(uv, 1.51, rate);

    // vec3 cp1 = c_palette(
    // rate + uv.y - uv.x,
    // vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765)) * vec3(rate, uv.x, pow(uv.x * uv.y, 200.0));
    // ***** best perms so far
    // vec3 cp1 = c_palette(
    // rate + uv.y - uv.x,
    // vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765)) * vec3(pow(uv.y, -2.0), rate, uv.y);
    vec3 cp1 = c_palette(
    rate + uv.y - uv.x,
    vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765)) * vec3(pow(uv.x * uv.x, 10.0), pow(uv.y * uv.x, -20.0), rate);


    // vec3 cp1 = c_palette(
    // rate + uv.y - uv.x,
    // vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765)) * vec3(rate + pow(uv.x * uv.y, -2.0), pow(uv.x * uv.y, -2.0), pow(uv.x * uv.y, 200.0));
    // vec3 cp1 = c_palette(
    // rate + uv.y - uv.x,
    // vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.5882, 0.5882, 0.3961), vec3(0.1255, 0.4235, 0.3765)) * vec3(rate + pow(uv.x * uv.y, -2.0), pow(uv.x * uv.y, -2.0), pow(uv.x * uv.y, 200.0));


  // vec3 c1 = vec3(uv.x, uv.y, uv.x);
  vec3 c1 = cp1;
  vec3 c_out = c1;
  //glslViewer -l FILE.frag texture.png 
  // or... glslViewer shader.frag textures/*
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}