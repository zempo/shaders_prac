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

vec4 c_portal = vec4(0.0667, 0.3765, 0.1137 * time_in_phase, 0.114);

if (time_in_phase < delay) {
    // Delay phase: No ripple effect
    uv = uv;
} else {
    // Effect phase: Ripple effect
    float effect_time = time_in_phase - delay; // Time relative to the start of the effect
    float len = fract(length(uv_r) * 2.0); 
    vec2 ripple = uv + uv / len * 0.03 * cos(len * 40.0 - effect_time * 3.5);
    float delta = (sin(effect_time * (2.0 * PI / duration)) + 1.0) / 2.0;
    uv = mix(ripple, uv, delta);
}

  // float len = fract(length(uv_r) * 3.0); 
  // vec2 ripple = uv + uv/len*0.03*cos(len*40.0-u_time*8.0);
  // float delta = (sin(mod(u_time, duration) * (2.0*PI/duration))+1.0)/2.0;
  // uv = mix(ripple, uv, delta); 
  
  vec4 t1 = texture2D(u_tex1, uv);
  vec4 t2 = texture2D(u_tex2, uv);
  vec4 t3 = texture2D(u_tex3, uv);
  vec4 t4 = texture2D(u_tex4, uv);
  vec4 t5 = texture2D(u_tex5, uv);
  vec4 t6 = texture2D(u_tex6, uv);
  vec4 t1_p = texture2D(u_tex1, uv);
  vec4 t2_p = texture2D(u_tex2, uv);
  vec4 t3_p = texture2D(u_tex3, uv);
  vec4 t4_p = texture2D(u_tex4, uv);
  vec4 t5_p = texture2D(u_tex5, uv);
  vec4 t6_p = texture2D(u_tex6, uv);
  vec4 a1[6] = vec4[6](
    t1,t2,t3,t4,t5,t6
  );
  vec4 a2[6] = vec4[6](
    t1_p,t2_p,t3_p,t4_p,t5_p,t6_p
  );
  int a1_idx = int(mod(u_time/5.0, 6.0)); // Modulo cycles between 0, 1, 2...etc over time
  vec4 a_out1 = a1[int(a1_idx)];
  vec4 a_out2 = a2[int(a1_idx)];
  
  vec4 c_out = a_out1;
  if (time_in_phase < delay) {
    c_out = a_out1;

  } else {
    c_out = a_out1 + c_portal;
  }
  //glslViewer -l FILE.frag texture.png 
  //FragColor = texture2D(u_tex, uv);
  FragColor = c_out;
}