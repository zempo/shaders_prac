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

void main()
{
    vec2 st = gl_FragCoord.xy/u_resolution;
    vec3 color = vec3(0.0);

    st *= 3.0;      // Scale up the space by 3

    vec2 rotated_st = vec2(st.x - 0.5, st.y - 0.5);
    rotated_st = vec2(rotated_st.x - rotated_st.y, rotated_st.x + rotated_st.y);
    rotated_st *= sqrt(2.0) / 2.0;
    // rotated_st += rotate(PI * u_time) * st;

    rotated_st = fract(rotated_st); // Wrap around 1.0
    color = vec3(rotated_st,0.0);
    FragColor = vec4(color,1.0);
}