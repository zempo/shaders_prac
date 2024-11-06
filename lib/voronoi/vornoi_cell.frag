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

// Hash function for pseudo-random values
vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float random(vec2 st) {
    float noise = sin(u_time / 5.0) - cos(u_time * 1.02 / 9.0);
    noise *= cos(5.0);
    float noise_smooth = smoothstep(-0.25, 0.25, noise);

    float noise_clamp = clamp(noise, -0.25, 0.25);

    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123 + noise_smooth);
}

// Voronoi distance function
float voronoi(vec2 uv) {
     vec2 g = floor(uv);  // Cell grid coordinates
    vec2 f = fract(uv);  // Position within the cell
    
    float min_dist = 1.0;  // Minimum distance for the nearest cell
    
    // Loop through neighboring cells
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            // Calculate neighboring cell coordinates
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = random(g + neighbor) + neighbor;  // Random offset
            
            // Distance to the current cell
            float dist = length(f - point);
            
            // Keep track of the minimum distance
            min_dist = min(min_dist, dist);
        }
    }
    
    return min_dist;
}

void main(){
    float ZOOM = 8.0;
    vec2 uv = ZOOM * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
   float d = voronoi(uv);

    // vec3 color = vec3(d); // Grayscale color based on distance

    // vec3 c_1 = vec3(0.4235, 0.8235, 0.4235);
    vec3 c_1a = vec3(0.6, 0.6941, 0.1882);
    vec3 c_1b = vec3(0.1725, 0.7333, 0.3686);
    // float noise_c1 = clamp((sin(u_time / 100.0)), -0.35, 0.35); 
    float noise_c1 = clamp((sin(u_time / 5.5)), -0.05, 0.05);

    // vec3 c_1 = c_1a / c_1b - noise_c1; 
    vec3 c_1 = (c_1a / c_1b); 


    vec3 c_2 = vec3(0.3294, 0.1176, 0.5882 + noise_c1);

    vec3 c_12 = mix(c_1, c_2, d);

    gl_FragColor = vec4(c_12,1.0);
} 