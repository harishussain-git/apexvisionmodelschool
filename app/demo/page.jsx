"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import DemoLoaderOverlay from "@/components/demo/demo+LoaderOverlay";
import {
  DEMO_SEQUENCE_CONFIG,
  DEMO_SEQUENCE_FRAMES,
} from "@/utils/demo/demo+sequence-manifest";
import {
  createDemoSequenceProgress,
  preloadDemoSequence,
} from "@/utils/demo/demo+sequence-preloader";

gsap.registerPlugin(ScrollTrigger);

function lockPageScroll() {
  const html = document.documentElement;
  const body = document.body;
  const previousHtmlOverflow = html.style.overflow;
  const previousBodyOverflow = body.style.overflow;
  const previousBodyTouchAction = body.style.touchAction;

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
  body.style.touchAction = "none";

  return () => {
    html.style.overflow = previousHtmlOverflow;
    body.style.overflow = previousBodyOverflow;
    body.style.touchAction = previousBodyTouchAction;
  };
}

export default function DemoPage() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const navRef = useRef(null);
  const headerRef = useRef(null);
  const imagesRef = useRef([]);
  const [progress, setProgress] = useState(() => createDemoSequenceProgress());
  const [isSceneReady, setIsSceneReady] = useState(false);

  useEffect(() => {
    // Hold scroll until every frame is in memory so the first interaction feels stable.
    let isActive = true;
    const unlockScroll = lockPageScroll();
    const preloadTask = preloadDemoSequence(DEMO_SEQUENCE_FRAMES, {
      onProgress(nextProgress) {
        if (isActive) {
          setProgress(nextProgress);
        }
      },
    });

    preloadTask.done.then(({ images, progress: finalProgress }) => {
      if (!isActive) {
        return;
      }

      imagesRef.current = images;
      setProgress(finalProgress);
      setIsSceneReady(true);
      unlockScroll();
    });

    return () => {
      isActive = false;
      preloadTask.cancel();
      unlockScroll();
    };
  }, []);

  useEffect(() => {
    if (!isSceneReady) {
      return;
    }

    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const nav = navRef.current;
    const header = headerRef.current;
    const images = imagesRef.current;
    const ctx = canvas?.getContext("2d");

    if (!section || !canvas || !ctx || !images.length) {
      return;
    }

    const frame = { current: 0 };
    let trigger;
    let rafId;

    const drawCoverImage = (image) => {
      // Keep each frame in "cover" mode so the canvas always fills the viewport.
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      if (!image?.complete || !image.naturalWidth) {
        return;
      }

      const imageRatio = image.naturalWidth / image.naturalHeight;
      const screenRatio = width / height;

      let drawWidth;
      let drawHeight;
      let offsetX;
      let offsetY;

      if (imageRatio > screenRatio) {
        drawHeight = height;
        drawWidth = drawHeight * imageRatio;
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = width;
        drawHeight = drawWidth / imageRatio;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      }

      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    };

    const renderFrame = () => {
      drawCoverImage(images[frame.current]);
    };

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const lenis = new Lenis({ smoothWheel: true });
    const onLenisScroll = () => ScrollTrigger.update();

    lenis.on("scroll", onLenisScroll);

    const onFrame = (time) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(onFrame);
    };

    setCanvasSize();
    renderFrame();

    rafId = window.requestAnimationFrame(onFrame);

    trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${window.innerHeight * DEMO_SEQUENCE_CONFIG.canvasScrollScreens}`,
      pin: true,
      scrub: 1,
      onUpdate: ({ progress: scrollProgress }) => {
        const frameProgress = Math.min(
          scrollProgress / DEMO_SEQUENCE_CONFIG.frameProgressCutoff,
          1
        );

        frame.current = Math.min(
          images.length - 1,
          Math.floor(frameProgress * (images.length - 1))
        );

        renderFrame();

        if (nav) {
          gsap.set(nav, {
            opacity: scrollProgress <= 0.1 ? 1 - scrollProgress / 0.1 : 0,
          });
        }

        if (!header) {
          return;
        }

        if (scrollProgress <= 0.45) {
          const z = -500 * Math.min(scrollProgress / 0.2, 1);
          const opacity =
            scrollProgress <= 0.2
              ? 1
              : 1 - Math.min((scrollProgress - 0.2) / 0.25, 1);

          gsap.set(header, {
            z,
            opacity,
            transformPerspective: 1000,
          });
          return;
        }

        gsap.set(header, { opacity: 0 });
      },
    });

    const onResize = () => {
      setCanvasSize();
      renderFrame();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.cancelAnimationFrame(rafId);
      trigger?.kill();

      if (typeof lenis.off === "function") {
        lenis.off("scroll", onLenisScroll);
      }

      lenis.destroy();
    };
  }, [isSceneReady]);

  return (
    <main className="bg-black text-white">
      <DemoLoaderOverlay
        visible={!isSceneReady}
        progress={progress}
        title={DEMO_SEQUENCE_CONFIG.loaderTitle}
        label={DEMO_SEQUENCE_CONFIG.loaderLabel}
        showDebug={DEMO_SEQUENCE_CONFIG.showLoaderDebug}
      />

      <nav
        ref={navRef}
        className="fixed top-0 left-0 z-50 flex w-full items-center justify-between bg-red-400 px-8 py-3 text-black"
      >
        <div className="flex gap-4">
          <a href="#">Nav1</a>
          <a href="#">Nav2</a>
          <a href="#">Nav3</a>
        </div>

        <div>Logo</div>

        <div className="flex gap-3">
          <button>Button 1</button>
          <button>Button 2</button>
        </div>
      </nav>

      <section
        ref={sectionRef}
        className="relative h-screen w-full overflow-hidden"
      >
        <canvas ref={canvasRef} className="h-full w-full" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            ref={headerRef}
            className="absolute top-40 z-20 flex w-full max-w-4xl flex-col items-center justify-center gap-4 px-6 text-center will-change-transform"
          >
            <h1 className="text-5xl font-bold">Hero Header</h1>
            <p className="text-lg">This is the hero section content.</p>
          </div>
        </div>

      </section>

      <section className="flex h-screen items-center justify-center bg-gray-300 p-8 text-black">
        Outro Section
      </section>
    </main>
  );
}
