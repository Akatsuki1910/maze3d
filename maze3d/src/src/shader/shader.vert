precision highp float;
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;
void main(){
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
  vUv=uv;
}