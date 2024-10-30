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

void main(){
  float ZOOM = 2.0;
  vec2 uv = ZOOM * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
  // uv += translate;
  
  vec3 L_1 = vec3(0.0);

  float radius = 0.5;
  float arc = 360.0;
  int lights = 20;
  float lights_div = float(lights) * 2.0;
  for(int i = 0; i < lights; i++){
    float rad = radians(arc * 2 / lights_div) * float(i);

    L_1 += 0.1 * 0.1 / length(uv + vec2(radius * cos(rad * u_time), radius * sin(rad * u_time)));
  }

  vec3 c_1 = vec3(0.2078, 0.8157, 0.1529);
  vec3 c_2 = vec3(0.1765, 0.2588, 0.1765);

  vec3 c_12 = mix(c_2, c_1, L_1);

  FragColor = vec4(c_12, 1.0);
}