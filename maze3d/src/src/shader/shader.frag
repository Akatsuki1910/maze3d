// #define time t
// #define resolution r
// #define mouse m
precision highp float;

uniform vec2 mouse;// mouse
uniform float time;// time
uniform vec2 resolution;// resolution
uniform sampler2D smp;// prev scene
const float PI=3.1415926;
varying vec2 vUv;

vec3 hsv(float h,float s,float v){
  vec4 t=vec4(1.,2./3.,1./3.,3.);
  vec3 p=abs(fract(vec3(h)+t.xyz)*6.-vec3(t.w));
  return v*mix(vec3(t.x),clamp(p-vec3(t.x),0.,1.),s);
}

void main(){
  vec2 fuv=resolution*vUv;
  vec2 p=(fuv.st*2.-resolution)/resolution;
  vec3 line=vec3(0.);
  for(float fi=0.;fi<10.;++fi){
    float timer=time*fi*.1;
    vec3 color=hsv((fi+time)*.1,1.,1.);
    line+=.005/abs(p.y+sin(p.x+timer))*color;
  }
  gl_FragColor=vec4(line,1.);
}