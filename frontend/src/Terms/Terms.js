import React from "react";
// import { Link} from "react-router-dom";
import styles from "./Terms.module.css";

function Terms() {
  // const navigate = useNavigate();

  const handleAgree = () => {
   window.history.back();
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>

        <div className={styles.header}>
          <h1 className={styles.title}>ShopEasy Terms & Conditions</h1>
          <p className={styles.subtitle}>
            Please read these terms carefully before using ShopEasy services
          </p>
          <div className={styles.lastUpdated}>
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
            <p className={styles.sectionContent}>
              By accessing and using ShopEasy, you accept and agree to be bound
              by these Terms & Conditions. If you disagree with any part, you
              may not access our services.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Description of Service</h2>
            <p className={styles.sectionContent}>
              ShopEasy is an e-commerce platform that allows users to:
            </p>
            <ul className={styles.list}>
              <li>Browse and purchase products from various categories</li>
              <li>Create and manage shopping carts and wishlists</li>
              <li>Track orders with real-time updates</li>
              <li>Access customer support and return services</li>
              <li>Receive personalized product recommendations</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>3. User Accounts</h2>
            <p className={styles.sectionContent}>
              When you create an account with ShopEasy, you must provide
              accurate and complete information. You are responsible for:
            </p>
            <ul className={styles.list}>
              <li>
                Maintaining the confidentiality of your account credentials
              </li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Ensuring your account information is up-to-date</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Products and Pricing</h2>
            <p className={styles.sectionContent}>
              All products displayed on ShopEasy are subject to availability:
            </p>
            <ul className={styles.list}>
              <li>Prices are subject to change without notice</li>
              <li>Product images are for reference only</li>
              <li>We reserve the right to limit quantities</li>
              <li>All prices are in INR and inclusive of applicable taxes</li>
              <li>Shipping charges may apply based on location</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              5. Payments and Transactions
            </h2>
            <p className={styles.sectionContent}>
              ShopEasy offers multiple secure payment options:
            </p>
            <ul className={styles.list}>
              <li>Credit/Debit Cards</li>
              <li>Net Banking</li>
              <li>Digital Wallets (UPI, Paytm, etc.)</li>
              <li>Cash on Delivery (where available)</li>
            </ul>
            <p className={styles.sectionContent}>
              All transactions are secured with SSL encryption. We do not store
              your payment card details.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Shipping and Delivery</h2>
            <p className={styles.sectionContent}>
              Delivery timelines vary based on location and product
              availability:
            </p>
            <ul className={styles.list}>
              <li>Estimated delivery times are provided at checkout</li>
              <li>
                Shipping charges are calculated based on weight and destination
              </li>
              <li>
                We are not responsible for delays caused by courier partners
              </li>
              <li>International shipping may have additional customs duties</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Returns and Refunds</h2>
            <p className={styles.sectionContent}>Our return policy includes:</p>
            <ul className={styles.list}>
              <li>7-day return policy for most products</li>
              <li>Products must be in original condition with tags</li>
              <li>Refunds processed within 5-7 business days</li>
              <li>Shipping charges are non-refundable</li>
              <li>
                Digital products and personalized items are non-returnable
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>8. User Conduct</h2>
            <p className={styles.sectionContent}>
              You agree not to use ShopEasy to:
            </p>
            <ul className={styles.list}>
              <li>Violate any laws or regulations</li>
              <li>Infringe upon intellectual property rights</li>
              <li>Upload malicious content or viruses</li>
              <li>Attempt to gain unauthorized access to systems</li>
              <li>Harass other users or post inappropriate reviews</li>
              <li>Engage in fraudulent transactions</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Privacy Policy</h2>
            <p className={styles.sectionContent}>
              Your privacy is important to us. Our Privacy Policy explains how
              we collect, use, and protect your personal information. By using
              ShopEasy, you agree to our data practices as described in the
              Privacy Policy.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>10. Intellectual Property</h2>
            <p className={styles.sectionContent}>
              All content on ShopEasy, including but not limited to:
            </p>
            <ul className={styles.list}>
              <li>Website design and layout</li>
              <li>Logos, trademarks, and branding</li>
              <li>Product descriptions and images</li>
              <li>Software and application code</li>
            </ul>
            <p className={styles.sectionContent}>
              is the property of ShopEasy or its licensors and is protected by
              copyright laws.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>11. Limitation of Liability</h2>
            <p className={styles.sectionContent}>
              ShopEasy shall not be liable for any indirect, incidental,
              special, consequential or punitive damages arising from:
            </p>
            <ul className={styles.list}>
              <li>Product quality or performance issues</li>
              <li>Delivery delays or shipping problems</li>
              <li>Technical issues or website downtime</li>
              <li>Third-party service failures</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>12. Termination</h2>
            <p className={styles.sectionContent}>
              We may terminate or suspend your account immediately, without
              prior notice, for conduct that violates these Terms or is harmful
              to other users, us, or third parties.
            </p>
          </div>

          <div className={styles.highlight}>
            <strong>Important Notice:</strong>
            <p>
              ShopEasy acts as a platform connecting buyers and sellers. While
              we strive to ensure product quality and seller reliability, we are
              not directly responsible for third-party products or services.
              Please verify product details before purchasing.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>13. Changes to Terms</h2>
            <p className={styles.sectionContent}>
              We reserve the right to modify these terms at any time. We will
              notify users of significant changes by posting the updated Terms
              and Conditions on this page and updating the "Last updated" date.
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>14. Governing Law</h2>
            <p className={styles.sectionContent}>
              These Terms shall be governed by and construed in accordance with
              the laws of India. Any disputes shall be subject to the exclusive
              jurisdiction of the courts in New Delhi.
            </p>
          </div>

          <div className={styles.contact}>
            <h3 className={styles.contactTitle}>
              Questions About These Terms?
            </h3>
            <p>
              Contact us at:{" "}
              <a
                href="mailto:sk8613013@gmail.com"
                className={styles.contactEmail}
              >
                sk8613013@gmail.com
              </a>
            </p>
            <p>Customer Support: 24/7 via chat or call</p>
          </div>

          <button onClick={handleAgree} className={styles.agreeButton}>
            I Understand and Accept ShopEasy Terms
          </button>
        </div>
      </div>
    </div>
  );
}

export default Terms;
