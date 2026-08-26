"use client";

import { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";

const TEXTURE_URL = "/images/textures/paint-trail-bristle-v1.png";
const MAX_DEVICE_PIXEL_RATIO = 1.5;

export type PaintTrailSample = {
  angle: number;
  x: number;
  y: number;
};

export type PaintTrailController = {
  clear: () => void;
  render: (progress: number, color: string) => PaintTrailSample | null;
  resize: () => void;
  sample: (progress: number) => PaintTrailSample | null;
};

type PaintTrailCanvasProps = {
  guideRef: RefObject<SVGPathElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
};

type TrailMetrics = {
  height: number;
  pathLength: number;
  scaleX: number;
  scaleY: number;
  stampCount: number;
  trailWidth: number;
  width: number;
};

function clampProgress(progress: number): number {
  return Math.min(1, Math.max(0, progress));
}

function deterministicVariation(index: number): number {
  return Math.sin(index * 12.9898) * 0.5 + 0.5;
}

export const PaintTrailCanvas = forwardRef<PaintTrailController, PaintTrailCanvasProps>(
  function PaintTrailCanvas({ guideRef, stageRef }, forwardedRef) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const tintedTextureRef = useRef<HTMLCanvasElement | null>(null);
    const tintedColorRef = useRef("");
    const metricsRef = useRef<TrailMetrics | null>(null);
    const lastDrawnStampRef = useRef(-1);
    const currentProgressRef = useRef(0);
    const currentColorRef = useRef("#2050c8");
    const needsRedrawRef = useRef(true);

    const clear = useCallback(() => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      const metrics = metricsRef.current;

      if (!canvas || !context || !metrics) {
        return;
      }

      context.clearRect(0, 0, metrics.width, metrics.height);
      lastDrawnStampRef.current = -1;
    }, []);

    const resize = useCallback(() => {
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      const guide = guideRef.current;
      const viewBox = guide?.ownerSVGElement?.viewBox.baseVal;

      if (!canvas || !stage || !guide || !viewBox?.width || !viewBox.height) {
        return;
      }

      const bounds = stage.getBoundingClientRect();
      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      const scaleX = width / viewBox.width;
      const scaleY = height / viewBox.height;
      const trailWidth = Math.min(86, Math.max(48, width * 0.052));
      const pathLength = guide.getTotalLength();
      const scaledPathLength = pathLength * ((scaleX + scaleY) / 2);
      const step = Math.max(8, trailWidth * 0.17);

      canvas.width = Math.round(width * devicePixelRatio);
      canvas.height = Math.round(height * devicePixelRatio);

      const context = canvas.getContext("2d");
      context?.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      metricsRef.current = {
        height,
        pathLength,
        scaleX,
        scaleY,
        stampCount: Math.max(1, Math.ceil(scaledPathLength / step)),
        trailWidth,
        width,
      };
      needsRedrawRef.current = true;
      lastDrawnStampRef.current = -1;
    }, [guideRef, stageRef]);

    const getSample = useCallback((progress: number): PaintTrailSample | null => {
      const guide = guideRef.current;
      const metrics = metricsRef.current;

      if (!guide || !metrics) {
        return null;
      }

      const normalizedProgress = clampProgress(progress);
      const distance = normalizedProgress * metrics.pathLength;
      const tangentDistance = Math.min(metrics.pathLength, distance + Math.max(1, metrics.pathLength * 0.0015));
      const point = guide.getPointAtLength(distance);
      const tangent = guide.getPointAtLength(tangentDistance);
      const x = point.x * metrics.scaleX;
      const y = point.y * metrics.scaleY;
      const tangentX = tangent.x * metrics.scaleX;
      const tangentY = tangent.y * metrics.scaleY;

      return {
        angle: Math.atan2(tangentY - y, tangentX - x) * (180 / Math.PI),
        x,
        y,
      };
    }, [guideRef]);

    const prepareTintedTexture = useCallback((color: string): HTMLCanvasElement | null => {
      const image = imageRef.current;

      if (!image) {
        return null;
      }

      if (tintedTextureRef.current && tintedColorRef.current === color) {
        return tintedTextureRef.current;
      }

      const texture = tintedTextureRef.current ?? document.createElement("canvas");
      const targetWidth = 1024;
      const targetHeight = Math.round(targetWidth * (image.naturalHeight / image.naturalWidth));
      texture.width = targetWidth;
      texture.height = targetHeight;

      const textureContext = texture.getContext("2d");

      if (!textureContext) {
        return null;
      }

      textureContext.clearRect(0, 0, targetWidth, targetHeight);
      textureContext.globalCompositeOperation = "source-over";
      textureContext.drawImage(image, 0, 0, targetWidth, targetHeight);
      textureContext.globalCompositeOperation = "multiply";
      textureContext.fillStyle = color;
      textureContext.fillRect(0, 0, targetWidth, targetHeight);
      textureContext.globalCompositeOperation = "destination-in";
      textureContext.drawImage(image, 0, 0, targetWidth, targetHeight);
      textureContext.globalCompositeOperation = "source-over";

      tintedTextureRef.current = texture;
      tintedColorRef.current = color;

      return texture;
    }, []);

    const render = useCallback((progress: number, color: string): PaintTrailSample | null => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      const guide = guideRef.current;
      const metrics = metricsRef.current;
      const normalizedProgress = clampProgress(progress);

      currentProgressRef.current = normalizedProgress;
      currentColorRef.current = color;

      if (!canvas || !context || !guide || !metrics) {
        return null;
      }

      const sample = getSample(normalizedProgress);
      const colorChanged = tintedColorRef.current !== color;
      const texture = prepareTintedTexture(color);

      if (!texture) {
        return sample;
      }

      const targetStamp = normalizedProgress === 0
        ? -1
        : Math.min(metrics.stampCount, Math.floor(normalizedProgress * metrics.stampCount));
      const movingBackwards = targetStamp < lastDrawnStampRef.current;

      if (needsRedrawRef.current || movingBackwards || colorChanged) {
        clear();
        needsRedrawRef.current = false;
      }

      const firstStamp = Math.max(0, lastDrawnStampRef.current + 1);
      const sourceWidth = Math.min(texture.width, Math.round(texture.width * 0.34));
      const sourceRange = Math.max(1, texture.width - sourceWidth);
      const stampLength = metrics.trailWidth * 1.08;

      for (let index = firstStamp; index <= targetStamp; index += 1) {
        const stampProgress = index / metrics.stampCount;
        const stampSample = getSample(stampProgress);

        if (!stampSample) {
          continue;
        }

        const variation = deterministicVariation(index);
        const sourceX = Math.floor((index * 137) % sourceRange);
        const yJitter = (variation - 0.5) * metrics.trailWidth * 0.08;
        const lengthVariation = 0.92 + variation * 0.16;
        const startFade = Math.min(1, index / 9);
        const endFade = normalizedProgress >= 0.995
          ? Math.min(1, (metrics.stampCount - index) / 10)
          : 1;

        context.save();
        context.translate(stampSample.x, stampSample.y);
        context.rotate(stampSample.angle * (Math.PI / 180));
        context.globalAlpha = Math.max(0, Math.min(1, startFade * endFade * 0.96));
        context.drawImage(
          texture,
          sourceX,
          0,
          sourceWidth,
          texture.height,
          -(stampLength * lengthVariation) / 2,
          -metrics.trailWidth / 2 + yJitter,
          stampLength * lengthVariation,
          metrics.trailWidth,
        );
        context.restore();
      }

      lastDrawnStampRef.current = targetStamp;

      return sample;
    }, [clear, getSample, guideRef, prepareTintedTexture]);

    useImperativeHandle(
      forwardedRef,
      () => ({ clear, render, resize, sample: getSample }),
      [clear, getSample, render, resize],
    );

    useLayoutEffect(() => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = TEXTURE_URL;
      image.onload = () => {
        imageRef.current = image;
        tintedTextureRef.current = null;
        tintedColorRef.current = "";
        needsRedrawRef.current = true;
        render(currentProgressRef.current, currentColorRef.current);
      };
      image.onerror = () => {
        imageRef.current = null;
      };

      resize();

      const observer = new ResizeObserver(() => {
        resize();
        render(currentProgressRef.current, currentColorRef.current);
      });

      if (stageRef.current) {
        observer.observe(stageRef.current);
      }

      return () => {
        observer.disconnect();
        image.onload = null;
        image.onerror = null;
        imageRef.current = null;
      };
    }, [render, resize, stageRef]);

    return <canvas aria-hidden="true" className="paint-story__trail-canvas" ref={canvasRef} />;
  },
);
