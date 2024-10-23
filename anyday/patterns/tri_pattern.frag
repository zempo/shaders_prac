#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main(){
  vec2 uv = 2.0 * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
  // uv += translate;

  float pattern = fract(
    max(
      abs(uv.x * 1.5 * tan(u_time)) + uv.y + sin(u_time),
      abs(uv.y)
      ) * 15.0
  );
  pattern = step(0.3, pattern);

  vec3 c_1 = vec3(0.4, 0.8902, 0.7176);
  vec3 c_2 = vec3(0.149, 0.4275, 0.5765);

  vec3 c_12 = mix(c_1, c_2 + sin(u_time), pattern);

  gl_FragColor = vec4(c_12, 1.0);
  
}