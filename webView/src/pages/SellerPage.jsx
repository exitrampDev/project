import React from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primeflex/primeflex.css';
import Footer from "../components/Footer";
import Header from "../components/Header";
import ListingDashboardPreview from "../assets/my-listing-dashboard-preview.jpg";
import NDARequestsTablePreview from "../assets/nda-requests-table-preview.jpg";
import BuyerImg from "../assets/cimImgSeller.png";
import SellerControl from "../assets/buyerProfileReview.png";
import StandOut from "../assets/docManagementRoom.png";
import DueDeligence from "../assets/dueDelegence.jpg";
import InviteTeam from "../assets/InviteTeamDash.jpg";
import brokerDirectory  from "../assets/brokerDirectory.png"

export default function SellerPage() {
    return (
        <div className="surface-ground font-sans selection:bg-blue-500 selection:text-white">
            <Header />

            {/* 1. Hero Section */}
            <HeroSection />
            {/* 2. Pricing Tier Cards */}
            <PricingCardsSection />

            {/* 3. Detailed Comparison Table */}
            <ComparisonTableSection />

            {/* 4. Feature Details (Alternating Grid Layouts) */}
            <FeatureDetailsSection />

            {/* 5. Broker Advisory / Footer Promo */}
            <BrokerAdvisorySection />
            {/* 6. Team Feature Details Section */}
            <FeatureTeamDetailsSection />
            {/* 7. Broker Directory */}
            <BrokerDirectory/>
            <Footer />
        </div>
    );
}

// ==========================================
// 1. HERO SECTION
// ==========================================
function HeroSection() {
    return (
        <section className="hero__section_container" style={{ background: 'linear-gradient(180deg, #002F68 0%, #002F68 100%)' }}>
            <div className="hero__content_box">
                <h1 className="hero__heading">Selling Tools & Features</h1>
                <p className="hero__subheading">
                   Everything you need to confidentially market your business, control who sees your information, and drive your deal to close. All for a simple monthly listing fee. No success fees, ever.
                </p>
            </div>
        </section>
    );
}

// ==========================================
// 2. PRICING CARDS SECTION
// ==========================================

