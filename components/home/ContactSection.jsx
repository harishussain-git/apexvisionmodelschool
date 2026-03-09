export default function ContactSection() {
  return (
    <section
      id="contact"
      className="w-full bg-[url('/homepage/clay/contact-clay.webp')] bg-cover bg-center py-12 md:py-16"
    >
      <div className="mx-auto w-full max-w-screen-lg rounded-2xl  px-4 py-8 backdrop-blur-sm md:px-8 md:py-12">
        <p className="text-center text-caption font-semibold uppercase text-primary-500">
          Contact
        </p>

        <h2 className="mx-auto mt-4 max-w-[34ch] text-center font-accent uppercase text-4xl leading-tight text-black md:text-6xl">
          Begin a Thoughtful Conversation About Your Child&apos;s Education
        </h2>

        <div className="mt-8 flex flex-col items-center gap-4">
          <a
            href="#"
            className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-body text-black"
          >
            <span>Book an Admission Consultation</span>
            <span aria-hidden="true">{"\u2197"}</span>
          </a>

          <a href="#" className="text-body text-black underline underline-offset-4">
            Read the Admissions FAQs
          </a>
        </div>

        <div className="mx-auto mt-8 w-full max-w-4xl rounded-2xl bg-white p-6 md:p-10">
          <h3 className="font-accent  text-3xl text-black md:text-5xl">
            Have a question about admissions?
          </h3>

          <p className="mt-3 max-w-[42ch] text-body text-black/80">
            We&apos;re happy to guide you and answer any questions about your child&apos;s
            journey at Apex.
          </p>

          <form className="mt-8 flex flex-col gap-5">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full border-b border-black/20 bg-transparent px-0 py-3 text-body text-black outline-none"
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <input
                type="tel"
                placeholder="Phone"
                className="w-full border-b border-black/20 bg-transparent px-0 py-3 text-body text-black outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full border-b border-black/20 bg-transparent px-0 py-3 text-body text-black outline-none"
              />
            </div>

            <textarea
              rows={3}
              placeholder="Message"
              className="w-full resize-none border-b border-black/20 bg-transparent px-0 py-3 text-body text-black outline-none"
            />

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center gap-3 rounded-full bg-primary-500 px-6 py-4 text-body text-white md:w-fit md:min-w-80"
            >
              <span>Request an Admission Call</span>
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M22 2L11 13"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M22 2l-7 20-4-9-9-4 20-7z"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
