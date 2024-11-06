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

vec2 hash(vec2 pos){
    float hash_size = 18.5453;
    pos = vec2(
        dot(pos, vec2(127.1, 311.7)),
        dot(pos, vec2(269.5, 183.3))
    );
    return fract(sin(pos) * hash_size);
}

vec2 voronoi(vec2 x) {
    vec2 n = floor( x );
    vec2 f = fract( x );

	vec3 m = vec3( 8.0 );
    for( int j=-1; j<=1; j++ ) {
        for( int i=-1; i<=1; i++ ) {
            vec2  g = vec2( float(i), float(j) );
            vec2  o = hash( n + g );
            //vec2  r = g - f + o;
	        vec2  r = g - f + (0.5+0.5*sin(u_time+6.2831*o));
		    float d = dot( r, r );
            if( d<m.x ) {
                m = vec3( d, o );
            }
        }
    }

    return vec2( sqrt(m.x), m.y+m.z );
}

void main(){
    vec2 uv = 0.5 * ((gl_FragCoord.xy - (u_resolution.xy * 0.5)) / u_resolution.y);
    // vec2 translate = vec2((sin(u_time / 1.0) * 0.25),0.0);
    // uv += translate;

    // vec3 c_1 = vec3(1.0, 0.2, smoothstep(-0.5, 0.5, uv.x));

    // computer voronoi patterm
    //  still 
    vec2 p_1 = voronoi( (14.0+6.0)* uv);
    // moving
    vec2 p_2 = voronoi( (14.0+6.0*sin(0.2*u_time))* uv);


    // colorize
    vec3 c_1 = 0.5 + 0.5*cos( p_1.y*6.2831 + vec3(0.0,1.0,2.0) );	
    c_1 *= clamp(1.0 - 0.4*p_1.x*p_1.x,0.0,1.0);
    c_1 -= (1.0-smoothstep( 0.08, 0.09, p_1.x));   

    gl_FragColor = vec4(c_1, 1.0);
}