export function PricingCardsSection() {
    const plans = [
        {
            title: 'Free',
            badge: 'COMING SOON',
            subtitle: 'For Sellers Wanting To Engage Potential Buyers Without Listing.',
            hasPrice: false,
            bgClass: 'bg-blue-free', 
            isDisabled: true,
            style: { background: 'linear-gradient(90deg, #4F93FF26 15%, #4f92ff06 100%)', border: '1px solid #E5E8F6' },
            titleColor: 'text-title-blue',
            btnLabel: 'Coming Soon',
            btnClass: 'bg-blue-color',
            dividerColor: 'border-blue-line',
            featuresHeader: null,
            features: [
                'Save Favorites',
                'View Previous Listings',
                'Confidential Profile',
                'Connect With Listers',
                'Dashboard Statistics',
                'Engage With Buyers'
            ]
        },
        {
            title: 'Seller Basic',
            badge: 'LAUNCH OFFER — LIMITED TIME',
            subtitle: 'For Sellers Ready To List.',
            hasPrice: true,
            bgClass: 'bg-green-basic',
            oldPrice: '$30',
            currentPrice: '$15',
            style: { background: 'linear-gradient(0deg, #28C76F26 15%, #28c76f0b 100%)', border: '1px solid #E5E8F6' },
            titleColor: 'text-title-green',
            btnLabel: 'Sign Up',
            btnClass: 'bg-green-color',
            dividerColor: 'border-blue-line',
            featuresHeader: 'Everything In Basic, Plus:',
            features: [
                'Public Listing',
                'Confidential Form',
                'Manage Listing',
                'Listing Statistics',
                'Listing Notifications',
                'Cancel Anytime',
                'Monthly Listing Renewals'
            ]
        },
        {
            title: 'Seller Central',
            badge: 'LAUNCH OFFER — LIMITED TIME',
            subtitle: 'For Active Deals And Serious Sellers.',
            hasPrice: true,
            bgClass: 'bg-amber-central',
            oldPrice: '$60',
            currentPrice: '$30',
            style: { background: 'linear-gradient(270deg, #ffb30033 15%, #FFB10000 100%)', border: '1px solid #E5E8F6' },
            titleColor: 'text-title-amber',
            btnLabel: 'Sign Up',
            btnClass: 'bg-amber-color',
            dividerColor: 'border-blue-line',
            featuresHeader: 'Everything In Standard, Plus:',
            features: [
                'Buyer Profile Reviews',
                'Buyer Submissions',
                'Manage NDA Requests',
                'Analyze Buyers',
                'Document Room',
                'Manage Multiple Listings',
                'Invite Your Team',
                'No Success Fees',
                'And More...'
            ]
        }
    ];
     const handleSignupClick = () => {
    const signupBtn = document.querySelector(".signup-btn");
    if (signupBtn) {
      signupBtn.click();
    }
  };

    return (
        <section className="PricingCards__wrapper">
            {/* Header section from Seller Page.jpg */}
            <div className="Hero__header text-center">
                <h2 className="hero__heading_text">For Sellers</h2>
            </div>

            {/* Main structural wrapper with your custom CSS class name */}
            <div className="PricingCards__container seller-pricing-cards">
                {plans.map((plan, index) => (
                    <div 
                        key={index} 
                        className={`PricingCard col-12 md:col p-5 border-round-lg shadow-1 flex flex-column justify-content-between ${plan.bgClass}`}
                        style={plan.style}
                    >
                        <div className="PricingCard__content">
                            <div className="PricingCard__header">
                                {/* Title styled with dynamic text colors */}
                            <h3 className={` ${plan.titleColor}`}>
                                {plan.title}
                            </h3>
                            
                            {/* Subtitle / Badge text */}
                            <div className="PricingCard__subtitle ">
                                {plan.badge}
                            </div>
                            
                            {/* Pricing layout block */}
                            <div className="PricingCard__price ">
                                {plan.hasPrice && (
                                    <strike className={`PricingCard__original-price  ${plan.titleColor}-price`}>
                                        {plan.oldPrice}
                                    </strike>
                                )}
                                <strong className={`PricingCard__discounted-price  ${plan.titleColor}-price`}>
                                    {plan.currentPrice}
                                </strong>
                                {plan.currentPrice && 
                                    <span className="currency-label-price">
                                    / month / listing
                                    </span>
                                
                                }
                            </div>
                            
                            {/* Card Description mapping */}
                            <div className="PricingCard__description ">
                                {plan.subtitle}
                            </div>
                            </div>
                            
                            
                            {/* Pure layout accent divider split line */}
                            <div className={`border-bottom-1 ${plan.dividerColor}`}></div>
                            
                            {/* Dynamic feature list iteration matching target classes */}
                            <ul className="PricingCard__features features__seller">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="PricingCard__feature_list">
                                        <span className="text-green">✔</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Interactive CTA buttons mapping target logic states */}
                        <div className="btn-wrap">
                            <Button 
                                label={plan.btnLabel} 
                                disabled={plan.isDisabled} 
                                className={`PricingCard__cta-${plan.btnClass}-btn`} 
                                onClick={handleSignupClick}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
// ==========================================
// 3. COMPARISON TABLE SECTION
// ==========================================
function ComparisonTableSection() {
   const categories = [
        {
            name: 'Account & Discovery',
            features: [
                { name: 'Save Favorites', free: true, basic: true, central: true },
                { name: 'Previously Viewed Listings', free: true, basic: true, central: true },
                { name: 'Confidential Profile', free: true, basic: true, central: true },
                { name: 'Dashboard Statistics', free: true, basic: true, central: true }
            ]
        },
        {
            name: 'Listing & Marketing',
            features: [
                { name: 'Public Listing', free: false, basic: true, central: true },
                { name: 'Confidential Listing', free: false, basic: true, central: true },
                { name: 'Confidential Submissions', free: false, basic: true, central: true },
                { name: 'Manage Listing', free: false, basic: true, central: true },
                { name: 'Listing Statistics', free: false, basic: true, central: true },
                { name: 'Listing Notifications', free: false, basic: true, central: true },
                { name: 'Listing Inquiries Via Form', free: false, basic: true, central: true },
                { name: 'Add Unlimited Listings (Each At A Fee)', free: false, basic: true, central: true },
                { name: 'Monthly Listing Renewals', free: false, basic: true, central: true }
            ]
        },
        {
            name: 'Deal Room & Buyer Management',
            features: [
                { name: 'Add CIM (Confidential Information Memorandum)', free: false, basic: false, central: true },
                { name: 'Add Supporting Documents', free: false, basic: false, central: true },
                { name: 'Document Management Room', free: false, basic: false, central: true },
                { name: 'Due Diligence List', free: false, basic: false, central: true },
                { name: 'NDA Signing & Countersignature', free: false, basic: false, central: true },
                { name: 'NDA Management', free: false, basic: false, central: true },
                { name: 'Buyer Profile Reviews', free: false, basic: false, central: true },
                { name: 'Manage Buyer Access Per Listing', free: false, basic: false, central: true },
                { name: 'Invite Team To Deal Room', free: false, basic: false, central: true }
            ]
        },
        {
            name: 'Broker Profile',
            features: [
                { name: 'Manage A Broker Profile*', free: false, basic: false, central: true },
                { name: 'Find An Expert*', free: false, basic: false, central: true }
            ]
        }
    ];

    return (
        <div className="CompareContainer">
            {/* Title Section */}
            <div className="CompareHeader">
                <h2 className="CompareHeader__title">Compare Selling Features</h2>
                <p className="CompareHeader__subtitle">A Side-By-Side Look At The Selling Tools Included In Each Plan.</p>
            </div>

            {/* Main Table Card Wrapper */}
            <div className="CompareGridCard">
                
                {/* Fixed Column Top Header */}
                <div className="CompareRow CompareRow--header">
                    <div className="CompareRow__col CompareRow__col--feature">Selling Feature</div>
                    <div className="CompareRow__col CompareRow__col--tier">Free (Coming)</div>
                    <div className="CompareRow__col CompareRow__col--tier">Seller Basic</div>
                    <div className="CompareRow__col CompareRow__col--tier">Seller Central</div>
                </div>

                {/* Looping Category Blocks */}
                {categories.map((cat, catIdx) => (
                    <div key={catIdx} className="CompareCategoryGroup">
                        {/* Subheader Title Banner */}
                        <div className="CompareCategoryRow">
                            {cat.name}
                        </div>

                        {/* Individual Rows under this Category */}
                        {cat.features.map((feat, featIdx) => (
                            <div key={featIdx} className="CompareRow CompareRow--body">
                                <div className="CompareRow__col CompareRow__col--feature">{feat.name}</div>
                                
                                <div className="CompareRow__col CompareRow__col--status">
                                    {feat.free ? <span className="status-check">✓</span> : <span className="status-dash">—</span>}
                                </div>
                                <div className="CompareRow__col CompareRow__col--status">
                                    {feat.basic ? <span className="status-check">✓</span> : <span className="status-dash">—</span>}
                                </div>
                                <div className="CompareRow__col CompareRow__col--status">
                                    {feat.central ? <span className="status-check">✓</span> : <span className="status-dash">—</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                {/* Disclaimer Footnote text row */}
                <div className="CompareFooterDisclaimer">
                    * Only Available To Brokers, Not Individual Sellers. Basic Selling Tools Are Coming Soon. Sellers Can List Today With Standard Or Premium.
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 4. DETAILED FEATURE BREAKDOWN SECTION
// ==========================================
function FeatureDetailsSection() {
    return (
       <div className="FeatureDetailsConfidentials">
            {/* Component Main Heading Container */}
            <div className="FeatureDetails__header">
                <h2 className="FeatureDetails__title">Selling Tools In Detail</h2>
            </div>

            {/* Feature Block 1: Confidential Listings (Text Left, Image Right) */}
            <div className="FeatureBlock">
                <div className="FeatureBlock__content">
                    <h3 className="FeatureBlock__heading">Confidential Listings</h3>
                    <p className="FeatureBlock__description">
                        Market Your Business Without Revealing Its Identity. Create A 
                        Public Listing That Attracts Qualified Buyers While Keeping 
                        Your Details Confidential And Accept Buyer Submissions 
                        Privately. You Control What Is Shown And To Whom. You Can 
                        Receive Buyer Notifications In Two Ways (Confidential Web 
                        Form Or Confidential Buyer Submissions. Either Way, You 
                        Control How Much Information Is Shared With Buyers.)
                    </p>
                    <p className="FeatureBlock__note">
                        Note: We Strongly Recommend Sellers Keep Their Contact 
                        Information Private To Protect Confidentiality.
                    </p>
                </div>
                <div className="FeatureBlock__media">
                    {/* Replace source with your actual dashboard snapshot assets */}
                    <img 
                        src={ListingDashboardPreview} 
                        alt="My Listing Dashboard Interface Preview" 
                        className="FeatureBlock__image"
                    />
                </div>
            </div>

            {/* Feature Block 2: NDA Management (Image Left, Text Right - Handled via reverse flex class) */}
            <div className="FeatureBlock FeatureBlock--reverse">
                <div className="FeatureBlock__content">
                    <h3 className="FeatureBlock__heading">NDA Management</h3>
                    <p className="FeatureBlock__description">
                        Exit Ramp's Platform Makes It Easy To Manage NDAs. Buyers 
                        Submit Their Interest From Their Dashboard, Sign, And You 
                        Countersign. Only Then Do They Gain Access To Your CIM. You 
                        Control Access And Can Restrict Any Buyer At Any Time. A 
                        Copy Of Every Executed NDA Is Provided To Both Seller And 
                        Buyer, And Confidentiality Is Maintained Throughout.
                    </p>
                </div>
                <div className="FeatureBlock__media">
                    <img 
                        src={NDARequestsTablePreview} 
                        alt="NDA Pipeline Interface Table Preview" 
                        className="FeatureBlock__image"
                    />
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 5. BROKER ADVISORY / FOOTER PROMO
// ==========================================
function BrokerAdvisorySection() {
    return (
        <div className="whouse_sec_wrap_container broker-advisory-section">
        <div className="whouse_sec_content_wrap">
          <div className="whouse_sec_content_first">
            <div className="whouse_sec_content_text_box">
              <h3>Confidential Information Memorandum (CIM)</h3>
              <p>
                As a seller or broker, post your CIM confidentially. Each listing can carry a CIM that is shared with a potential buyer only after a mutual NDA is signed and you have reviewed the buyer’s profile and granted access. Upload key supporting documents alongside it, provide initial access to the document management room when you see fit, and remove access to the CIM at any time.
              </p>
            </div>
            <div className="whouse_sec_content_image_box">
              <img src={BuyerImg} alt="BuyerImg" />
            </div>
          </div>
          <div className="whouse_sec_content_second">
            <div className="whouse_sec_content_text_box">
              <h3>Buyer Profile Reviews</h3>
              <p>
                Learn about a buyer before granting access to your CIM. Click a buyer’s name to view their Buyer Information and understand whether they are prepared to commit to the deal and whether they have the financial means to close, so you only engage with serious, qualified buyers.
              </p>
            </div>
            <div className="whouse_sec_content_image_box">
              <img src={SellerControl} alt="SellerControl" />
            </div>
          </div>
          <div className="whouse_sec_content_third man-expert">
            <div className="whouse_sec_content_text_box">
              <h3>Document Management Room</h3>
              <p>
                Organize and share the documents your deal requires in a secure room. Grant initial access to invited buyers, add supporting materials, and keep everything in one place as you move from interest to close.
              </p>
            </div>
            <div className="whouse_sec_content_image_box">
              <img src={StandOut} alt="SellerControl" />
            </div>
          </div>
        </div>
      </div>
    );
}



// ==========================================
// 4. DETAILED FEATURE BREAKDOWN SECTION
// ==========================================
function FeatureTeamDetailsSection() {
    return (
       <div className="FeatureDetailsConfidentials">
            

            {/* Feature Block 1: Confidential Listings (Text Left, Image Right) */}
            <div className="FeatureBlock">
                <div className="FeatureBlock__content">
                    <h3 className="FeatureBlock__heading">Due Diligence List</h3>
                    <p className="FeatureBlock__description">
                        Maintain a due diligence list tied to your specific deal. Track status and communicate directly with your buyer. Keep diligence moving and transparent for both sides from a single shared view.
                    </p>
                </div>
                <div className="FeatureBlock__media">
                    {/* Replace source with your actual dashboard snapshot assets */}
                    <img 
                        src={DueDeligence} 
                        alt="My Listing Dashboard Interface Preview" 
                        className="FeatureBlock__image"
                    />
                </div>
            </div>

            {/* Feature Block 2: NDA Management (Image Left, Text Right - Handled via reverse flex class) */}
            <div className="FeatureBlock FeatureBlock--reverse">
                <div className="FeatureBlock__content">
                    <h3 className="FeatureBlock__heading">Invite Your Team</h3>
                    <p className="FeatureBlock__description">
                        Bring your team into the deal. From Invite Team, add an advisor, staff member, external consultant, or any other participant so everyone working on the transaction can collaborate in the deal room.
                    </p>
                </div>
                <div className="FeatureBlock__media">
                    <img 
                        src={InviteTeam} 
                        alt="NDA Pipeline Interface Table Preview" 
                        className="FeatureBlock__image"
                    />
                </div>
            </div>
        </div>
    );
}

 function BrokerDirectory() {
    return (
        <div className="BrokerDirectory">
            <div className="BrokerDirectory__inner">
                {/* Section Headings */}
                <h2 className="BrokerDirectory__title">Broker Directory</h2>
                <p className="BrokerDirectory__description">
                    Brokers Can Maintain A Public Profile That Is Used To Share Contact Information On Each Listing. Every Broker Who Lists On Exit 
                    Ramp Will Also Be Included In Our Broker Listing. Sellers Do Not Have Profiles But May Optionally Share Contact Information Per 
                    Listing, Though We Highly Recommend Keeping It Private To Preserve Confidentiality.
                </p>

                {/* Main Media Showcase Container */}
                <div className="BrokerDirectory__media-container">
                    <img 
                         src={brokerDirectory} 
                        alt="Brokers reviewing data charts around a table" 
                        className="BrokerDirectory__image"
                    />
                </div>
            </div>
        </div>
    );
}