import { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import readmeContent from "../../README.md?raw";
import { BsList, BsX } from "react-icons/bs";

const DocsPage = () => {
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeId, setActiveId] = useState<string>("");

    const cleanContent = useMemo(() => {
        // 1. Remove Table of Contents section
        let content = readmeContent.replace(/## Table of Contents[\s\S]*?---/, "");
        // 2. Remove the first paragraph if it contains images (the logos)
        // Looking for <p align="center"> ... </p> at the start
        content = content.replace(/^\s*<p align="center">[\s\S]*?<\/p>/, "");
        // 3. Remove Title if it exists as # Title (since we add our own hero)
        content = content.replace(/^#\s+.+\n/, "");

        return content;
    }, []);

    useEffect(() => {
        const lines = readmeContent.split("\n"); // process original content for complete headings found later? 
        // Actually, we should probably extract from cleanContent or allow all. 
        // Let's extract from cleanContent to ensure sidebar matches view.
        const extractedHeadings: { id: string; text: string; level: number }[] = [];
        const headingRegex = /^(#{2,3})\s+(.+)$/;

        cleanContent.split("\n").forEach((line) => {
            const match = line.match(headingRegex);
            if (match) {
                const level = match[1].length;
                const text = match[2].trim();
                const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
                extractedHeadings.push({ id, text, level });
            }
        });

        setHeadings(extractedHeadings);
    }, [cleanContent]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-10% 0px -80% 0px" }
        );

        headings.forEach((h) => {
            const el = document.getElementById(h.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [headings]);

    return (
        <div className="flex bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-slate-300 relative min-h-screen font-sans selection:bg-blue-100 dark:selection:bg-blue-900">

            {/* Mobile Sidebar Toggle */}
            <button
                className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl transition-transform hover:scale-105"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <BsX size={24} /> : <BsList size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed md:sticky top-0 h-screen w-72 flex-shrink-0 overflow-y-auto 
        border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#161b22]/80 backdrop-blur-md
        transition-transform duration-300 z-40 
        ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0 md:shadow-none"}
        `}
            >
                <div className="p-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 mt-2">
                        Contents
                    </h2>

                    <nav className="space-y-1 relative border-l border-slate-200 dark:border-slate-800 ml-2">
                        {headings.map((heading, index) => (
                            <a
                                key={index}
                                href={`#${heading.id}`}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`block text-[14px] py-1.5 pl-4 -ml-[1px] border-l-2 transition-all duration-200
                    ${activeId === heading.id
                                        ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
                                        : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                                    }
                    ${heading.level === 3 ? "pl-8 text-xs" : ""}
                `}
                            >
                                {heading.text}
                            </a>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 w-full relative">
                {/* Hero Header */}
                <div className="bg-white dark:bg-[#161b22] border-b border-slate-200 dark:border-slate-800 px-8 py-12 md:px-16 md:py-20">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
                            Documentation
                        </h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                            Everything you need to know about JSON Schema Studio. Explore features, understand the visualization, and get started with development.
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 py-12 md:px-16">
                    {/* Card Container for Content */}
                    <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 md:p-12">
                        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none 
                    prose-headings:scroll-mt-32 
                    prose-headings:font-bold prose-headings:tracking-tight
                    
                    /* Headings */
                    prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-slate-800 dark:prose-h2:text-slate-100
                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                    
                    /* Links */
                    prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                    
                    /* Code Blocks */
                    prose-pre:bg-slate-900 dark:prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-slate-800 dark:prose-pre:border-slate-700 prose-pre:shadow-sm prose-pre:rounded-xl
                    prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-900/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
                    
                    /* Images */
                    prose-img:rounded-xl prose-img:shadow-md prose-img:border prose-img:border-slate-200 dark:prose-img:border-slate-800 prose-img:my-8
                    
                    /* Blockquotes */
                    prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-300
                 ">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw, rehypeSlug]}
                                components={{
                                    img: ({ node, ...props }) => {
                                        let src = props.src;
                                        if (src?.startsWith('./public/')) {
                                            src = src.replace('./public/', '/');
                                        }
                                        return <img {...props} src={src} className="mx-auto" loading="lazy" />;
                                    },
                                    a: ({ node, ...props }) => {
                                        if (props.href?.startsWith('#')) {
                                            return <a {...props} onClick={(e) => {
                                                e.preventDefault();
                                                const id = props.href?.substring(1);
                                                const element = document.getElementById(id || "");
                                                if (element) {
                                                    element.scrollIntoView({ behavior: 'smooth' });
                                                    window.history.pushState(null, '', props.href);
                                                    setActiveId(id || "");
                                                }
                                            }} />
                                        }
                                        return <a {...props} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-indigo-800 dark:hover:text-indigo-300" />
                                    }
                                }}
                            >
                                {cleanContent}
                            </ReactMarkdown>
                        </div>
                    </div>

                    <footer className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 text-sm">
                        <p>&copy; {newXZDate().getFullYear()} JSON Schema Studio. All rights reserved.</p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

// Helper for year, though static 2024 is fine
const newXZDate = () => new Date();

export default DocsPage;
