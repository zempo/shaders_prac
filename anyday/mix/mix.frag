#version 460

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
out vec4 FragColor;

const float PI = 3.14159265359;
float mkPoly(vec2 position, float radius, float sides){
  position = position * 2.0 - 1.0;
  float angle = atan(position.x, position.y);
  float slice = PI * 2.0 / sides;
  return step(radius, cos(floor(0.5 + angle / slice) * slice - angle) * length(position));
}

mat2 rotate(float angle){
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main(){
  vec2 uv = ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  vec2 translate = vec2((sin(u_time / 2.0) * 0.25),0.0);
  uv += translate;
  vec2 uv_2 = uv;
  // vec3 c_1 = vec3(1.0);
  float T = u_time * 0.2;
  // ?make sure PI is included!!
  // ? Also, rotation happens in Radians
  // ! Also, ROTATE before you define pattern
  // uv_2 -= vec2(0.5);
  uv_2 = rotate(PI * T) * uv_2;
  // uv_2 += vec2(0.5); 

  uv.y += 0.8; // !needs vert shift
  float freq = 9.0;
  float p_1 = max(
    abs(fract(uv.x * freq) * 2.0 - 1.0) + fract(uv.y * freq),
    abs(fract(uv.y * freq + cos(T)))
  );
  p_1 = step(0.3, p_1);
  // ?make sure PI is included!!
  // ? Also, rotation happens in Radians
  // ! Also, ROTATE before you define pattern
  // p_1 -= vec2(0.5);
  // p_1 = rotate(PI * u_time);
  // p_1 += vec2(0.5);

  float freq2 = 9.0;
  // (abs(length(uv * inner_radius) - radius));
  float p_2 = abs(distance(fract(uv * freq2), vec2(0.5)) - 0.2);
  float ring_step = 0.05;
  float ring_blur = ring_step + 0.1;
  p_2 = smoothstep(ring_step,ring_blur,p_2);

  float freq3 = 60.0;
  float p_3 = fract(max(
    abs(uv_2.x),
    abs(uv_2.y) 
  ) * freq3);
  p_3 = step(0.1, p_3);
  // step(0.3, p_2);

  /**
  * ? '*': multiplication adds patterns together
  * ? '/': first pattern remains, second is unseen
  * ? '+': returns pixels where both patterns intersect 
  * ? '-': subtracts area of first from second
  */ 
  // vec3 c_1 = vec3(p_1 * p_2, 0.8, 0.6);
  // vec3 c_1 = vec3(p_1, 0.54, p_2); 
  // vec3 c_1 = vec3(p_2, 0.54, p_2 + p_1); // pattern in color channels
  vec3 c_1 = vec3(0.0784, 0.5922, 0.3686);
  vec3 c_2 = vec3(0.6902, 0.949, 1.0);
  vec3 c_3 = vec3(uv.y * T, 0.3, uv.x * T);
  vec3 c_4 = vec3(0.4118, 0.5765, 0.4706);
  c_4 += sin(uv_2.x * cos(u_time / 6.0) * 200.0) + sin(uv_2.y * cos(u_time / 6.0) * 100.0); 
  c_4 += cos(uv.y * sin(u_time / 3.0) * 10.0) + cos(uv.x * sin(u_time / 2.0) * 10.0); 
  c_4 += sin(u_time / 10.0) * 0.1;

  vec3 c_12 = mix(c_1, c_2, p_1 * p_2);
  vec3 c_123 = mix(c_3, c_12, p_3);
  vec3 c_1234 = mix(c_4, c_123, p_1);

  FragColor = vec4(c_1234, 1.0);
}