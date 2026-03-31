import CloudText from "@/components/home/overlays/CloudText";
import HeroSection from "./HeroSection";
import SchoolFrontSection from "./SchoolFrontSection";
import FakeRuntimeError from "@/components/home/sections/FakeRuntimeError";

function withFrameRanges(sections = []) {
  let startFrame = 1;

  return sections.map((section) => {
    const frameCount = Math.max(1, Number(section.frameCount ?? 1));
    const nextSection = {
      ...section,
      frameCount,
      startFrame,
      endFrame: startFrame + frameCount - 1,
    };

    startFrame = nextSection.endFrame + 1;
    return nextSection;
  });
}

const runtimeErrorOverlay = <FakeRuntimeError />;

const sections = withFrameRanges([
  {
    id: "hero",
    sectionImgFolder: "/home/seq1/hero",
    frameCount: 101,
    depthTriggerFrame: 1,
    sectionComponent: <HeroSection />,
  },
  {
    id: "cloudtext",
    sectionImgFolder: "/home/seq1/cloudtext",
    frameCount: 145,
    depthTriggerFrame: 1,
    sectionComponent: <CloudText />,
  },
  {
    id: "schoolfront",
    sectionImgFolder: "/home/seq1/schoolfront",
    frameCount: 1,
    depthTriggerFrame: 1,
    sectionComponent: <SchoolFrontSection />,
  },
  // {
  //   id: "classroom",
  //   sectionImgFolder: "/home/seq1/classroom",
  //   frameCount: 43,
  //   sectionComponent: runtimeErrorOverlay,
  // },
  // {
  //   id: "educraft",
  //   sectionImgFolder: "/home/seq1/educraft",
  //   frameCount: 27,
  //   sectionComponent: runtimeErrorOverlay,
  // },
  // {
  //   id: "karate",
  //   sectionImgFolder: "/home/seq1/karate",
  //   frameCount: 38,
  //   sectionComponent: runtimeErrorOverlay,
  // },
  // {
  //   id: "carpenter",
  //   sectionImgFolder: "/home/seq1/carpenter",
  //   frameCount: 27,
  //   sectionComponent: runtimeErrorOverlay,
  // },
  // {
  //   id: "sports",
  //   sectionImgFolder: "/home/seq1/sports",
  //   frameCount: 48,
  //   sectionComponent: runtimeErrorOverlay,
  // },
  // {
  //   id: "communication",
  //   sectionImgFolder: "/home/seq1/communication",
  //   frameCount: 1,
  //   sectionComponent: runtimeErrorOverlay,
  // },
]);

export const HOME_SEQUENCE_CONFIG = {
  id: "seq1",
  scrollVh: 900,
  frameCount: sections.at(-1)?.endFrame ?? 1,
  loaderPreloadSectionCount: 2,
  snapDurationMs: 2000,
  sectionMotion: {
    enabled: true,
    durationMs: 260,
    distancePx: 20,
    enterOpacity: 0,
    exitOpacity: 0,
  },
  sections,
};
