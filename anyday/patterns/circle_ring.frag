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

void main(){
  vec2 uv = ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
  // uv += translate;

  // rgb % _,_,_
  // ??? perm 1
  // float pattern = fract(distance(uv, vec2(0.0)) * (10.0 + sin(u_time / 1.0)));
  // float pattern2 = fract(max(abs(uv.x), abs(uv.y)) * (15.0 + sin(u_time / 2.0)));
  // ??? perm 2
  float pattern = fract(distance(uv, vec2(0.0)) * (10.0 + cos(u_time / 1.0)));
  float pattern2 = fract(max(abs(uv.x), abs(uv.y)) * (15.0 + sin(u_time / 2.0)));

    // pattern -= vec2(0.5);
    pattern += rotate(PI*u_time
    ); 
    // pattern2 -= rotate(PI*(u_time / 20.0)
    // ); 
    // pattern += vec2(0.5);

  vec3 c_1 = vec3(1.0, 0.2, 0.5);
  vec3 c_2 = vec3(0.5, 0.2, 0.7);
  vec3 c_3 = vec3(0.2, 0.702, 0.5098);
  vec3 c_4 = vec3(0.702, 0.3333, 0.2);

  vec3 c_12 = mix(c_1, c_2, pattern);
  vec3 c_34 = mix(c_3, c_4, pattern2);

  vec3 c_1234 = c_12 + c_34;

  gl_FragColor = vec4(c_1234, 1.0);
}