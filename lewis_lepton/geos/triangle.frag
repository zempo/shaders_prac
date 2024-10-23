#ifdef GL_ES
  precision highp float; 
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main(){
	vec2 uv = (gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y;
	/* Normalize our screen coordinates between 0.0 and 1.0 
     For Color */
 // vec2 uv = gl_FragCoord.xy / u_resolution;
  
	// vec3 color = mix(c1, c2, uv.x);
  // vec3 color = vec3(1.0 - uv_clr.x, .5, 1.0 - uv_clr.y);
	
  // Mix colors  
  vec3 c1 = vec3(0.0, 0.2, 0.15);
  vec3 c2 = vec3(1.0, 0.5, 0.5);
  
  // To position based on step size
  float step_size = 0.15;
  float step_max = step_size + 0.2;
  float step_norm = (2.0/step_size);
  
  // sine translate
  vec2 translate = vec2(sin(u_time / 1.25),(cos(u_time / 1.25) / 3.0));
  uv += translate;
  
  float x1 = 0.0;
  float y1 = 0.0;
  vec2 pos = vec2(x1,y1);
  float geo1 = length(uv - pos);
  geo1 = smoothstep(step_size,step_max,geo1);
  
  // rectangle/square
  float geo2 = max(
    abs(uv.x),
    abs(uv.y)
  );
  geo2 = smoothstep(step_size,step_max,geo2);
  
  // triangle
  float tri_type = 1.5;
  // Short isosceles < 1.0 | Equilateral (1.0) | Tall isosceles > 1.0 
  float geo3 = max(
    abs(uv.x * tri_type) - uv.y,
    abs(uv.y)
  );
  geo3 = smoothstep(step_size,step_max,geo3);
  
  // float c_all = length(uv);
  // float c_all = geo2;
  float c_all = geo3;
  
  vec3 c3 = vec3(sin(c_all + u_time),c_all,step(c_all,step_size));
  vec3 c4 = vec3(step(c_all,step_size),c_all,sin(c_all + u_time));
  
  vec3 color = mix(c3, c4, geo3);
	
  gl_FragColor = vec4(color, 1.0);
}