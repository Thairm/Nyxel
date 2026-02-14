import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#0D0F0E] text-gray-300">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>

                <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
                <p className="text-gray-400 mb-10">We're here to help. Reach out to us through any of the channels below.</p>

                <div className="space-y-6">
                    {/* Email */}
                    <div className="border border-white/10 rounded-xl p-6 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <Mail size={20} className="text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">Email Support</h2>
                                <p className="text-gray-400 text-sm mb-3">For general inquiries, billing questions, and technical support.</p>
                                <a
                                    href="mailto:Nyxel.ai@proton.me"
                                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                                >
                                    Nyxel.ai@proton.me
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Response Time */}
                    <div className="border border-white/10 rounded-xl p-6 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <MessageSquare size={20} className="text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">Response Time</h2>
                                <p className="text-gray-400 text-sm">We typically respond within 24-48 hours during business days. For urgent billing issues, please include your account email in your message.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business Info */}
                <div className="mt-10 pt-8 border-t border-white/10">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Business Information</h3>
                    <div className="text-sm text-gray-400 space-y-1">
                        <p><span className="text-gray-500">Business Name:</span> Nyxel</p>
                        <p><span className="text-gray-500">Email:</span> <a href="mailto:Nyxel.ai@proton.me" className="text-emerald-400 hover:text-emerald-300 transition-colors">Nyxel.ai@proton.me</a></p>
                        <p><span className="text-gray-500">Service:</span> AI Image & Video Generation Platform</p>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-16 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
                    <p>© 2026 Nyxel. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
