#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
out vec4 FragColor;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;
vec3 c_palette( float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * (cos(TAU * (c * t + d)));
}

float sdMoon(vec2 p, float d, float ra, float rb )
{
    p.y = abs(p.y);
    float a = (ra*ra - rb*rb + d*d)/(2.0*d);
    float b = sqrt(max(ra*ra-a*a,0.0));
    if( d*(p.x*b-p.y*a) > d*d*max(b-p.y,0.0) )
          return length(p-vec2(a,b));
    return max( (length(p          )-ra),
               -(length(p-vec2(d,0))-rb));
}

void main(){
  float zoom = 1.75;
  vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  vec2 uv_reset = uv; // for color changing entire coords
  vec3 c_out = vec3(0.0);
  // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
  // uv += translate;  

  float t_rate = (u_time * 0.8);
  for(float i = 0.0; i < 3.0; i++){
    uv = fract(uv * 2.0) - 0.5;

    float p_1b = sdMoon( uv, u_time, 0.7, 1.8);
    float p_1 = length(uv) * exp(-length(uv_reset)) - p_1b;
    // float p_1 = length(uv) * exp(-length(uv_reset));
    float p_2 = length(uv_reset);

    vec3 c_1 = c_palette(
      p_2 + (i*0.4) + t_rate,
      vec3(0.6941, 0.2235, 0.2627), vec3(0.5765, 0.3451, 0.2275), vec3(0.3922, 0.3922, 0.2627), vec3(0.1686, 0.5373, 0.4824));

    float freq = 8.0;

    p_1 = sin((p_1 * freq) + t_rate) / freq;
    p_1 = abs(p_1);
    // p_1 /= p_1b;

    // p_1 = smoothstep(0.0, 0.1, p_1);
    // p_1 = 0.02 / p_1;
    p_1 = 0.01 / p_1;
    c_out += (p_1) * c_1;
  }

  FragColor = vec4(c_out, 1.0);
}