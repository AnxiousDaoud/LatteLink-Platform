"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type Direction = "up" | "left" | "right" | "scale";

const variants = {
  up: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: -48 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 48 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
};

const ease = [0.16, 1, 0.3, 1] as const;

interface AnimateInProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  once?: boolean;
}

export function AnimateIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.8,
  className,
  style,
  once = true,
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "0px 0px -60px 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={variants[direction]}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  staggerDelay?: number;
}

export function Stagger({
  children,
  className,
  style,
  staggerDelay = 0.1,
}: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y: 32 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
      }}
    >
      {children}
    </motion.div>
  );
}
