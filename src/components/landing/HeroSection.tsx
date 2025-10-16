"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Typing effect hook
const useTypingEffect = (text: string, speed = 80) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i === text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayedText;
};

// Counter animation hook
const useCounter = (end: number, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return count;
};

export const HeroSection = () => {
  const heading = useTypingEffect("Welcome to Sweep Pro");
  const subHeading = useTypingEffect(
    "Sweep Pro is your smart assistant for managing subscriptions and automating repetitive tasks. Whether it’s monthly payments, reminders, or scheduling activities, Sweep Pro takes care of it so you can focus on what matters most.",
    10                                             
  );

  const projects = useCounter(650);
  const clients = useCounter(99);
  const artworks = useCounter(240);

  // Split heading to highlight "Sweep Pro"
  const highlightedHeading = heading.replace("Sweep Pro", "");

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 pt-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between">
        {/* Left Content */}
        <motion.div
          className="flex-1 w-full lg:w-1/2 pt-8 lg:pt-0"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6 h-[120px]">
            {highlightedHeading}
            {heading.includes("Sweep Pro") && (
              <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text">
                Sweep Pro
              </span>
            )}
          </h1>

          <p className="text-lg text-gray-700 mb-8 h-[100px]">
            <span className=" font-semibold">
              {subHeading}
            </span>
          </p>

          <div className="flex items-center gap-6 mb-20">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg px-8 py-3 rounded-full shadow-lg font-semibold">
              Get Started
            </Button>
            <a
              href="#"
              className="text-gray-800 text-lg font-medium flex items-center gap-2 hover:underline border-2 rounded-full px-2 py-1"
            >
              Learn More <span className="text-xl">↗</span>
            </a>
          </div>

    
          <div className="flex gap-12 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {projects}+
              </div>
              <div className="text-gray-600 text-sm">Tasks Automated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {clients}%
              </div>
              <div className="text-gray-600 text-sm">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {artworks}+
              </div>
              <div className="text-gray-600 text-sm">Active Schedules</div>
            </div>
          </div> 

          {/* Extra Theme Content */}
         
        </motion.div>

        {/* Right Content - Animated Image */}
        <motion.div
          className="flex-1 w-full lg:w-1/2 flex items-center justify-center relative mt-12 lg:mt-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
        >
          <motion.div
            className="relative w-[420px] h-[420px] flex items-center justify-center"
            animate={{ rotate: [0, 0, 0, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-radial from-blue-900 via-blue-700 to-blue-600"></div>
              <svg
                width="420"
                height="420"
                viewBox="0 0 420 420"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute"
              >
                <circle
                  cx="210"
                  cy="210"
                  r="180"
                  stroke="#ffffff22"
                  strokeWidth="2"
                />
                <circle
                  cx="210"
                  cy="210"
                  r="120"
                  stroke="#ffffff18"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <motion.img
              src="https://homemaidbetter.com/wp-content/uploads/2018/10/house-cleaning-1.jpg"
              alt="Sweep Pro Automation"
              className="relative z-10 w-[320px] h-[400px] object-cover rounded-2xl shadow-2xl "
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.5 }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
