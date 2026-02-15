import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function CommercePage() {
    return (
        <div className="min-h-screen bg-[#0D0F0E] text-gray-300">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-8 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>

                <h1 className="text-3xl font-bold text-white mb-2">Commerce Disclosure</h1>
                <h2 className="text-xl text-gray-400 mb-8">特定商取引法に基づく表記</h2>

                <div className="space-y-1">
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] border border-white/10 rounded-lg overflow-hidden">
                        <Row label="Business Name" labelJa="販売業者名" value="Nyxel" />
                        <Row label="Representative" labelJa="運営統括責任者" value="Eiji Uemura / 上村 英士" />
                        <Row label="Address" labelJa="所在地" value="Will be disclosed upon request / ご請求に応じて遅滞なく開示いたします" />
                        <Row label="Phone Number" labelJa="電話番号" value="Will be disclosed upon request / ご請求に応じて遅滞なく開示いたします" />
                        <Row label="Email" labelJa="メールアドレス" value="Nyxel.ai@proton.me" isEmail />
                        <Row label="Website URL" labelJa="URL" value="https://nyxel-ten.vercel.app" isLink />
                        <Row
                            label="Product / Service"
                            labelJa="販売商品・サービス"
                            value="AI image and video generation credits (subscription-based SaaS) / AI画像・動画生成クレジット（サブスクリプション型SaaS）"
                        />
                        <Row
                            label="Pricing"
                            labelJa="販売価格"
                            value="Prices are displayed on the pricing page. All prices include applicable taxes. / 料金はプライシングページに表示されます。表示価格は税込みです。"
                        />
                        <Row
                            label="Additional Fees"
                            labelJa="商品代金以外の必要料金"
                            value="Internet connection fees and communication charges are borne by the customer. / インターネット接続料金及び通信料金はお客様のご負担となります。"
                        />
                        <Row
                            label="Payment Methods"
                            labelJa="支払方法"
                            value="Credit card (Visa, Mastercard, American Express, JCB) via Stripe / クレジットカード（Visa、Mastercard、American Express、JCB）Stripe経由"
                        />
                        <Row
                            label="Payment Timing"
                            labelJa="支払時期"
                            value="Payment is processed immediately upon purchase. For subscriptions, payment is charged at the start of each billing cycle. / 購入時に即時決済されます。サブスクリプションは各請求サイクルの開始時に課金されます。"
                        />
                        <Row
                            label="Service Delivery"
                            labelJa="引渡し時期"
                            value="Credits are available immediately after payment confirmation. / お支払い確認後、即時にクレジットをご利用いただけます。"
                        />
                        <Row
                            label="Cancellation / Refund Policy"
                            labelJa="返品・キャンセルについて"
                            value="Due to the nature of digital services, refunds are generally not provided after credits have been used. Unused subscription credits can be refunded if cancellation is requested within 7 days of purchase. Subscriptions can be cancelled at any time and will remain active until the end of the current billing period. / デジタルサービスの性質上、クレジット使用後の返金は原則としてお受けできません。ご購入から7日以内にキャンセルをご依頼いただいた場合、未使用のサブスクリプションクレジットについては返金が可能です。サブスクリプションはいつでもキャンセル可能で、現在の請求期間の終了まで有効です。"
                            isLast
                        />
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

function Row({ label, labelJa, value, isEmail, isLink, isLast }: {
    label: string;
    labelJa: string;
    value: string;
    isEmail?: boolean;
    isLink?: boolean;
    isLast?: boolean;
}) {
    return (
        <>
            <div className={`bg-white/5 px-4 py-3 font-medium text-white ${!isLast ? 'border-b border-white/10' : ''}`}>
                <div>{label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{labelJa}</div>
            </div>
            <div className={`px-4 py-3 ${!isLast ? 'border-b border-white/10' : ''}`}>
                {isEmail ? (
                    <a href={`mailto:${value}`} className="text-emerald-400 hover:text-emerald-300 transition-colors">{value}</a>
                ) : isLink ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 transition-colors">{value}</a>
                ) : (
                    <span>{value}</span>
                )}
            </div>
        </>
    );
}
