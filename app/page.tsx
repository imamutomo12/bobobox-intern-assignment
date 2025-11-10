/* eslint-disable react/no-unknown-property */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Alpine: any;
  }
}

type Company = {
  name: string;
  industry: string;
  country: string;
  ceoName: string;
};

export default function Page() {
  const [isClient, setIsClient] = useState(false);
  const [view, setView] = useState<"table" | "form">("table");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load Alpine only on client
  useEffect(() => {
    setIsClient(true);
    import("alpinejs")
      .then((module) => {
        const Alpine = (module as any).default ?? module;
        if (typeof window !== "undefined") {
          window.Alpine = Alpine;
          // start Alpine if available
          if (window.Alpine && typeof window.Alpine.start === "function") {
            window.Alpine.start();
          }
        }
      })
      .catch((e) => {
        console.warn("Failed to load alpinejs", e);
      });
  }, []);

  // Fetch companies (React-managed)
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "https://json-placeholder.mock.beeceptor.com/companies"
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Company[];
        setCompanies(data);
      } catch (err: any) {
        setError(err?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Carousel HTML as raw string so TSX parser won't try to read Alpine directives
  const carouselHTML = `
    <div
      x-data="{
        current: 0,
        slides: [
          { id: 0, src: 'https://picsum.photos/1200/600?random=1' },
          { id: 1, src: 'https://picsum.photos/1200/600?random=2' },
          { id: 2, src: 'https://picsum.photos/1200/600?random=3' },
          { id: 3, src: 'https://picsum.photos/1200/600?random=4' }
        ],
        autoplay: null,
        init() { this.startAutoplay(); },
        startAutoplay() { this.autoplay = setInterval(() => this.next(), 4000); },
        stopAutoplay() { clearInterval(this.autoplay); },
        next() { this.current = (this.current + 1) % this.slides.length; },
        prev() { this.current = (this.current - 1 + this.slides.length) % this.slides.length; },
        goTo(i) { this.current = i; }
      }"
      x-init="init()"
      x-on:mouseenter="stopAutoplay()"
      x-on:mouseleave="startAutoplay()"
      class="relative w-full rounded-lg overflow-hidden shadow-lg"
    >
      <div class="relative h-56 sm:h-72 md:h-96 overflow-hidden">
        <template x-for="slide in slides" :key="slide.id">
          <div x-show="current === slide.id" x-transition class="absolute inset-0">
            <img :src="slide.src" :alt="'Slide ' + (slide.id + 1)" class="w-full h-full object-cover" />
          </div>
        </template>
      </div>

      <button x-on:click="prev()" aria-label="Previous slide"
        class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 rounded-xl p-3 shadow-lg transition-all">
        ‹
      </button>
      <button x-on:click="next()" aria-label="Next slide"
        class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 rounded-xl p-3 shadow-lg transition-all">
        ›
      </button>

      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <template x-for="(s, i) in slides" :key="i">
          <button x-on:click="goTo(i)"
            :class="current === i ? 'w-8 h-2 rounded-full bg-white' : 'w-3 h-3 rounded-full bg-white/60'"
            class="transition-all"></button>
        </template>
      </div>
    </div>
  `;

  return (
    <main className="min-h-screen bg-[hsla(0,0%,95%,1)] p-6">
      <div className="mx-10 space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-slate-800">
            Take-Home Assignment
          </h1>
          <p className="text-slate-600">Muhammad Insani Imam Utomo</p>
        </header>

        <section aria-label="Carousel">
          {isClient ? (
            <div dangerouslySetInnerHTML={{ __html: carouselHTML }} />
          ) : (
            // SSR placeholder
            <div className="w-full max-w-4xl h-56 bg-gray-200 rounded-lg mx-auto" />
          )}
        </section>

        <div className="bg-white p-10 rounded-2xl drop-shadow-2xl">
          {/* Nav buttons to switch between table and form */}
          <nav className="flex justify-center pb-2.5 gap-4 pt-10">
            <button
              onClick={() => setView("table")}
              className={`px-4 py-2 rounded ${
                view === "table"
                  ? "bg-[hsla(0,0%,25%,1)] text-white"
                  : "bg-white shadow"
              }`}
            >
              Company List
            </button>
            <button
              onClick={() => setView("form")}
              className={`px-4 py-2 rounded ${
                view === "form"
                  ? "bg-[hsla(0,0%,25%,1)] text-white"
                  : "bg-white shadow"
              }`}
            >
              Register Company
            </button>
          </nav>

          {/* Table View */}
          {view === "table" ? (
            <section>
              <h2 className="text-xl font-semibold mb-4">Companies</h2>
              {loading ? (
                <p>Loading companies...</p>
              ) : error ? (
                <p className="text-red-500">Error: {error}</p>
              ) : (
                <div className="overflow-x-auto  rounded-2xl  ">
                  <table className="min-w-full bg-white  shadow divide-y divide-slate-400 ">
                    <thead className="bg-gray-50 -2xl">
                      <tr>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Industry</th>
                        <th className="px-4 py-2 text-left">Founded</th>
                        <th className="px-4 py-2 text-left">Headquarters</th>
                      </tr>
                    </thead>
                    <tbody className="">
                      {companies.length === 0 ? (
                        <tr>
                          <td className="px-4 py-6" colSpan={4}>
                            No companies found.
                          </td>
                        </tr>
                      ) : (
                        companies.map((c, i) => (
                          <tr key={i} className="hover:bg-gray-50 ">
                            <td className="px-4 py-3">{c.name}</td>
                            <td className="px-4 py-3">{c.industry}</td>
                            <td className="px-4 py-3">{c.country}</td>
                            <td className="px-4 py-3">{c.ceoName}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : (
            /* Form View */
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Company Registration
              </h2>
              <form
                className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                onSubmit={(e) => e.preventDefault()}
              >
                {" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="company-name"
                      className="block text-sm font-medium text-gray-700 pb-2"
                    >
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company-name"
                      className="mt-1 py-4 px-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Innovatech Solutions"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="industry"
                      className="block text-sm font-medium text-gray-700 pb-2"
                    >
                      Industry Sector
                    </label>
                    <select
                      id="industry"
                      className="mt-1 block w-full py-4 px-3 rounded-md border-gray-300 shadow-sm text-gray-700 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option>Technology</option>
                      <option>Finance</option>
                      <option>Healthcare</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 pb-2"
                    >
                      Contact Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="mt-1 block w-full py-4 px-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="contact@innovatech.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 pb-2"
                    >
                      Headquarters City
                    </label>
                    <input
                      type="text"
                      id="city"
                      className="mt-1 block w-full py-4 px-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="San Francisco"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Employee Size
                  </label>
                  <div className="mt-2 space-y-2 md:space-y-0 md:flex md:space-x-6">
                    <div className="flex items-center">
                      <input
                        id="size-1"
                        name="employee-size"
                        type="radio"
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="size-1"
                        className="ml-3 block text-sm text-gray-700 pb-2"
                      >
                        1-50
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="size-2"
                        name="employee-size"
                        type="radio"
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="size-2"
                        className="ml-3 block text-sm text-gray-700 pb-2"
                      >
                        51-200
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="size-3"
                        name="employee-size"
                        type="radio"
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="size-3"
                        className="ml-3 block text-sm text-gray-700 pb-2"
                      >
                        200+
                      </label>
                    </div>
                  </div>
                </div>
                {/* Terms and Conditions Checkbox [cite: 39] */}
                <div className="flex items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="terms"
                    className="ml-3 block text-sm text-gray-700 "
                  >
                    Agree to Terms and Conditions
                  </label>
                </div>
                {/* Submit Button [cite: 39] */}
                <div>
                  <button
                    type="submit"
                    className="w-full md:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
