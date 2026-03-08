import { ArrowLeft, BookOpen, Zap, Image, CreditCard, MessageSquare, HelpCircle, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const docSections = [
  { id: 'welcome', title: 'Welcome to Nyxel', icon: BookOpen },
  { id: 'getting-started', title: 'Getting Started', icon: Zap },
  { id: 'image-generation', title: 'Image Generation', icon: Image },
  { id: 'subscription', title: 'Subscription & Credits', icon: CreditCard },
  { id: 'prompting-tips', title: 'Prompting Tips', icon: MessageSquare },
  { id: 'faq', title: 'FAQ', icon: HelpCircle },
];

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('welcome');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F0E] text-white">

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0D0F0E] border-r border-white/5 z-50 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo / Back */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold text-sm block">Back</span>
              <p className="text-[10px] text-gray-500">Return to site</p>
            </div>
          </Link>
          {/* Close on mobile */}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-[10px] font-medium text-gray-600 uppercase tracking-wider mb-3 px-3">Documentation</p>
          <nav className="space-y-0.5">
            {docSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    activeSection === section.id
                      ? 'bg-white/10 text-white border-l-2 border-purple-400 pl-2.5'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${activeSection === section.id ? 'text-purple-400' : ''}`} />
                  <span className="text-left">{section.title}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/5">
          <p className="text-xs text-gray-600">© 2026 Nyxel</p>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#0D0F0E]/95 backdrop-blur-sm border-b border-white/5 px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Menu className="w-5 h-5" />
              <span className="text-sm">Menu</span>
            </button>

            <h1 className="text-lg sm:text-xl font-bold text-white">Documentation</h1>

            <Link
              to="/"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="sm:hidden w-16" />
          </div>
        </header>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">

          {/* Welcome */}
          <section id="welcome" className="mb-12 pt-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Welcome to Nyxel</h1>
            <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
              Nyxel lets you create beautiful anime and illustration art using AI in seconds.
              Just type a description, hit Generate, and your image appears. No settings to learn.
            </p>
          </section>

          {/* Getting Started */}
          <section id="getting-started" className="mb-12 pt-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Getting Started</h2>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Create an Account', desc: 'Sign up to get 50 free Crystals and start generating right away.' },
                { step: '2', title: 'Type a Prompt', desc: 'Describe the image you want. For anime, mention character details, style, and mood.' },
                { step: '3', title: 'Choose Aspect Ratio', desc: 'Open the Settings button in the prompt bar to pick your ratio (portrait, square, landscape).' },
                { step: '4', title: 'Hit Generate', desc: 'Press the purple Generate button or Ctrl+Enter. Your image appears in 10–30 seconds.' },
              ].map(item => (
                <div key={item.step} className="flex gap-4 bg-[#141816] rounded-xl p-4 sm:p-5 border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Image Generation */}
          <section id="image-generation" className="mb-12 pt-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Image Generation</h2>
            <div className="bg-[#141816] rounded-xl p-4 sm:p-6 border border-white/5 mb-4">
              <p className="text-gray-400 leading-relaxed mb-5">
                Nyxel uses <strong className="text-white">Nyxel V1.0</strong> — our flagship anime & illustration model. Here's how the controls work:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: 'Prompt', desc: 'Positive description of what you want to appear in the image.' },
                  { title: 'Negative Prompt', desc: 'Things to exclude — e.g. blurry, bad hands, watermark.' },
                  { title: 'Aspect Ratio', desc: 'Choose from 1:1, 2:3, 3:2, 9:16, 16:9 in the Settings popup.' },
                  { title: 'Free Generation', desc: 'Standard plan users can toggle Free Generation to generate without spending Crystals.' },
                ].map(item => (
                  <div key={item.title} className="bg-[#0D0F0E] rounded-lg p-4">
                    <h4 className="text-white font-medium mb-1 text-sm">{item.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Subscription & Credits */}
          <section id="subscription" className="mb-12 pt-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Subscription & Credits</h2>
            <div className="bg-[#141816] rounded-xl p-4 sm:p-6 border border-white/5">
              <p className="text-gray-400 leading-relaxed mb-5">
                Crystals power your generations. Each image costs <strong className="text-white">10 Crystals</strong>.
              </p>
              <div className="space-y-3">
                {[
                  { name: 'Free', price: 'Free', crystals: '50 Crystals / month', note: '~5 images' },
                  { name: 'Starter', price: '$4.99 / month', crystals: '5,000 Crystals / month', note: '~500 images' },
                  { name: 'Standard', price: '$9.99 / month', crystals: '10,000 Crystals / month', note: '~1,000 images + Free Generation ✨' },
                ].map(tier => (
                  <div key={tier.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-[#0D0F0E] rounded-lg px-4 py-3 border border-white/5">
                    <div>
                      <span className="text-white font-medium text-sm">{tier.name}</span>
                      <span className="text-gray-500 text-xs ml-2">{tier.price}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-purple-400 text-sm font-medium">{tier.crystals}</div>
                      <div className="text-gray-600 text-xs">{tier.note}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/pricing" className="inline-block mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                View full pricing →
              </Link>
            </div>
          </section>

          {/* Prompting Tips */}
          <section id="prompting-tips" className="mb-12 pt-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Prompting Tips</h2>
            <div className="bg-[#141816] rounded-xl p-4 sm:p-6 border border-white/5">
              <div className="space-y-3">
                {[
                  { tip: 'Be Specific', desc: 'Include details about style, lighting, and composition. "1girl, blue dress, sunset background, anime style" is better than just "girl".' },
                  { tip: 'Quality Tags', desc: 'Add "masterpiece, best quality, highly detailed" to improve output quality.' },
                  { tip: 'Style Keywords', desc: 'Try: anime, manga, watercolor, digital art, oil painting, 3D render, cinematic.' },
                  { tip: 'Use Negative Prompts', desc: 'Common negatives: "blurry, bad anatomy, deformed, watermark, text, ugly, low quality".' },
                  { tip: 'Describe the Scene', desc: 'Who, what, where, and when — "samurai standing in a cherry blossom forest, night, moonlight".' },
                ].map(item => (
                  <div key={item.tip} className="flex gap-3 bg-[#0D0F0E] rounded-lg p-3 border-l-2 border-purple-500">
                    <div>
                      <h4 className="text-white font-medium text-sm mb-1">{item.tip}</h4>
                      <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="mb-12 pt-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">FAQ</h2>
            <div className="space-y-4">
              {[
                { q: 'How long does generation take?', a: 'Typically 10–30 seconds depending on server load. You will see a loading animation while it processes.' },
                { q: 'What is Free Generation?', a: 'Standard plan users can toggle Free Generation mode to generate images without spending Crystals. The queue may be slightly slower.' },
                { q: 'Do Crystals expire?', a: 'Crystals reset each month when your subscription renews. Unused Crystals do not carry over.' },
                { q: 'Can I use my images commercially?', a: 'Yes, all images generated on Nyxel can be used for personal and commercial purposes.' },
                { q: 'What file format are images saved in?', a: 'Images are saved as high-quality PNG or JPEG files. Use the download button on any generation.' },
              ].map(item => (
                <div key={item.q} className="bg-[#141816] rounded-xl p-4 sm:p-6 border border-white/5">
                  <h3 className="text-white font-semibold text-base mb-2">{item.q}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          <footer className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-sm">Need help? <a href="mailto:support@nyxel.ai" className="text-purple-400 hover:text-purple-300">Contact support</a></p>
            <p className="text-gray-700 text-xs mt-2">© 2026 Nyxel. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
