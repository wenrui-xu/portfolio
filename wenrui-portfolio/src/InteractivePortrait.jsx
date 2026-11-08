import React, {useEffect, useRef} from 'react';
import {useLocale} from './locale';

const WIDTH = 1370;
const HEIGHT = 1148;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const EYES = [
  {x: 816, y: 518, rx: 61, ry: 47, irisRx: 18, irisRy: 19, atlasX: 502, atlasY: 479},
  {x: 930, y: 476, rx: 49, ry: 45, irisRx: 13, irisRy: 19, atlasX: 1268, atlasY: 479}
];

/** The supplied PNG has a painted checkerboard, so only its inner iris pixels
 * are sampled. The soft circular alpha is made at runtime; no grid reaches the face. */
function makeIrisSprite(atlas, {atlasX, atlasY}) {
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 256;
  const pen = sprite.getContext('2d');
  pen.imageSmoothingQuality = 'high';
  pen.drawImage(atlas, atlasX - 225, atlasY - 225, 450, 450, 0, 0, 256, 256);
  pen.globalCompositeOperation = 'destination-in';
  const fade = pen.createRadialGradient(128, 128, 0, 128, 128, 128);
  fade.addColorStop(0, '#000');
  fade.addColorStop(.86, '#000');
  fade.addColorStop(1, 'rgba(0, 0, 0, 0)');
  pen.fillStyle = fade;
  pen.fillRect(0, 0, 256, 256);
  return sprite;
}

/** The studio plate already has a laptop, books and mugs. Keep only Wenrui's
 * upper silhouette from the separate portrait, with a soft edge at the desk. */
function makeStudioPortrait(image) {
  const portrait = document.createElement('canvas');
  portrait.width = WIDTH;
  portrait.height = HEIGHT;
  const pen = portrait.getContext('2d');
  pen.drawImage(image, 0, 0, WIDTH, HEIGHT);

  const mask = document.createElement('canvas');
  mask.width = WIDTH;
  mask.height = HEIGHT;
  const m = mask.getContext('2d');
  m.filter = 'blur(14px)';
  m.fillStyle = '#fff';
  m.beginPath();
  m.moveTo(-40, -40);
  m.lineTo(WIDTH + 40, -40);
  m.lineTo(WIDTH + 40, 675);
  m.lineTo(970, 675);
  m.bezierCurveTo(916, 717, 882, 789, 825, 861);
  m.lineTo(747, 1000);
  m.lineTo(-40, 1000);
  m.closePath();
  m.fill();
  m.filter = 'none';
  m.globalCompositeOperation = 'destination-in';
  const fade = m.createLinearGradient(0, 900, 0, 970);
  fade.addColorStop(0, '#000');
  fade.addColorStop(1, 'rgba(0, 0, 0, 0)');
  m.fillStyle = fade;
  m.fillRect(0, 0, WIDTH, HEIGHT);

  pen.globalCompositeOperation = 'destination-in';
  pen.drawImage(mask, 0, 0);
  return portrait;
}

/** Replaces a small area with pixels sampled from the original image.
 * The falloff reaches zero at the edge, so the illustration stays intact. */
function warpArea(ctx, source, bounds, displacement) {
  const {x, y, width, height} = bounds;
  const patch = ctx.createImageData(width, height);
  const dst = patch.data;
  const src = source.data;
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const imageX = x + px;
      const imageY = y + py;
      const [dx, dy] = displacement(imageX, imageY);
      const sampleX = clamp(imageX - dx, 0, WIDTH - 1.001);
      const sampleY = clamp(imageY - dy, 0, HEIGHT - 1.001);
      const x0 = Math.floor(sampleX);
      const y0 = Math.floor(sampleY);
      const fx = sampleX - x0;
      const fy = sampleY - y0;
      const i00 = (y0 * WIDTH + x0) * 4;
      const i10 = i00 + 4;
      const i01 = i00 + WIDTH * 4;
      const i11 = i01 + 4;
      const out = (py * width + px) * 4;
      for (let channel = 0; channel < 4; channel++) {
        const top = src[i00 + channel] * (1 - fx) + src[i10 + channel] * fx;
        const bottom = src[i01 + channel] * (1 - fx) + src[i11 + channel] * fx;
        dst[out + channel] = top * (1 - fy) + bottom * fy;
      }
    }
  }
  ctx.putImageData(patch, x, y);
}

