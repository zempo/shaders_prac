#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
//uniform sampler2D u_tex;
uniform sampler2D u_tex1,u_tex2,u_tex3,u_tex4,u_tex5,u_tex6;
out vec4 FragColor;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;
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

void main(){
  float zoom = 1.0;
  // vec2 uv = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  //for textures, use below
  vec2 uv_r = zoom * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  vec2 uv = zoom * (gl_FragCoord.xy / u_resolution.xy);

    float duration = 3.5;
    float delay = 1.5;

float total_time = duration + delay;
float time_in_phase = mod(u_time, total_time);

vec3 c_portal = vec3(0.0588, 0.4431, 0.4902);

if (time_in_phase <= delay) {
    // Delay phase: No ripple effect
    uv = uv;
} else {
    // Effect phase: Ripple effect
    float effect_time = time_in_phase - delay; // Time relative to the start of the effect
    float len = fract(length(uv_r) * 5.0); 
    vec2 ripple = uv + uv / len * 0.03 * cos(len * 20.0 - effect_time * 4.0);
    float delta = (sin(effect_time * (2.0 * PI / duration)) + 1.0) / 2.0;
    uv = mix(ripple, uv, delta);
}

  // float len = fract(length(uv_r) * 3.0); 
  // vec2 ripple = uv + uv/len*0.03*cos(len*40.0-u_time*8.0);
  // float delta = (sin(mod(u_time, duration) * (2.0*PI/duration))+1.0)/2.0;
  // uv = mix(ripple, uv, delta); 
  
  vec3 t1 = texture2D(u_tex1, uv).rgb;
  vec3 t2 = texture2D(u_tex2, uv).rgb;
  vec3 t3 = texture2D(u_tex3, uv).rgb;
  vec3 t4 = texture2D(u_tex4, uv).rgb;
  vec3 t5 = texture2D(u_tex5, uv).rgb;
  vec3 t6 = texture2D(u_tex6, uv).rgb;

  vec3 a1[6] = vec3[6](
    t1,t2,t3,t4,t5,t6
  );
  int a1_idx = int(mod(u_time/5.0, 6.0)); // Modulo cycles between 0, 1, 2...etc over time
  int a2_idx = (a1_idx == 5) ? 0 : a1_idx + 1; // Modulo cycles between 0, 1, 2...etc over time
  vec3 a_out1 = a1[int(a1_idx)];
  vec3 a_out1_next = a1[int(a2_idx)];

  
  vec3 c_out = a_out1;
  if (time_in_phase < delay) {
    c_out = a_out1;

  } else {
    float effect_timeb = time_in_phase - delay; // Time relative to the start of the effect
    c_out = mix(a_out1, a_out1_next + c_portal, -cos(effect_timeb) * 0.70);
  }
  //glslViewer -l FILE.frag texture.png 
  //FragColor = texture2D(u_tex, uv);
  FragColor = vec4(c_out, 1.0);
}