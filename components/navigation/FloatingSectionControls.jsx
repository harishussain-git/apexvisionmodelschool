"use client";

import ScrollDownBtn from "../ui/ScrollDownBtn";
import UpcomingEventCard from "../ui/UpcomingEventCard";

export default function FloatingSectionControls() {
  return (
    <>
      <ScrollDownBtn showIn="#contact,#cloud-text "/>
      
      
      <div className="fixed bottom-6 right-6 z-50 hidden md:block">
        <UpcomingEventCard showIn="#hero, #contact" />
      </div>

      
    </>
  );
}
