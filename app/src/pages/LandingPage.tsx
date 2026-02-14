import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Wand2,
    Video,
    Image as ImageIcon,
    Zap,
    ChevronDown,
    Check,
    Sparkles,
    Download,
    Type,
    Mail,
    Clock
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Google Fonts */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />

            {/* Navigation */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-md py-4' : 'bg-transparent py-6'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-8 h-8 text-yellow-400" />
                        <span className="text-2xl font-bold tracking-tight">Nyxel</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <button onClick={() => scrollToSection('features')} className="text-sm text-gray-300 hover:text-white transition-colors">Features</button>
                        <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-gray-300 hover:text-white transition-colors">How It Works</button>
                        <button onClick={() => scrollToSection('pricing')} className="text-sm text-gray-300 hover:text-white transition-colors">Pricing</button>
                        <button onClick={() => scrollToSection('faq')} className="text-sm text-gray-300 hover:text-white transition-colors">FAQ</button>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/home" className="hidden sm:block text-sm text-gray-300 hover:text-white transition-colors">Sign In</Link>
                        <Link
                            to="/home"
                            className="bg-yellow-400 text-black px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-yellow-300 transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background gradient instead of image */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-400/10 via-transparent to-transparent" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20">
                    <h1
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium mb-6 tracking-tight"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Create anything<br />you can imagine
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-200 mb-4 max-w-2xl mx-auto">
                        Transform your ideas into stunning visuals with cutting-edge AI technology.
                    </p>
                    <p className="text-base text-gray-300 mb-10">
                        AI Image & Video Generation for creators worldwide.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/home"
                            className="bg-yellow-400 text-black px-8 py-4 rounded-full text-base font-semibold hover:bg-yellow-300 transition-all transform hover:scale-105"
                        >
                            Get Started
                        </Link>
                        <button
                            onClick={() => scrollToSection('pricing')}
                            className="bg-white/10 backdrop-blur-sm text-white border border-white/30 px-8 py-4 rounded-full text-base font-semibold hover:bg-white/20 transition-all"
                        >
                            View Pricing
                        </button>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <ChevronDown className="w-6 h-6 text-white/60" />
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-6 bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2
                            className="text-4xl sm:text-5xl md:text-6xl font-medium mb-4"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Powerful AI Tools
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Everything you need to bring your creative vision to life
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="group p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-yellow-400/50 transition-all">
                            <div className="w-14 h-14 rounded-xl bg-yellow-400/10 flex items-center justify-center mb-6 group-hover:bg-yellow-400/20 transition-colors">
                                <ImageIcon className="w-7 h-7 text-yellow-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">AI Image Generation</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Transform text prompts into stunning, high-quality images. From photorealistic scenes to artistic masterpieces.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-yellow-400/50 transition-all">
                            <div className="w-14 h-14 rounded-xl bg-yellow-400/10 flex items-center justify-center mb-6 group-hover:bg-yellow-400/20 transition-colors">
                                <Video className="w-7 h-7 text-yellow-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">AI Video Generation</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Create captivating videos from simple text descriptions. Animate your ideas with smooth, professional results.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-yellow-400/50 transition-all">
                            <div className="w-14 h-14 rounded-xl bg-yellow-400/10 flex items-center justify-center mb-6 group-hover:bg-yellow-400/20 transition-colors">
                                <Zap className="w-7 h-7 text-yellow-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Fast & High Quality</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Generate content in seconds with state-of-the-art AI models. Professional quality output every time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-black to-gray-950">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2
                            className="text-4xl sm:text-5xl md:text-6xl font-medium mb-4"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            How It Works
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Create stunning content in three simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-yellow-400/0 via-yellow-400/50 to-yellow-400/0" />

                        {/* Step 1 */}
                        <div className="relative text-center">
                            <div className="w-20 h-20 mx-auto rounded-full bg-yellow-400 flex items-center justify-center mb-6 relative z-10">
                                <Type className="w-8 h-8 text-black" />
                            </div>
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-sm font-bold">1</div>
                            <h3 className="text-xl font-semibold mb-3">Enter Your Prompt</h3>
                            <p className="text-gray-400">
                                Describe what you want to create. Be as detailed or as simple as you like.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative text-center">
                            <div className="w-20 h-20 mx-auto rounded-full bg-yellow-400 flex items-center justify-center mb-6 relative z-10">
                                <Wand2 className="w-8 h-8 text-black" />
                            </div>
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-sm font-bold">2</div>
                            <h3 className="text-xl font-semibold mb-3">AI Generates Content</h3>
                            <p className="text-gray-400">
                                Our advanced AI models process your request and create unique visuals.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative text-center">
                            <div className="w-20 h-20 mx-auto rounded-full bg-yellow-400 flex items-center justify-center mb-6 relative z-10">
                                <Download className="w-8 h-8 text-black" />
                            </div>
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-sm font-bold">3</div>
                            <h3 className="text-xl font-semibold mb-3">Download & Use</h3>
                            <p className="text-gray-400">
                                Get your high-quality content instantly. Use it anywhere, royalty-free.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-6 bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2
                            className="text-4xl sm:text-5xl md:text-6xl font-medium mb-4"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Simple Pricing
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Choose the plan that fits your creative needs
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Free Plan */}
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="text-xl font-semibold mb-2">Free</h3>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-gray-400">/month</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-yellow-400" />
                                    10 generations per month
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-yellow-400" />
                                    Standard quality
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-yellow-400" />
                                    Basic AI models
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-yellow-400" />
                                    Email support
                                </li>
                            </ul>
                            <Link to="/home" className="block text-center w-full py-3 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors">
                                Get Started
                            </Link>
                        </div>

                        {/* Pro Plan */}
                        <div className="p-8 rounded-2xl bg-gradient-to-b from-yellow-400/20 to-yellow-400/5 border-2 border-yellow-400 relative">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
                                Most Popular
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Pro</h3>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">$9.99</span>
                                <span className="text-gray-400">/month</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-yellow-400" />
                                    More credits for advanced models
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-yellow-400" />
                                    Unlimited generations for some models
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-yellow-400" />
                                    High quality output
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-yellow-400" />
                                    Priority processing
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-yellow-400" />
                                    Priority email support
                                </li>
                            </ul>
                            <button className="w-full py-3 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition-colors">
                                Subscribe Now
                            </button>
                        </div>

                        {/* Business Plan */}
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="text-xl font-semibold mb-2">Business</h3>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">$19.99</span>
                                <span className="text-gray-400">/month</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-yellow-400" />
                                    Everything from Pro plan
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-yellow-400" />
                                    Additional credits
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-yellow-400" />
                                    Premium AI models
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-yellow-400" />
                                    Commercial license
                                </li>
                                <li className="flex items-center gap-3 text-gray-300">
                                    <Check className="w-5 h-5 text-yellow-400" />
                                    Dedicated support
                                </li>
                            </ul>
                            <button className="w-full py-3 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors">
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div
                    className="max-w-6xl mx-auto rounded-3xl overflow-hidden relative bg-gradient-to-br from-gray-800 to-gray-900"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-400/10 via-transparent to-transparent" />
                    <div className="relative z-10 py-20 px-8 text-center">
                        <h2
                            className="text-3xl sm:text-4xl md:text-5xl font-medium mb-6"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Start Creating Today
                        </h2>
                        <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                            Join thousands of creators using Nyxel to bring their ideas to life.
                        </p>
                        <Link
                            to="/home"
                            className="inline-block bg-white/10 backdrop-blur-sm text-white border border-white/50 px-10 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all"
                        >
                            Start Free Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 px-6 bg-black">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2
                            className="text-4xl sm:text-5xl md:text-6xl font-medium mb-4"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <Accordion type="single" collapsible className="space-y-4">
                        <AccordionItem value="payment" className="border-b border-white/10">
                            <AccordionTrigger className="text-left text-lg hover:no-underline py-5">
                                What payment methods do you accept?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-400 pb-5">
                                We accept all major credit cards including Visa, Mastercard, American Express, and JCB. All payments are processed securely through Stripe.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="refunds" className="border-b border-white/10">
                            <AccordionTrigger className="text-left text-lg hover:no-underline py-5">
                                How do refunds work?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-400 pb-5">
                                Due to the nature of digital content and AI processing costs, refunds are generally not provided after credits have been used. If you cancel within 7 days of purchase and have not used your credits, you may request a full refund. Please try our free plan to evaluate the service before subscribing.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="support" className="border-b border-white/10">
                            <AccordionTrigger className="text-left text-lg hover:no-underline py-5">
                                Is there customer support?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-400 pb-5">
                                Yes, we provide email support for all users at Nyxel.ai@proton.me. Free plan users receive standard support, while Pro and Business plan subscribers receive priority support with faster response times.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="commercial" className="border-b border-white/10">
                            <AccordionTrigger className="text-left text-lg hover:no-underline py-5">
                                Can I use generated content commercially?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-400 pb-5">
                                Yes, all content generated on Nyxel can be used for commercial purposes. Business plan subscribers receive an extended commercial license for additional protection.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="cancel" className="border-b border-white/10">
                            <AccordionTrigger className="text-left text-lg hover:no-underline py-5">
                                Can I cancel my subscription anytime?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-400 pb-5">
                                Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period. No additional charges will be made after cancellation.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 px-6 bg-black border-t border-white/10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12 mb-12">
                        {/* Left - Company Info */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-6 h-6 text-yellow-400" />
                                <span className="text-xl font-bold">Nyxel</span>
                            </div>
                            <p className="text-gray-400 mb-4">
                                AI Image & Video Generation Platform
                            </p>
                            <p className="text-sm text-gray-500">
                                © 2026 Nyxel. All rights reserved.
                            </p>
                        </div>

                        {/* Center - Legal Links */}
                        <div className="text-center">
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
                                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                                <Link to="/commerce" className="hover:text-white transition-colors">Commerce Disclosure</Link>
                                <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                            </div>
                        </div>

                        {/* Right - Contact */}
                        <div className="md:text-right">
                            <h4 className="font-semibold mb-4">Contact</h4>
                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex items-center md:justify-end gap-2">
                                    <Mail className="w-4 h-4" />
                                    <a href="mailto:Nyxel.ai@proton.me" className="hover:text-white transition-colors">
                                        Nyxel.ai@proton.me
                                    </a>
                                </div>
                                <div className="flex items-center md:justify-end gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Mon-Fri 9:00-18:00 JST</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/10 text-center text-sm text-gray-500">
                        <p>Transforming creativity with AI technology. Built for creators, by creators.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
