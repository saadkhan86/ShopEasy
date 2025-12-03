import React from "react";
import { Link } from "react-router-dom";
import styles from "./About.module.css";

function About() {
  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h1 className={styles.title}>About ShopEasy</h1>
        <p className={styles.text}>
          ShopEasy is your premier destination for seamless online shopping. We
          combine cutting-edge e-commerce technology with a user-friendly
          experience to bring you the best products at unbeatable prices. Our
          mission is to make shopping easy, enjoyable, and accessible for
          everyone.
        </p>

        <div className={styles.meaning}>
          <div className={styles.meaningTitle}>The Meaning Behind ShopEasy</div>
          <p className={styles.meaningText}>
            <strong>Shop</strong> represents our commitment to providing quality
            products across various categories. <strong>Easy</strong> symbolizes
            our dedication to creating a hassle-free shopping experience with
            intuitive navigation, secure payments, and reliable delivery.
            Together, <strong>ShopEasy</strong> embodies our promise to make
            online shopping simple, safe, and satisfying.
          </p>
        </div>

        <h2 className={styles.subtitle}>What We Offer</h2>
        <ul className={styles.list}>
          <li>Wide range of quality products across multiple categories</li>
          <li>Secure payment gateway with multiple payment options</li>
          <li>Fast and reliable delivery with real-time tracking</li>
          <li>24/7 customer support and easy returns policy</li>
          <li>Personalized recommendations based on your preferences</li>
        </ul>

        <h2 className={styles.subtitle}>Our Vision</h2>
        <p className={styles.text}>
          At ShopEasy, we envision a world where online shopping is effortless,
          trustworthy, and delightful for everyone. We're committed to building
          a platform that not only connects buyers with quality products but
          also creates a community where shopping becomes an enjoyable
          experience. Our goal is to be your go-to destination for all your
          shopping needs.
        </p>

        <h2 className={styles.subtitle}>Technology & Innovation</h2>
        <p className={styles.text}>
          Powered by modern web technologies, ShopEasy offers a smooth, secure,
          and responsive shopping experience. Our platform features robust
          backend infrastructure, advanced search algorithms, and a beautifully
          designed interface that works flawlessly across all devices. We
          continuously innovate to enhance your shopping journey.
        </p>

        <h2 className={styles.subtitle}>Our Commitment</h2>
        <p className={styles.text}>
          We are dedicated to maintaining the highest standards of quality,
          security, and customer satisfaction. Your privacy is our priority, and
          we implement industry-leading security measures to protect your data.
          We believe in transparent pricing, honest product descriptions, and
          building lasting relationships with our customers.
        </p>

        <div className={styles.termsLink}>
          <Link to="/terms">
            <i className="fa-solid fa-scale-balanced"></i>
            Read Our Terms & Conditions
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;
