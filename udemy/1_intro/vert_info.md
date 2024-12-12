modelMatrix: moves vertex from local to world space
viewMatrix: vertex from world space to camera view\
projectionMatrix: vertex to clip space to clip space screen coords
modelViewMatrix: combines result of modelMatrix and viewMatrix

---

```glsl
  // swap color order
  gl_FragColor = vec4(u_c1, 1.0).grba;
```
