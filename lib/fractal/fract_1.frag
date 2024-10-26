#version 460

#ifdef GL_ES
precision highp float;
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

void main(){
  vec2 uv = ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
  // uv += translate;

  // float angle = u_time * 0.3;
  float angle = u_time * 0.04;
  for (int i = 0; i < 32; i++){
    uv = abs(uv);
    uv -= 0.5;
    uv *= 1.1;
    uv *= mat2(
      cos(angle), -sin(angle),
      sin(angle), cos(angle)  
    );
  }
  vec3 c_1 = vec3(
    length(uv), 
    length(uv + vec2(0.2, -0.3)),
    length(uv + vec2(0.4, -0.2))
  );

  // float loop_time = cos(6.0);
  // Calculate the alpha value based on time
  float a_1_time = 3.0; // Duration in seconds for the fade
  float a_1_lim = 0.5;   // Target alpha value
  // Calculate the alpha based on the time elapsed
  float a_1 = smoothstep(0.0, a_1_time, u_time) * a_1_lim;
  // Ensure alpha does not go below 0.5
  if (a_1 < 0.8) {
    a_1 = 1.0;
  }
  // float a_1 = alpha;

  FragColor = vec4(c_1, a_1);
}