#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

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

mat2 scale(vec2 scale){
  return mat2(scale.x, 0.0, 0.0, scale.y);
}

void main(){
  vec2 uv = ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
  uv += translate;

  // ! you have to ROTATE before you define pattern
  // uv -= vec2(0.5);
  // uv = rotate(PI) * uv;
  // uv += vec2(0.5);
  // uv.y = uv.y * 2.0 - 1.0;

  float pattern = mkPoly(fract(uv * 5.0), 0.3, 5.0);

  // pattern -= vec2(0.5);
  // pattern = rotate(PI + u_time) * pattern;
  // pattern += vec2(0.5);

  uv.y += 0.55; // !needs vert shift
  float freq = 22.0 - tan(u_time);
  float p_1 = max(
    abs(fract(uv.x * freq) * 2.0 - 1.0) + fract(uv.y * freq),
    abs(fract(uv.y * freq))
  );
  p_1 = step(0.5, p_1);
  // step(0.3, p_2); smoothstep(size,blur,p_2);


  vec3 c_1 = vec3(1.0, 0.2, 0.5);
  vec3 c_2 = vec3(sin(u_time), 0.2, 0.7);
  vec3 c_3 = vec3(sin(u_time), 0.702, 0.5098);
  vec3 c_4 = vec3(0.702, 0.3333, 0.2);

  vec3 c_12 = mix(c_3, c_2, p_1);
  vec3 c_34 = mix(c_3, c_4, pattern);

  // vec3 c_1234 = c_12 + c_34;

  gl_FragColor = vec4(c_12, 1.0);

}