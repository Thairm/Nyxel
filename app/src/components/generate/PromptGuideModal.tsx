import { useState } from 'react';
import { X, BookOpen, Star, Users, Palette, Zap } from 'lucide-react';

interface PromptGuideModalProps {
    open: boolean;
    onClose: () => void;
}

const tabs = [
    { id: 'tags',       label: 'Tags & Danbooru', icon: BookOpen },
    { id: 'quality',    label: 'Quality Tags',    icon: Star },
    { id: 'characters', label: 'Characters',      icon: Users },
    { id: 'style',      label: 'Art Style',       icon: Palette },
    { id: 'priority',   label: 'Priority Queue',  icon: Zap },
] as const;

type TabId = typeof tabs[number]['id'];

export default function PromptGuideModal({ open, onClose }: PromptGuideModalProps) {
    const [activeTab, setActiveTab] = useState<TabId>('tags');

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-[#141816] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
                    <div>
                        <h2 className="text-base font-semibold text-white">Prompting Guide</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Learn how to get the best results</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 px-4 pt-3 pb-0 border-b border-white/10 flex-shrink-0 overflow-x-auto">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                                activeTab === id
                                    ? 'text-white border-purple-400 bg-white/5'
                                    : 'text-gray-500 border-transparent hover:text-gray-300'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 px-6 py-5 text-sm text-gray-300 space-y-4">

                    {/* ── Tags & Danbooru ── */}
                    {activeTab === 'tags' && (
                        <div className="space-y-4">
                            <p>Prompts use <strong className="text-white">comma-separated tags</strong>. Each tag describes one aspect of the image — the more specific, the better.</p>

                            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-2">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Basic structure</p>
                                <code className="block text-purple-300 text-xs leading-relaxed">
                                    subject, setting, action, clothing, expression, quality tags
                                </code>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Danbooru-style tags</p>
                                <p>Nyxel models are trained on danbooru-style tags. These are very precise descriptors:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { cat: 'Subject', examples: '1girl, 1boy, animal ears, elf' },
                                        { cat: 'Hair', examples: 'long hair, silver hair, twintails' },
                                        { cat: 'Eyes', examples: 'blue eyes, heterochromia, glowing eyes' },
                                        { cat: 'Outfit', examples: 'school uniform, armor, maid outfit' },
                                        { cat: 'Pose', examples: 'standing, sitting, looking at viewer' },
                                        { cat: 'Background', examples: 'forest, city street, bedroom' },
                                    ].map(({ cat, examples }) => (
                                        <div key={cat} className="bg-white/[0.03] rounded-lg p-3">
                                            <p className="text-xs text-purple-400 font-medium mb-1">{cat}</p>
                                            <p className="text-xs text-gray-400">{examples}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-purple-400/5 border border-purple-400/10 rounded-xl p-4">
                                <p className="text-xs font-semibold text-purple-300 mb-1">💡 Tip</p>
                                <p className="text-xs text-gray-400">Tags earlier in the prompt have more influence. Put the most important elements first.</p>
                            </div>
                        </div>
                    )}

                    {/* ── Quality Tags ── */}
                    {activeTab === 'quality' && (
                        <div className="space-y-4">
                            <p>Quality tags steer the model toward high-fidelity outputs. The models on Nyxel respond best to these specific tags.</p>

                            <div className="space-y-3">
                                <div className="bg-emerald-400/5 border border-emerald-400/10 rounded-xl p-4">
                                    <p className="text-xs font-semibold text-emerald-400 mb-2">✅ Positive prompt — add these</p>
                                    <code className="block text-xs text-gray-300 leading-relaxed">
                                        masterpiece, best quality, high quality, detailed,<br />
                                        good anatomy, good quality
                                    </code>
                                </div>

                                <div className="bg-red-400/5 border border-red-400/10 rounded-xl p-4">
                                    <p className="text-xs font-semibold text-red-400 mb-2">❌ Negative prompt — always include these</p>
                                    <code className="block text-xs text-gray-300 leading-relaxed">
                                        worst quality, low quality, bad quality,<br />
                                        bad anatomy, bad hands, text, watermark,<br />
                                        blurry, artist name, words
                                    </code>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500">These are already pre-filled for you in both prompt fields. You can add your own tags after them.</p>

                            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                <p className="text-xs font-semibold text-gray-400 mb-2">Score tags (NoobAI / Illustrious models)</p>
                                <p className="text-xs text-gray-400 mb-2">These models also respond well to score-based tags:</p>
                                <code className="block text-xs text-purple-300">score_9, score_8_up, score_7_up</code>
                                <p className="text-xs text-gray-500 mt-2">Add these at the start of your positive prompt for even better quality.</p>
                            </div>
                        </div>
                    )}

                    {/* ── Multiple Characters ── */}
                    {activeTab === 'characters' && (
                        <div className="space-y-4">
                            <p>Generating multiple characters in one image requires specific tag combinations.</p>

                            <div className="space-y-3">
                                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Count tags</p>
                                    {[
                                        { tag: '1girl', desc: 'Single female character' },
                                        { tag: '2girls', desc: 'Two female characters' },
                                        { tag: '1boy 1girl', desc: 'One male and one female' },
                                        { tag: 'multiple girls', desc: 'Three or more females' },
                                        { tag: 'solo', desc: 'Explicitly one character only' },
                                        { tag: 'solo focus', desc: 'Focus on one character even if others present' },
                                    ].map(({ tag, desc }) => (
                                        <div key={tag} className="flex items-center justify-between">
                                            <code className="text-xs text-purple-300">{tag}</code>
                                            <span className="text-xs text-gray-500">{desc}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                    <p className="text-xs font-semibold text-gray-400 mb-2">Example — two characters</p>
                                    <code className="block text-xs text-gray-300 leading-relaxed">
                                        2girls, one with long silver hair blue dress,<br />
                                        one with short dark hair red jacket,<br />
                                        standing together, smile, outdoors
                                    </code>
                                </div>
                            </div>

                            <div className="bg-yellow-400/5 border border-yellow-400/10 rounded-xl p-4">
                                <p className="text-xs font-semibold text-yellow-400 mb-1">⚠️ Note</p>
                                <p className="text-xs text-gray-400">Multiple characters are harder to control. If anatomy looks wrong, try generating with just one character, or use a higher step count in the advanced settings.</p>
                            </div>
                        </div>
                    )}

                    {/* ── Art Style ── */}
                    {activeTab === 'style' && (
                        <div className="space-y-4">
                            <p>Art style tags let you control the visual look and rendering style of your image.</p>

                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { style: 'anime style', desc: 'Classic cel-shaded anime look' },
                                    { style: 'manga style', desc: 'Black & white manga aesthetic' },
                                    { style: 'watercolor', desc: 'Soft watercolor painting effect' },
                                    { style: 'oil painting', desc: 'Rich textured oil painting' },
                                    { style: 'chibi', desc: 'Super-deformed cute style' },
                                    { style: 'realistic', desc: 'More photo-realistic rendering' },
                                    { style: 'fantasy art', desc: 'Epic fantasy illustration style' },
                                    { style: 'cyberpunk', desc: 'Neon-lit futuristic aesthetic' },
                                ].map(({ style, desc }) => (
                                    <div key={style} className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                                        <code className="text-xs text-purple-300 block mb-1">{style}</code>
                                        <p className="text-xs text-gray-500">{desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                <p className="text-xs font-semibold text-gray-400 mb-2">Background & setting tags</p>
                                <code className="block text-xs text-gray-300 leading-relaxed">
                                    detailed background, forest background, cityscape,<br />
                                    night sky, indoors, library, beach, castle
                                </code>
                            </div>

                            <div className="bg-purple-400/5 border border-purple-400/10 rounded-xl p-4">
                                <p className="text-xs font-semibold text-purple-300 mb-1">💡 Tip</p>
                                <p className="text-xs text-gray-400">Each model has its own style bias. Try the same prompt on different models to see how the style changes.</p>
                            </div>
                        </div>
                    )}

                    {/* ── Priority Queue ── */}
                    {activeTab === 'priority' && (
                        <div className="space-y-4">
                            <p>Nyxel uses a <strong className="text-white">priority queue system</strong> so paid subscribers get faster generation times.</p>

                            <div className="space-y-3">
                                {[
                                    {
                                        tier: 'Free',
                                        icon: '🐢',
                                        color: 'border-white/10 bg-white/[0.02]',
                                        label: 'text-gray-400',
                                        desc: 'Shared standard queue. Slower during peak hours.',
                                        detail: null,
                                    },
                                    {
                                        tier: 'Starter',
                                        icon: '⚡',
                                        color: 'border-blue-400/20 bg-blue-400/5',
                                        label: 'text-blue-300',
                                        desc: 'Crystal fast-pass queue. Consistently faster than free tier.',
                                        detail: null,
                                    },
                                    {
                                        tier: 'Standard',
                                        icon: '🚀',
                                        color: 'border-yellow-400/20 bg-yellow-400/5',
                                        label: 'text-yellow-300',
                                        desc: 'Higher priority than Starter. Fast, reliable generation speeds.',
                                        detail: null,
                                    },
                                    {
                                        tier: 'Pro',
                                        icon: '🌟',
                                        color: 'border-purple-400/30 bg-purple-400/5',
                                        label: 'text-purple-300',
                                        desc: 'Highest priority queue — fastest possible generation times.',
                                        detail: 'Pro also unlocks Free Generation mode, letting you generate select models without spending Crystals.',
                                    },
                                ].map(({ tier, icon, color, label, desc, detail }) => (
                                    <div key={tier} className={`border rounded-xl p-4 ${color}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span>{icon}</span>
                                            <span className={`text-sm font-semibold ${label}`}>{tier}</span>
                                        </div>
                                        <p className="text-xs text-gray-400">{desc}</p>
                                        {detail && <p className="text-xs text-purple-300 mt-2">{detail}</p>}
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                <p className="text-xs text-gray-400">
                                    Visit the <a href="/pricing" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Pricing page</a> to upgrade your plan and unlock faster generation.
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 flex-shrink-0">
                    <p className="text-xs text-gray-600">This guide is always available via the <span className="text-gray-400 font-mono">?</span> button</p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}
