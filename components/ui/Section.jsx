"use client";
import { motion } from "framer-motion";

const Section = ({ id, title, children }) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-100px" }}
      className="py-10 scroll-mt-24"
    >
      <h2 className="text-2xl md:text-3xl font-bold mb-6 pb-2 border-b border-primary/20">
        <a href={`#${id}`} className="no-underline hover:underline before:details-content:' '">
          #{title}
        </a>
      </h2>
      <div className="prose prose-lg max-w-none">
        {children}
      </div>
    </motion.section>
  );
};

export default Section;