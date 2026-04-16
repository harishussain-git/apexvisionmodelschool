"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export default function DemoPage() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const navRef = useRef(null);
  const headerRef = useRef(null);
  const heroImgRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const nav = navRef.current;
    const header = headerRef.current;
    const heroImg = heroImgRef.current;
    const ctx = canvas.getContext("2d");

    const frameCount = 145;
    const images = [];
    const frame = { current: 0 };

    const getFrameSrc = (i) =>
      `/demo/seq/${String(i + 1).padStart(4, "0")}.webp`;

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawCoverImage = (img) => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      if (!img || !img.complete || !img.naturalWidth) return;

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const screenRatio = w / h;

      let dw, dh, dx, dy;

      if (imgRatio > screenRatio) {
        dh = h;
        dw = dh * imgRatio;
        dx = (w - dw) / 2;
        dy = 0;
      } else {
        dw = w;
        dh = dw / imgRatio;
        dx = 0;
        dy = (h - dh) / 2;
      }

      ctx.drawImage(img, dx, dy, dw, dh);
    };

    const render = () => {
      drawCoverImage(images[frame.current]);
    };

    setCanvasSize();

    let loaded = 0;
    const onImageDone = () => {
      loaded++;
      if (loaded === frameCount) {
        render();
        initScroll();
      }
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.onload = onImageDone;
      img.onerror = onImageDone;
      img.src = getFrameSrc(i);
      images.push(img);
    }

    // smooth scroll
    const lenis = new Lenis({ smoothWheel: true });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    lenis.on("scroll", ScrollTrigger.update);

    let trigger;

    const initScroll = () => {
      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${window.innerHeight * 7}`,
        pin: true,
        scrub: 1,
        onUpdate: ({ progress }) => {
          // frames
          const frameProgress = Math.min(progress / 0.9, 1);
          frame.current = Math.min(
            frameCount - 1,
            Math.floor(frameProgress * (frameCount - 1))
          );
          render();

          // nav fade out
          gsap.set(nav, {
            opacity: progress <= 0.1 ? 1 - progress / 0.1 : 0,
          });

          // header move back + fade
          if (progress <= 0.45) {
            const z = -500 * Math.min(progress / 0.2, 1);
            const opacity =
              progress <= 0.2 ? 1 : 1 - Math.min((progress - 0.2) / 0.25, 1);

            gsap.set(header, {
              z,
              opacity,
              transformPerspective: 1000,
            });
          } else {
            gsap.set(header, { opacity: 0 });
          }

          // dashboard image reveal
          if (progress < 0.6) {
            gsap.set(heroImg, {
              z: 1000,
              opacity: 0,
              transformPerspective: 1200,
            });
          } else if (progress <= 0.9) {
            const p = (progress - 0.6) / 0.3;
            gsap.set(heroImg, {
              z: 1000 - p * 1000,
              opacity: Math.min(p / 0.5, 1),
              transformPerspective: 1200,
            });
          } else {
            gsap.set(heroImg, {
              z: 0,
              opacity: 1,
              transformPerspective: 1200,
            });
          }
        },
      });
    };

    const onResize = () => {
      setCanvasSize();
      render();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      trigger?.kill();
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <main className="bg-black text-white">
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

        {/* <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center px-6 [perspective:1200px]">
          <div
            ref={heroImgRef}
            className="w-full max-w-5xl will-change-transform transform-3d"
          >
            <img
              src="/assets/img/dash.png"
              alt="Dashboard"
              className="h-auto w-full object-contain drop-shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
            />
          </div>
        </div> */}
      </section>

      <section className="flex h-screen items-center justify-center bg-gray-300 p-8 text-black">
        Outro Section
      </section>
    </main>
  );
}