function ovalFalloff(x, y, centerX, centerY, radiusX, radiusY) {
  const distance = ((x - centerX) / radiusX) ** 2 + ((y - centerY) / radiusY) ** 2;
  return distance >= 1 ? 0 : (1 - distance) ** 2;
}

export default function InteractivePortrait() {
  const {t}=useLocale();
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const charmRef = useRef(null);
  const cheekRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    const charmButton = charmRef.current;
    const cheekButton = cheekRef.current;
    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!ctx) return;
    const image = new Image();
    const irisAtlas = new Image();
    let source = null;
    let portrait = null;
    let irises = null;
    let frame = 0;
    let lastPointerX = null;
    let drag = null;
    let destroyed = false;
    const motion = {lookX: 0, lookY: 0, eyeX: 0, eyeY: 0, swing: 0, speed: 0, cheekX: 0, cheekY: 0, cheekTargetX: 0, cheekTargetY: 0};

    function render() {
      frame = 0;
      if (!source || destroyed) return;
      motion.eyeX += (motion.lookX - motion.eyeX) * 0.2;
      motion.eyeY += (motion.lookY - motion.eyeY) * 0.2;
      if (drag?.part === 'charm') {
        motion.speed += (drag.targetX - motion.swing) * 0.18;
        motion.speed *= 0.72;
      } else {
        motion.speed += -motion.swing * 0.06;
        motion.speed *= 0.9;
      }
      motion.swing = clamp(motion.swing + motion.speed, -58, 58);
      motion.cheekX += (motion.cheekTargetX - motion.cheekX) * (drag?.part === 'cheek' ? 0.28 : 0.15);
      motion.cheekY += (motion.cheekTargetY - motion.cheekY) * (drag?.part === 'cheek' ? 0.28 : 0.15);

      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.drawImage(portrait, 0, 0, WIDTH, HEIGHT);
      const gazeDistance = Math.hypot(motion.eyeX, motion.eyeY);
      if (irises && gazeDistance > 0.1) {
        for (const eye of EYES) {
          warpArea(ctx, source, {x: eye.x-eye.rx, y: eye.y-eye.ry, width: eye.rx*2, height: eye.ry*2}, (x,y) => {
            const falloff = ovalFalloff(x,y,eye.x,eye.y,eye.rx,eye.ry);
            return [motion.eyeX * falloff, motion.eyeY * falloff];
          });
        }
      }
      if (Math.abs(motion.cheekX) + Math.abs(motion.cheekY) > 0.15) {
        warpArea(ctx, source, {x: 812, y: 506, width: 180, height: 132}, (x,y) => {
          const falloff = ovalFalloff(x,y,902,572,90,66);
          return [motion.cheekX * falloff, motion.cheekY * falloff];
        });
      }
      if (Math.abs(motion.swing) > 0.15) {
        warpArea(ctx, source, {x: 420, y: 277, width: 300, height: 340}, (x,y) => {
          const alongChain = 0.35 + clamp((y - 340) / 200, 0, 1) * 0.65;
          const shift = motion.swing * alongChain * ovalFalloff(x,y,566,444,144,168);
          return [shift, Math.abs(shift) * 0.09];
        });
      }
      if (irises && gazeDistance > 0.1) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, gazeDistance / 2);
        EYES.forEach((eye, i) => {
          ctx.drawImage(irises[i], eye.x + motion.eyeX - eye.irisRx, eye.y + motion.eyeY - eye.irisRy, eye.irisRx*2, eye.irisRy*2);
        });
        ctx.restore();
      }
      const unsettled = Math.abs(motion.lookX-motion.eyeX)+Math.abs(motion.lookY-motion.eyeY)+Math.abs(motion.swing)+Math.abs(motion.speed)+Math.abs(motion.cheekX-motion.cheekTargetX)+Math.abs(motion.cheekY-motion.cheekTargetY);
      if (unsettled > 0.2 || drag) schedule();
    }
    function schedule() { if (!frame && !destroyed) frame = requestAnimationFrame(render); }
    function imagePoint(event) {
      const rect = canvas.getBoundingClientRect();
      return {x: (event.clientX-rect.left) * WIDTH / rect.width, y: (event.clientY-rect.top) * HEIGHT / rect.height};
    }
    function move(event) {
      const viewportRect = wrapper.getBoundingClientRect();
      if (!drag && (viewportRect.bottom < 0 || viewportRect.top > window.innerHeight)) {
        if (motion.lookX || motion.lookY) leave();
        return;
      }
      const point = imagePoint(event);
      motion.lookX = reduceMotion ? 0 : clamp((point.x - 870) / 110, -6, 6);
      motion.lookY = reduceMotion ? 0 : clamp((point.y - 500) / 140, -4, 4);
      if (lastPointerX !== null && drag?.part !== 'charm') {
        const nearCharm = Math.hypot((point.x-565)*0.8, (point.y-450)*0.8) < 240;
        if (nearCharm && !reduceMotion) motion.speed = clamp(motion.speed + (point.x-lastPointerX)*0.014, -9, 9);
      }
      lastPointerX = point.x;
      if (drag && drag.pointerId === event.pointerId) {
        if (drag.part === 'charm') drag.targetX = clamp(point.x-drag.startX+drag.initialX, -58, 58);
        else {
          motion.cheekTargetX = clamp(point.x-drag.startX+drag.initialX, -44, 44);
          motion.cheekTargetY = clamp(point.y-drag.startY+drag.initialY, -31, 31);
        }
      }
      schedule();
    }
    function leave() {
      lastPointerX = null;
      motion.lookX = 0;
      motion.lookY = 0;
      schedule();
    }
    function start(part, event) {
      event.preventDefault();
      const point = imagePoint(event);
      drag = {part, pointerId: event.pointerId, startX:point.x, startY:point.y,
        initialX:part==='charm' ? motion.swing : motion.cheekX,
        initialY:motion.cheekY, targetX:motion.swing};
      event.currentTarget.setPointerCapture(event.pointerId);
      if (part === 'charm') motion.speed += 5;
      else {motion.cheekTargetX = -25; motion.cheekTargetY = 6;}
      schedule();
    }
    function stop(event) {
      if (drag?.pointerId !== event.pointerId) return;
      drag = null;
      motion.cheekTargetX = 0;
      motion.cheekTargetY = 0;
      schedule();
    }
    function key(part, event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      if (part === 'charm') motion.speed += 9;
      else {
        motion.cheekTargetX = -27;
        motion.cheekTargetY = 5;
        setTimeout(() => {if (!destroyed) {motion.cheekTargetX=0;motion.cheekTargetY=0;schedule();}}, 320);
      }
      schedule();
    }
    const handlers = [
      [charmButton,'pointerdown',event=>start('charm',event)],
      [cheekButton,'pointerdown',event=>start('cheek',event)],
      [charmButton,'keydown',event=>key('charm',event)],
      [cheekButton,'keydown',event=>key('cheek',event)],
      [charmButton,'pointerup',stop], [cheekButton,'pointerup',stop],
      [charmButton,'pointercancel',stop], [cheekButton,'pointercancel',stop],
      [window,'pointermove',move], [document,'mouseleave',leave], [window,'blur',leave]
    ];
    handlers.forEach(([element,type,handler]) => element.addEventListener(type,handler));
    image.onload = () => {
      if (destroyed) return;
      canvas.width = WIDTH;
      canvas.height = HEIGHT;
      portrait = makeStudioPortrait(image);
      ctx.drawImage(portrait,0,0,WIDTH,HEIGHT);
      source = ctx.getImageData(0,0,WIDTH,HEIGHT);
      schedule();
    };
    irisAtlas.onload = () => {
      if (destroyed) return;
      irises = EYES.map(eye => makeIrisSprite(irisAtlas, eye));
      schedule();
    };
    image.src = '/images/hero-wenrui-studio.png';
    irisAtlas.src = '/images/wenrui-irises-atlas.png';
    return () => {
      destroyed = true;
      cancelAnimationFrame(frame);
      handlers.forEach(([element,type,handler]) => element.removeEventListener(type,handler));
      image.onload = null;
      irisAtlas.onload = null;
    };
  }, []);

  return <div className="interactive-portrait" ref={wrapperRef}>
    <canvas ref={canvasRef} role="img" aria-label={t.hero.portraitDescription}/>
    <button ref={cheekRef} className="portrait-hotspot cheek-hotspot" type="button" aria-label={t.hero.pullCheek} title={t.hero.pullCheek}/>
    <button ref={charmRef} className="portrait-hotspot charm-hotspot" type="button" aria-label={t.hero.dragCharm} title={t.hero.dragCharm}/>
  </div>;
}
