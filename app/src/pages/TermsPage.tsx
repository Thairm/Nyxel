import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#0D0F0E] text-gray-300">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>

                <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
                <p className="text-gray-500 mb-8">Last updated: February 14, 2026</p>

                <div className="space-y-8 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                        <p>By accessing or using Nyxel ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
                        <p>Nyxel is an AI-powered creative platform that provides tools for generating images and videos using artificial intelligence models. Users purchase credits to access generation features through a subscription or pay-per-use model.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You must be at least 18 years old to use this Service.</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>You are responsible for all activities that occur under your account.</li>
                            <li>You agree to provide accurate and complete information when creating your account.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">4. Payment Terms</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Credits and subscriptions are billed in advance on a recurring basis.</li>
                            <li>All payments are processed securely through Stripe.</li>
                            <li>Prices are listed in the applicable currency and include any applicable taxes.</li>
                            <li>You authorize us to charge your selected payment method for any paid services.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">5. Credits and Usage</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Credits are consumed when you use AI generation features.</li>
                            <li>Unused credits from monthly subscriptions do not roll over to the next billing period unless otherwise stated.</li>
                            <li>Credit consumption rates vary depending on the AI model and output type selected.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">6. Intellectual Property</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Content generated using Nyxel's AI tools belongs to the user who created it, subject to the underlying AI model's terms.</li>
                            <li>The Nyxel platform, including its design, code, and branding, is the property of Nyxel and is protected by intellectual property laws.</li>
                            <li>You may not copy, modify, or distribute the platform's proprietary materials without permission.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">7. Acceptable Use</h2>
                        <p className="mb-2">You agree not to use the Service to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Generate content that violates any applicable laws or regulations.</li>
                            <li>Generate content depicting minors in inappropriate contexts.</li>
                            <li>Harass, abuse, or harm other users.</li>
                            <li>Attempt to reverse-engineer or exploit the platform's systems.</li>
                            <li>Use automated systems to access the Service without authorization.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">8. Content Sharing</h2>
                        <p>Content shared on Nyxel's public gallery must comply with our community guidelines. We reserve the right to remove any content that violates these guidelines without notice.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">9. Limitation of Liability</h2>
                        <p>Nyxel is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid to us in the 12 months prior to the claim.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">10. Termination</h2>
                        <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms. You may cancel your account at any time through your account settings.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">11. Changes to Terms</h2>
                        <p>We may update these Terms from time to time. We will notify users of significant changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">12. Contact</h2>
                        <p>If you have any questions about these Terms, please contact us at:</p>
                        <p className="mt-2">
                            <a href="mailto:Nyxel.ai@proton.me" className="text-emerald-400 hover:text-emerald-300 transition-colors">Nyxel.ai@proton.me</a>
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <footer className="mt-16 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
                    <p>© 2026 Nyxel. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
