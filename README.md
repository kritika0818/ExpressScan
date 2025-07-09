# 🛒 ExpressScan – A Scan & Go Self-Checkout App for Smart Retail

> Built for Walmart Sparkathon 2025  

---

## 📱 What is ExpressScan?

**ExpressScan** is a fully functional self-checkout mobile app that enables customers to:

- **Enter the store using OTP verification**
- **Scan items with barcodes**
- **Apply combo and threshold offers**
- **Pay using a simulated payment gateway**
- **Reorder past purchases**
- **Explore the store in 3D**

It replicates the in-store experience **digitally**, empowering customers to skip checkout queues and enjoy a seamless, modern shopping journey.

---

## 🚀 Live Features (All Functional)

| Feature | Status | Description |
|--------|--------|-------------|
| 🔐 OTP Login & Gate Entry | ✅ Working | Custom Firestore-based OTP flow with resend + expiry |
| 🏪 3D Store Walkthrough | ✅ Working | Embedded interactive 3D model for store navigation |
| 📦 Cart & Barcode Scan | ✅ Working | Hosted scanner integration to add items in cart |
| 🎁 Smart Offers System | ✅ Working | Combo offers, threshold discounts, item-based offers |
| 🧾 Payment Flow | ✅ Working | Applies discounts and simulates UPI payment |
| 👤 Profile Screen | ✅ Working | Avatar change, phone number, logout |
| 📜 Order History | ✅ Working | Reorder any previous purchase with one tap |

---

## 🧠 Key Design Decisions

### ✅ Simple UI for All Ages
The app intentionally uses a **minimal, accessible design** so that **every age group** can use it easily without confusion.

### ✅ Real MVP, Not a Mockup
Every feature is fully functional — not a static placeholder. All data is dynamic, powered by Firebase Firestore.

### ✅ Fast Hosted Tools
We hosted our:
- Barcode scanner: [Scan Page](https://kritika0818.github.io/scan-page/)
- 3D store: [Store Map](https://kritika0818.github.io/expressscan-store-map/)

These tools are embedded via WebView to ensure fast performance without bloating the app.

---

## ⚙️ Tech Stack

- **React Native + Expo Go**
- **Firebase Firestore** (OTP, cart, offers, users, orders)
- **AsyncStorage** (for auth persistence)
- **WebView** (for scanner + 3D view)
- **Custom QR + OTP logic** (Firestore-based, no Firebase Auth)
- **GitHub Pages** (for hosted tools)

---

## 🧪 Screens Overview

- `LoginScreen.js` – OTP login + resend + expiry
- `HomeScreen.js` – Greeting + mode selection
- `EntryGateScreen.js` – OTP verification on entry
- `HomeTab.js` – Bottom navigation
  - `HomeTabHomeScreen.js` – 3D store map
  - `OffersScreen.js` – Offer list with real-time application
  - `CartScreen.js` – Cart, barcode scan, offer-aware totals
  - `ProfileScreen.js` – Avatar, phone, logout
- `PaymentScreen.js` – Simulated payment screen
- `OutScreen.js` – Exit OTP verification
- `OrderHistoryScreen.js` – Reorder any past order

---

## 📸 Screenshots / Demo Video

> 📹 [COMING SOON] — A full walkthrough video showing login, scanning, offer application, payment, and 3D store experience.

---

## 🧑‍⚖️ Highlights 

- 🔒 **Secure and Smart OTP**: Custom-built OTP flow using Firestore — avoids reCAPTCHA or SMS cost.
- 🧠 **Real Retail Logic**: Discounts, combo rules, and reorder flows aren’t simulated — they work.
- 🌐 **3D Store Immersion**: A mobile-ready 3D experience shows future-forward retail vision.
- 💡 **All Features Are Real**: Nothing is hardcoded or fake — even the "Pay" button applies discounts properly.

---

## 🧹 Future Improvements

- Integrate Razorpay or PhonePe for real payment
- Add real-time aisle mapping in 3D model
- Push notifications for offers
- Personalized recommendations

---

## 📂 Folder Structure

/screens/

├── LoginScreen.js

├── HomeScreen.js

├── HomeTab.js

│ /Tabs/

│ ├── CartScreen.js
  
│ ├── OffersScreen.js
  
│ ├── ProfileScreen.js

│ ├── HomeTabHomeScreen.js
  
├── PaymentScreen.js

├── OrderHistoryScreen.js

