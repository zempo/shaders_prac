#version 460

// #ifdef GL_ES
// precision highp float;
// #endif

uniform vec2 u_resolution;
uniform float u_time;
// uniform float iTime;

out vec4 FragColor;

// Define a struct to hold each shader pattern's properties
struct P_Obj {
    vec4 pattern;    // Could be color or some other property
    float time_loop; // Duration of the time loop
};

const float PI = 3.14159265359;
float mkPoly(vec2 position, float radius, float sides){
  position = position * 2.0 - 1.0;
  float angle = atan(position.x, position.y);
  float slice = PI * 2.0 / sides;
  return step(radius, cos(floor(0.5 + angle / slice) * slice - angle) * length(position));
}

// Define a struct to hold each shader configuration's properties
struct ShaderConfig {
    vec4 pattern;    // Color or pattern
    float time_loop; // Loop duration
};

// Define an array of shader configurations with specified patterns and time loops
const int NUM_CONFIGS = 4; // Total configurations
ShaderConfig configs[NUM_CONFIGS] = ShaderConfig[](
    ShaderConfig(vec4(1.0, 0.5, 0.5, 1.0), 6.0),  // Reddish color, 3-second loop
    ShaderConfig(vec4(0.5, 1.0, 0.5, 1.0), 5.0),  // Greenish color, 5-second loop
    ShaderConfig(vec4(0.5, 0.5, 1.0, 1.0), 7.0),  // Bluish color, 7-second loop
    ShaderConfig(vec4(1.0, 1.0, 0.5, 1.0), 4.0)   // Yellowish color, 4-second loop
);

// Function to evaluate a configuration based on its time loop
vec4 evaluateConfig(ShaderConfig config, float time) {
    // Calculate loop progress as a factor between 0 and 1
    float loopTime = mod(time, config.time_loop) / config.time_loop;
    
    // Modulate the alpha value of the pattern based on loopTime for a fading effect
    vec3 curr_c = vec3(config.pattern.rgb);

    return vec4(curr_c, 1.0 * loopTime);
}

// Function to apply all configurations in a loop and blend their results
vec4 applyConfigs(float time) {
    vec4 color = vec4(0.0); // Base color

    // Loop over each configuration, accumulate its color
    for (int i = 0; i < NUM_CONFIGS; i++) {
        color += evaluateConfig(configs[i], time);
    }

    // Average the accumulated colors to get the final effect
    return color / float(NUM_CONFIGS);
}

void main() {
  vec2 uv = ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
  // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
  // uv += translate;
  // Call applyConfigs with the current time to calculate the fragment color
  FragColor = applyConfigs(u_time);
}