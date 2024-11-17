#version 300 es
precision mediump float;

out vec4 fragColor;
uniform vec2 iResolution; // Canvas resolution
uniform int uOrder;       // Order of the Hilbert curve

// Hilbert curve function
vec2 hilbertCurve(int index, int order) {
    int x = 0, y = 0;
    int n = 1 << order; // 2^order, the grid size

    for (int s = 1; s < n; s *= 2) {
        int rx = (index & 2) >> 1; // Extract bit 1
        int ry = (index & 1);      // Extract bit 0

        // Rotate and flip
        if (ry == 0) {
            if (rx == 1) {
                x = s - 1 - x;
                y = s - 1 - y;
            }
            int temp = x;
            x = y;
            y = temp;
        }

        x += rx * s;
        y += ry * s;
        index >>= 2;
    }
    return vec2(float(x), float(y)) / float(n); // Normalize to [0, 1]
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;

    int n = 1 << uOrder;   // Total grid size (2^order)
    float dMin = 0.01;     // Minimum distance to draw the curve

    // Find the closest line segment
    for (int i = 0; i < (1 << (2 * uOrder)) - 1; i++) {
        vec2 p1 = hilbertCurve(i, uOrder);
        vec2 p2 = hilbertCurve(i + 1, uOrder);

        // Transform to screen space
        p1 = p1 * vec2(iResolution.x / iResolution.y, 1.0);
        p2 = p2 * vec2(iResolution.x / iResolution.y, 1.0);

        // Check distance to the line segment
        float d = distance(uv, p1) + distance(uv, p2) - distance(p1, p2);
        if (d < dMin) {
            fragColor = vec4(0.0, 0.5, 1.0, 1.0); // Blue
            return;
        }
    }

    fragColor = vec4(0.0, 0.0, 0.0, 1.0); // Background color
}

