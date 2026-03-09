export default function SchoolFrontSection() {
  return (
    <section className="h-screen w-full bg-[url('/homepage/clay/school-front-clay.webp')] bg-cover bg-center relative  flex items-center justify-center">
      

        <div className="bg-white/30 rounded-2xl backdrop-blur-3xl max-w-[90vw] md:max-w-[70ch] p-2 border border-white/80 absolute bottom-10  md:right-10 md:top-14 h-fit">

          <div className="bg-white p-4 md:p-6  flex flex-col items-start gap-6 rounded-xl">
            <p className="text-heading uppercase ">Every journey begins with purpose, direction, and care</p>

            <div className="hidden md:block w-full h-[2px] bg-black/5"></div>

            <p className="text-body hidden md:block ">At Apex Vision Model School, learning goes beyond classrooms. Through modern facilities, innovative curriculum, and diverse activities, we create a 360° student experience. <span className="underline cursor-pointer">Let’s explore.</span></p>
          </div>
        </div>
      

    </section>
  );
}
