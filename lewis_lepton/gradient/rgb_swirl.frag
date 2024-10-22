#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main(){
  vec2 uv = 2.0 * ((gl_FragCoord.xy - (u_resolution * 0.25)) / u_resolution);
  // vec2 translate = vec2(0.0, -0.25);
  // uv += translate;

  vec3 c_1 = vec3(0.0);
  vec3 c_2 = vec3(0.0);
  vec3 c_3 = vec3(0.0);

  float angle3 = atan(-uv.y + 1.05, uv.x - 0.55) * 0.1;
  float len3 = length(uv - vec2(0.5, 0.25));

  float angle2 = atan(-uv.y - 0.05, uv.x - 1.15) * 0.15;
  float len2 = length(uv - vec2(0.5, 0.25));

  float angle = atan(-uv.y - 0.05, uv.x + 0.15) * 0.15;
  float len = length(uv - vec2(0.5, 0.25));

  float t_1 = u_time / 0.51;
  float t_2 = u_time / 1.0;
  float t_3 = u_time / 0.71;
  float t_12 = sin(u_time / 10.5);
  float t_22 = u_time / 1.0;
  float t_32 = sin(u_time / 10.0);
  c_1.r += sin(len * 50.0 + angle * 60.0 + t_1) + sin(len * 10.0 + angle * 60.0 + t_1);
  c_1.g += 0.0;
  c_1.b += sin(len * 40.0 + angle * 50.0 + t_2);

  c_2.r += sin(len2 * 50.0 + angle2 * 60.0 + t_12) + sin(len2 * 10.0 + angle2 * 60.0 + t_12);
  c_2.g += 0.0;
  c_2.b += 0.0;

  c_3.r += sin(len3 * 50.0 + angle3 * 60.0 + t_1);
  c_3.g += 0.1;
  c_3.b += 0.1;

  vec3 c_4 = vec3(sin(u_time), 0.2, uv.x);

  vec3 c_123 = c_2 + c_1 + c_3 + c_4;

  // c_1.r 

  gl_FragColor = vec4(c_123, 1.0);
}