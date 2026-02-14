import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0D0F0E] text-gray-300">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>

                <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
                <p className="text-gray-500 mb-8">Last updated: February 14, 2026</p>

                <div className="space-y-8 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
                        <p>Nyxel ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI creative platform.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
                        <h3 className="text-lg font-medium text-white mt-4 mb-2">Personal Information</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Email address (for account creation and communication)</li>
                            <li>Display name (for your public profile)</li>
                            <li>Payment information (processed securely by Stripe — we do not store card details)</li>
                        </ul>
                        <h3 className="text-lg font-medium text-white mt-4 mb-2">Usage Information</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Generation history and preferences</li>
                            <li>Device information and browser type</li>
                            <li>IP address and access logs</li>
                            <li>Pages visited and features used</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To provide and maintain the Service</li>
                            <li>To process payments and manage subscriptions</li>
                            <li>To communicate with you about your account and updates</li>
                            <li>To improve our platform and user experience</li>
                            <li>To detect and prevent fraud or abuse</li>
                            <li>To comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">4. Data Storage and Security</h2>
                        <p>Your data is stored securely using industry-standard encryption and security practices. We use trusted third-party services including:</p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                            <li><strong className="text-white">Stripe</strong> — for payment processing (PCI DSS compliant)</li>
                            <li><strong className="text-white">Supabase</strong> — for authentication and database services</li>
                            <li><strong className="text-white">Backblaze B2</strong> — for secure file storage</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">5. Cookies</h2>
                        <p>We use essential cookies to maintain your session and preferences. We do not use tracking cookies for advertising purposes.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">6. Third-Party Services</h2>
                        <p>We may share your information with third-party service providers only as necessary to provide the Service. These parties are obligated to protect your information and may not use it for other purposes.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
                        <p className="mb-2">You have the right to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Access your personal data</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your account and associated data</li>
                            <li>Export your data in a portable format</li>
                            <li>Opt out of non-essential communications</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">8. Data Retention</h2>
                        <p>We retain your personal information for as long as your account is active or as needed to provide you with the Service. You can request deletion of your data at any time by contacting us.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">9. Children's Privacy</h2>
                        <p>Our Service is not intended for users under the age of 18. We do not knowingly collect personal information from children.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">10. Changes to This Policy</h2>
                        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">11. Contact</h2>
                        <p>If you have questions about this Privacy Policy, please contact us at:</p>
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
