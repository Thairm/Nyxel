import { ArrowLeft, BookOpen, Home, Zap, Image, Video, Settings, HelpCircle, MessageSquare, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

// Documentation sections
const docSections = [
  { id: 'welcome', title: 'Welcome', icon: BookOpen },
  { id: 'getting-started', title: 'Getting Started', icon: Zap },
  { id: 'image-generation', title: 'Image Generation', icon: Image },
  { id: 'video-generation', title: 'Video Generation', icon: Video },
  { id: 'ai-models', title: 'AI Models', icon: Settings },
  { id: 'subscription', title: 'Subscription & Credits', icon: CreditCard },
  { id: 'prompting-tips', title: 'Prompting Tips', icon: MessageSquare },
  { id: 'faq', title: 'FAQ', icon: HelpCircle },
];

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('welcome');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F0E] flex">
      {/* Left Sidebar Navigation */}
      <aside className="fixed left-0 top-0 w-64 h-full bg-[#0D0F0E] border-r border-white/5 z-50 flex flex-col">
        {/* Logo / Back to Hub */}
        <div className="p-4 border-b border-white/5">
          <Link 
            to="/" 
            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-emerald flex items-center justify-center group-hover:opacity-90 transition-opacity">
              <ArrowLeft className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold">Back to Hub</span>
              <p className="text-xs text-gray-500">Return to main page</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-3">
              Documentation
            </h3>
            <nav className="space-y-1">
              {docSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-white/10 text-white border-l-2 border-emerald-500'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${activeSection === section.id ? 'text-emerald-400' : ''}`} />
                    <span className="text-left flex-1">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <p className="text-xs text-gray-500">
            © 2026 AI Art Platform
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Header with Back Button */}
        <header className="sticky top-0 z-40 bg-[#0D0F0E]/95 backdrop-blur-sm border-b border-white/5 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 px-4 py-2 bg-[#1A1E1C] rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Hub</span>
              </Link>
            </div>
            <h1 className="text-xl font-bold text-white">Documentation</h1>
            <div className="w-32"></div> {/* Spacer for alignment */}
          </div>
        </header>

        {/* Content */}
        <div className="max-w-4xl mx-auto p-8">
          {/* Welcome Section */}
          <section id="welcome" className="mb-12 pt-8">
            <h1 className="text-3xl font-bold text-white mb-6">Welcome</h1>
            <p className="text-gray-400 leading-relaxed text-lg">
              Welcome to our AI Art Platform documentation. This comprehensive guide will help you understand 
              how to use our platform to generate stunning AI images and videos using state-of-the-art 
              models including Stable Diffusion, Sora, and more. Whether you're a beginner or experienced 
              creator, you'll find everything you need to create amazing AI art.
            </p>
          </section>

          {/* Getting Started Section */}
          <section id="getting-started" className="mb-12 pt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Getting Started</h2>
            <div className="space-y-6 text-gray-400">
              <div className="bg-[#141816] rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">1. Create an Account</h3>
                <p className="leading-relaxed">Sign up to get access to our AI generation tools and start creating amazing content.</p>
              </div>
              <div className="bg-[#141816] rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">2. Choose Your Mode</h3>
                <p className="leading-relaxed">Select between Image Generation or Video Generation from the sidebar or home page.</p>
              </div>
              <div className="bg-[#141816] rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">3. Select a Model</h3>
                <p className="leading-relaxed">Choose from our library of AI models including SDXL, Nano Banana Pro, Sora 2, and many more.</p>
              </div>
              <div className="bg-[#141816] rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">4. Enter Your Prompt</h3>
                <p className="leading-relaxed">Describe what you want to create. Be specific and detailed for best results.</p>
              </div>
              <div className="bg-[#141816] rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">5. Configure Settings</h3>
                <p className="leading-relaxed">Adjust resolution, aspect ratio, quantity, and other parameters to customize your output.</p>
              </div>
              <div className="bg-[#141816] rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">6. Generate</h3>
                <p className="leading-relaxed">Click the Generate button and watch your creation come to life!</p>
              </div>
            </div>
          </section>

          {/* Image Generation Section */}
          <section id="image-generation" className="mb-12 pt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Image Generation</h2>
            <div className="bg-[#141816] rounded-xl p-6 border border-white/5 mb-6">
              <p className="text-gray-400 leading-relaxed mb-4">
                Our image generation feature supports multiple AI models and offers extensive customization options.
              </p>
              <h3 className="text-lg font-medium text-white mb-4">Available Settings:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0D0F0E] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Aspect Ratio</h4>
                  <p className="text-gray-500 text-sm">2:3, 1:1, 9:16, 4:3, or more</p>
                </div>
                <div className="bg-[#0D0F0E] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Image Quantity</h4>
                  <p className="text-gray-500 text-sm">Generate 1-4 images per prompt</p>
                </div>
                <div className="bg-[#0D0F0E] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Generation Mode</h4>
                  <p className="text-gray-500 text-sm">Standard (faster) or Quality (better results)</p>
                </div>
                <div className="bg-[#0D0F0E] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Private Creation</h4>
                  <p className="text-gray-500 text-sm">Keep your generations private</p>
                </div>
              </div>
            </div>
          </section>

          {/* Video Generation Section */}
          <section id="video-generation" className="mb-12 pt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Video Generation</h2>
            <div className="bg-[#141816] rounded-xl p-6 border border-white/5 mb-6">
              <p className="text-gray-400 leading-relaxed mb-4">
                Create AI-powered videos using our advanced video generation models.
              </p>
              <h3 className="text-lg font-medium text-white mb-4">Available Settings:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0D0F0E] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Video Resolution</h4>
                  <p className="text-gray-500 text-sm">480p, 720p, 1080p, or 4K</p>
                </div>
                <div className="bg-[#0D0F0E] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">FPS</h4>
                  <p className="text-gray-500 text-sm">24, 30, or 60 frames per second</p>
                </div>
                <div className="bg-[#0D0F0E] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Duration</h4>
                  <p className="text-gray-500 text-sm">Generate videos from 3 to 15 seconds</p>
                </div>
                <div className="bg-[#0D0F0E] rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Video Quantity</h4>
                  <p className="text-gray-500 text-sm">Create 1-4 videos per prompt</p>
                </div>
              </div>
            </div>
          </section>

          {/* AI Models Section */}
          <section id="ai-models" className="mb-12 pt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Available AI Models</h2>
            <div className="bg-[#141816] rounded-xl p-6 border border-white/5">
              <p className="text-gray-400 leading-relaxed mb-6">
                We offer a wide variety of AI models to suit different creative needs:
              </p>
              <div className="space-y-3">
                <div className="bg-[#0D0F0E] rounded-lg p-4">
                  <h4 className="text-white font-medium">Stable Diffusion XL (SDXL)</h4>
                  <p className="text-gray-500 text-sm">Excellent for anime and general art generation</p>
                </div>
                <div className="bg-[#0D0F0E] rounded-lg p-4">
                  <h4 className="text-white font-medium">Nano Banana Pro</h4>
                  <p className="text-gray-500 text-sm">Google's advanced image generation model</p>
                </div>
                <div className="bg-[#0D0F0E] rounded-lg p-4">
                  <h4 className="text-white font-medium">Sora 2</h4>
                  <p className="text-gray-500 text-sm">OpenAI's state-of-the-art video generation model</p>
                </div>
                <div className="bg-[#0D0F0E] rounded-lg p-4">
                  <h4 className="text-white font-medium">Veo 3.1</h4>
                  <p className="text-gray-500 text-sm">Google's powerful video generation model</p>
                </div>
              </div>
              <p className="text-gray-500 mt-4 text-center">And 300+ more models available...</p>
            </div>
          </section>

          {/* Subscription & Credits Section */}
          <section id="subscription" className="mb-12 pt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Subscription & Credits</h2>
            <div className="bg-[#141816] rounded-xl p-6 border border-white/5">
              <p className="text-gray-400 leading-relaxed mb-6">
                Our platform offers flexible subscription plans to meet your needs:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0D0F0E] rounded-lg p-4 border border-white/5">
                  <h4 className="text-white font-semibold mb-2">Free Tier</h4>
                  <p className="text-gray-500 text-sm">Limited generations per day</p>
                </div>
                <div className="bg-[#0D0F0E] rounded-lg p-4 border border-emerald-500/30">
                  <h4 className="text-white font-semibold mb-2">Starter - $9.99/month</h4>
                  <p className="text-gray-500 text-sm">80 SDXL credits + 20 premium credits</p>
                </div>
                <div className="bg-[#0D0F0E] rounded-lg p-4 border border-emerald-500/30">
                  <h4 className="text-white font-semibold mb-2">Pro - $19.99/month</h4>
                  <p className="text-gray-500 text-sm">250 SDXL credits + 50 premium credits</p>
                </div>
                <div className="bg-[#0D0F0E] rounded-lg p-4 border border-emerald-500/30">
                  <h4 className="text-white font-semibold mb-2">Unlimited - $39.99/month</h4>
                  <p className="text-gray-500 text-sm">600 SDXL credits + 100 premium credits</p>
                </div>
              </div>
              <p className="text-gray-500 mt-4 text-sm">
                Additional credits can be purchased anytime if you need more generations.
              </p>
            </div>
          </section>

          {/* Prompting Tips Section */}
          <section id="prompting-tips" className="mb-12 pt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Prompting Tips</h2>
            <div className="bg-[#141816] rounded-xl p-6 border border-white/5">
              <p className="text-gray-400 leading-relaxed mb-6">
                Writing effective prompts is key to getting great results:
              </p>
              <div className="space-y-4">
                <div className="bg-[#0D0F0E] rounded-lg p-4 border-l-2 border-emerald-500">
                  <h4 className="text-white font-medium mb-1">Be Specific</h4>
                  <p className="text-gray-500 text-sm">Include details about style, lighting, composition, and atmosphere</p>
                </div>
                <div className="bg-[#0D0F0E] rounded-lg p-4 border-l-2 border-emerald-500">
                  <h4 className="text-white font-medium mb-1">Use Style Keywords</h4>
                  <p className="text-gray-500 text-sm">anime, photorealistic, oil painting, digital art, 3D render, etc.</p>
                </div>
                <div className="bg-[#0D0F0E] rounded-lg p-4 border-l-2 border-emerald-500">
                  <h4 className="text-white font-medium mb-1">Describe the Scene</h4>
                  <p className="text-gray-500 text-sm">What's happening, where is it, when is it, who is in it</p>
                </div>
                <div className="bg-[#0D0F0E] rounded-lg p-4 border-l-2 border-emerald-500">
                  <h4 className="text-white font-medium mb-1">Quality Tags</h4>
                  <p className="text-gray-500 text-sm">masterpiece, best quality, highly detailed, professional</p>
                </div>
                <div className="bg-[#0D0F0E] rounded-lg p-4 border-l-2 border-emerald-500">
                  <h4 className="text-white font-medium mb-1">Avoid Negatives</h4>
                  <p className="text-gray-500 text-sm">Use negative prompts to exclude unwanted elements</p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="mb-12 pt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="bg-[#141816] rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">How long does generation take?</h3>
                <p className="text-gray-400 leading-relaxed">
                  Image generation typically takes 5-30 seconds depending on the model and settings. 
                  Video generation can take 1-5 minutes depending on duration and resolution.
                </p>
              </div>
              <div className="bg-[#141816] rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">Can I use generated content commercially?</h3>
                <p className="text-gray-400 leading-relaxed">
                  Yes, all content generated on our platform can be used for commercial purposes. 
                  However, please check individual model licenses for specific restrictions.
                </p>
              </div>
              <div className="bg-[#141816] rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-2">What file formats are supported?</h3>
                <p className="text-gray-400 leading-relaxed">
                  Images are generated in PNG, JPEG, or WebP formats. Videos are generated in MP4 format.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-sm">
              Need more help? Contact our support team or visit our community forums.
            </p>
            <p className="text-gray-600 text-xs mt-2">
              © 2026 AI Art Platform. All rights reserved.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
