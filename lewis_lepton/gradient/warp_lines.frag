#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main(){
  vec2 uv = 2.0 * ((gl_FragCoord.xy - (u_resolution.y * 0.0)) / u_resolution);
  // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
  // uv += translate;
  // vec2 uv = (abs(cos(u_time / 4.0) + 2.0)) * ((gl_FragCoord.xy - (u_resolution.y * 0.0)) / u_resolution);
  // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
  // uv += translate;

  float c_val1 = 0.0;
  float wavy1 = 0.5; // controls waviness size
  c_val1 += sin(uv.x * 50.0 + cos((u_time + uv.y * 10.0 + sin(uv.x * 50.0 + u_time * 2.0)) / wavy1)) * 2.0;
  c_val1 += cos(uv.x * 50.0 + sin((u_time + uv.y * 10.0 + cos(uv.x * 50.0 + u_time * 2.0)) / wavy1)) * 2.0;
  c_val1 += sin(uv.x * 45.0 + cos((u_time + uv.y * 10.0 + sin(uv.x * 45.0 + u_time * 2.0)) / wavy1)) * 2.0;
  c_val1 += cos(uv.x * 45.0 + sin((u_time + uv.y * 10.0 + cos(uv.x * 45.0 + u_time * 2.0)) / wavy1)) * 2.0;
  c_val1 += sin(uv.x * 40.0 + cos((u_time + uv.y * 10.0 + sin(uv.x * 40.0 + u_time * 2.0)) / wavy1)) * 2.0;
  c_val1 += cos(uv.x * 40.0 + sin((u_time + uv.y * 10.0 + cos(uv.x * 40.0 + u_time * 2.0)) / wavy1)) * 2.0;
  // c_val1 += sin(uv.x * 30.0 + cos((u_time + uv.y * 10.0 + sin(uv.x * 50.0 + u_time * 2.0)) / wavy1)) * 2.0;
  // c_val1 += cos(uv.x * 20.0 + sin((u_time + uv.y * 10.0 + cos(uv.x * 50.0 + u_time * 2.0)) / wavy1)) * 2.0;

  vec3 c_1 = vec3(c_val1 + uv.y + sin((u_time / wavy1)), c_val1 + uv.x + sin((u_time / wavy1)), c_val1);
  vec3 c_2 = vec3(uv.x + cos((u_time / wavy1 / 2.0)) + 0.6, uv.x + cos((u_time / wavy1 / 2.0)), sin(u_time / wavy1) + cos(u_time));
  vec3 c_3 = vec3(0.6118, 0.0431, 0.4588);

  float pct = abs(sin(u_time / wavy1) + 0.5);
  vec3 c_mix = mix(c_1, c_2, pct);

  vec3 c_mix_2 = mix(c_3, c_mix, 0.8);
 
  gl_FragColor = vec4(c_mix_2, 1.0);
}