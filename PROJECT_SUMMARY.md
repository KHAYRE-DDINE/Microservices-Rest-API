# Affiliate Platform - Complete Technical & Business Guide

## 1. Executive Summary
The **Affiliate Platform** is an enterprise-grade distributed system designed to manage the full lifecycle of affiliate marketing. From onboarding partners to tracking sales and executing payments, the platform uses a **Microservices Architecture** to ensure scalability, resilience, and high performance.

---

## 2. Technical Architecture & Tech Stack

### High-Level Architecture
- **Microservices:** 5 independent backend services built with **Spring Boot**.
- **Frontend:** A modern **Next.js 16** application with React 19.
- **Communication:** Synchronous **REST** for data validation and **WebSockets** for real-time UI updates.
- **Data:** **Database-per-Service** using MySQL 8.0 to ensure zero data coupling.
- **Infrastructure:** Fully containerized with **Docker** and **Docker Compose**.

### Technology Stack
| Layer | Technologies |
| :--- | :--- |
| **Backend** | Spring Boot 3.4.2, Java 17, Spring Data JPA, Hibernate, Lombok |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Lucide Icons |
| **Messaging** | STOMP / WebSockets (for live dashboard updates) |
| **Database** | MySQL 8.0 (Logical isolation per service) |
| **DevOps** | Docker, Docker Compose, PowerShell Test Suites |

---

## 3. Microservices API Reference

| Service | Port | Base Path | Description |
| :--- | :--- | :--- | :--- |
| **Affiliate Service** | 8081 | `/api/affiliate` | Manage affiliate profiles and statuses. |
| **Campaign Service** | 8082 | `/api/campaigns` | Manage marketing offers and commission rates. |
| **Conversion Service** | 8083 | `/api/conversions` | Record and validate sales events. |
| **Payment Service** | 8084 | `/api/payments` | Process payouts and manage financial status. |
| **Product Service** | 8085 | `/api/products` | Catalog of promoted items linked to campaigns. |

---

## 4. Internal Service Architecture (N-Tier Pattern)
Each microservice follows a standardized layered design to maintain a clean separation of concerns:

1.  **Controller Layer (`/controller`):** Handles incoming HTTP requests, performs input validation, and manages REST status codes.
2.  **Service Layer (`/service`):** The core business engine. This is where rules (like commission calculation) and cross-service orchestrations live.
3.  **Repository Layer (`/repository`):** Powered by Spring Data JPA. It abstracts all database interactions into simple Java methods.
4.  **Model/Entity Layer (`/model`):** Represents the data schema. Entities use JPA annotations to define constraints and indexes.
5.  **DTO Layer (`/service/dto`):** Data Transfer Objects. These ensure that internal database structures are never directly exposed to the API, protecting the system from breaking changes.

### Centralized Error Handling
All services use `@RestControllerAdvice` (e.g., `GlobalExceptionHandler`) to provide consistent error responses across the platform. This ensures that the frontend always receives a structured JSON error (including timestamps and specific field errors) regardless of which service failed.

---

## 5. End-to-End Business Workflow

The platform manages a sequential flow of data across multiple services. Below is the lifecycle from partner onboarding to payout:

### Phase 1: Onboarding (Affiliate & Product)
1.  **Affiliate Creation:** The `affiliate-service` registers a new partner, storing their contact info, website, and active status.
2.  **Product Creation:** The `product-service` catalogs items for promotion, including SKU, price, and category.

### Phase 2: Setup (Campaign)
3.  **Campaign Creation:** An affiliate is linked to a specific offer in the `campaign-service`. This defines the **Commission Rate** (e.g., 5%) and the active date range.

### Phase 3: Action (Conversion)
4.  **Conversion Recording:** When a sale occurs, the `conversion-service` performs a "Triple Validation":
    - Calls `affiliate-service` to ensure the partner is active.
    - Calls `campaign-service` to verify the campaign is valid.
    - Calls `product-service` to confirm the product exists.
5.  **Commission Calculation:** Once validated, the service calculates the specific commission for that sale and records it as `COMPLETED`.

### Phase 4: Settlement (Payment)
6.  **Payment Initiation:** The `payment-gateway-service` is triggered to pay out the affiliate.
7.  **Safety Check:** It verifies **Idempotency** (preventing double payments) and re-validates the affiliate/campaign.
8.  **Gateway Execution:** The system interacts with an external gateway (like PayPal).
9.  **Real-Time Update:** Upon success, a **WebSocket** notification is pushed to the frontend dashboard.

---

## 6. Detailed Process Logic

### 💳 Payment & Conversion Logic
- **Precision:** All financial values use `BigDecimal` to prevent the rounding errors common with floating-point numbers.
- **Idempotency:** Every payment request requires a unique `idempotencyKey`. If the system sees the same key twice, it rejects the second request to protect your funds.
- **State Machine:** Payments transition through `PENDING` → `PROCESSING` → `COMPLETED` or `FAILED`.

### 🔗 Relationship Management
In this architecture, services are **loosely coupled**. Instead of database-level foreign keys, we use **Shared Identity via IDs**.
- A `Payment` doesn't contain an `Affiliate` object; it contains an `affiliateId`.
- This allows you to upgrade or restart the `Affiliate Service` without affecting the `Payment Service` database.

---

## 7. Real-time Communication (WebSockets)
The platform features a "Live Feed" in the dashboard powered by **STOMP over WebSockets**.

- **Backend:** When a payment or conversion status changes, the service broadcasts a message to a specific topic (e.g., `/topic/payments`).
- **Frontend:** The Next.js dashboard maintains a persistent connection via `@stomp/stompjs`. When a message arrives, it updates the "Total Processed" counters and the "Live Feed" list instantly without a page refresh.
- **Resilience:** If the WebSocket connection drops, the frontend automatically falls back to fetching historical data via REST when reconnected.

---

## 8. Setup & Running the Platform

### Prerequisites
- Docker & Docker Compose
- Java 17+ (for local development)
- Node.js 18+ (for local frontend development)

### One-Command Startup
To spin up the entire ecosystem (Databases, 5 Services, and Frontend):
```powershell
docker-compose up --build
```

### Automated Testing
The system includes a comprehensive PowerShell test suite located at `backend/test-all.ps1`. This script validates the entire end-to-end flow across all services:
```powershell
./backend/test-all.ps1
```

---

## 9. Infrastructure & Data Integrity
- **Docker Compose:** Orchestrates 5 services, 1 frontend, and 1 MySQL instance with 5 logical databases.
- **Health Checks:** The system is configured to wait until the MySQL database is fully "healthy" before starting the Java services, preventing boot-up crashes.
- **Indexing:** Frequently queried fields (like `affiliate_id` and `status`) are indexed at the database level for sub-millisecond response times.





Affiliate Platform - Detailed Project Description
1. Executive Summary
The Affiliate Platform is a robust, enterprise-grade distributed system designed to manage affiliate marketing campaigns, track conversions, and handle payments. Built with a Microservices Architecture, it ensures high scalability, fault tolerance, and independent service evolution.

2. Technical Architecture
Architecture Pattern
Microservices Architecture: 5 independent backend services.
Database-per-Service: Each service manages its own MySQL database to ensure data isolation.
RESTful APIs: Inter-service and client-service communication via HTTP/REST.
Real-time Updates: WebSocket integration for live dashboard notifications.
Containerization: Orchestrated using Docker and Docker Compose for consistent development and deployment environments.
Technology Stack
Layer	Technologies
Backend	Spring Boot 3.4.2, Java 17, Spring Data JPA, Lombok, Hibernate
Frontend	Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Lucide React
Database	MySQL 8.0, H2 (for testing)
Messaging	STOMP/WebSocket (Real-time updates)
Infrastructure	Docker, Docker Compose
3. Microservices Breakdown
🟢 Affiliate Service (affiliate-service)
Port: 8081
Role: Centralized management of affiliate identities.
Entities: Affiliate (Name, Email, Phone, Website, Status).
Responsibility: Onboarding and managing the lifecycle of marketing partners.
🟢 Campaign Service (campaign-service)
Port: 8082
Role: Handles the creation and management of marketing campaigns.
Entities: Campaign (Name, Commission Rate, Start/End Dates).
Responsibility: Defining the parameters of affiliate offers.
🟢 Conversion Service (conversion-service)
Port: 8083
Role: Tracks successful sales and actions.
Entities: Conversion (Sale Amount, Commission, Status).
Status Workflow: PENDING → VALIDATED → COMPLETED.
Responsibility: Calculating commissions based on campaign rules.
🟢 Product Service (product-service)
Port: 8085
Role: Catalog management for items being promoted.
Entities: Product (Name, SKU, Price, Category).
Responsibility: Providing product details and commission percentages for specific SKUs.
🟢 Payment Gateway Service (payment-gateway-service)
Port: 8084
Role: Financial orchestration and payout processing.
Entities: Payment (Amount, Currency, Status, Idempotency Key).
Feature: Implements Idempotency Keys to prevent duplicate payments—a critical requirement for financial systems.
Real-time: Pushes payment status updates via WebSockets to the frontend.
4. Frontend Application
The frontend is a modern Next.js application located in the /frontend directory.

Key Features
Dashboard Overview: Real-time summary of active campaigns, total processed payments, and affiliate counts.
Live Feed: A WebSocket-powered activity log that shows payments and conversions as they happen.
Service Status Monitoring: Visual indicators showing whether backend microservices are reachable.
Modular Components: Built with reusable React components and styled with Tailwind CSS for a premium, responsive UI.
5. Infrastructure & Database Strategy
Docker Orchestration
The project uses docker-compose.yml to spin up:

A MySQL 8.0 container with multiple logical databases (affiliate_db, campaign_db, etc.).
Individual containers for each microservice.
A frontend container for the Next.js application.
Data Integrity
BigDecimal: Used for all financial calculations to ensure decimal precision.
Indexing: Entities are optimized with JPA indexes on frequently queried columns like affiliate_id and status.
6. Key Implementation Highlights
Distributed Identity: Each entity tracks its relationship to others via IDs (affiliateId, campaignId) rather than direct database joins, respecting microservice boundaries.
Modern React: Uses React 19 features and Next.js App Router for optimized performance and SEO.
Resilience: Health checks in Docker ensure the database is ready before services boot.
Testing: Includes a PowerShell test suite (test-all.ps1) for validating system-wide functionality.
7. Project Structure
text
affiliate-platform/
├── backend/
│   ├── affiliate-service/
│   ├── campaign-service/
│   ├── conversion-service/
│   ├── payment-gateway-service/
│   └── product-service/
├── frontend/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # Reusable UI components
│   └── lib/                # Shared utilities/types
└── docker-compose.yml      # Infrastructure orchestration









Payment Gateway Flow: PayPal Sandbox vs. Mock Credit Cards
This document outlines the detailed payment flows of the Affiliate Platform, clarifying exactly where the transactions are routed, how mock credit card payments behave, and how the official PayPal integration works.

1. Quick Summary of Behavior
Payment Method	Where details go	Real/Sandbox Charge?	Test Card / Denied scenarios supported?
PayPal Checkout	PayPal Sandbox + Local Dashboard	Yes, officially captured in PayPal Sandbox servers.	Yes. You can test with sandbox personal accounts, simulated balances, and normal PayPal test flows.
Credit Card	Local Dashboard only	No. Pure mock simulation.	No. Card details are purely decorative HTML inputs; they are not read, processed, or evaluated.
2. Detailed Technical Breakdown
💳 A. Credit Card Payments (Pure Mock Simulation)
When you choose CARD on the checkout page (checkout/page.tsx):

Decorative Inputs: The form fields for Full Name, Card Number, MM/YY, and CVC are completely static, decorative HTML input fields.
They do not have data bindings (onChange or value states), meaning the React app does not read what you type.
Instant Mock Execution: When you click the Pay button, the handler handleCardPayment is triggered:
typescript
const txId = await recordFullTransaction("CREDIT_CARD", "MOCK-TX-" + Date.now());
It bypasses any external API or validation, immediately assigning a dummy reference ID (MOCK-TX-[timestamp]).
Local Database Synchronization: The transaction details sent to the backend /api/payments endpoint contain only metadata:
paymentMethod: "CREDIT_CARD"
gatewayReference: "MOCK-TX-[timestamp]"
No card details are sent.
Backend Handling: The backend PaymentService processes the request:
It verifies the idempotencyKey.
It asks PaymentProviderService to check if a PayPal connection is alive (using paypalClient.getAccessToken()) just as a system sanity check.
If the system is up, it saves the transaction status as COMPLETED in the local MySQL database.
It broadcasts a WebSocket notification to update the local affiliate dashboard instantly.
IMPORTANT

Conclusion for Cards: Credit card details are never sent to PayPal or any external gateway. They are purely simulated locally. There are no test card validation sequences or card denial tests, and the transactions exist only inside your local dashboard database.

🗳️ B. PayPal Payments (Real Sandbox Integration)
When you choose PayPal Checkout on the checkout page:

Official SDK Rendering: The frontend uses @paypal/react-paypal-js to render the official PayPal buttons directly connected to your configured Client ID.
Direct PayPal Capture: When a user completes the payment authorization through the official PayPal login popup:
The PayPal Javascript SDK contacts PayPal servers directly to capture the funds.
PayPal captures the payment and returns a real capture.id.
Backend Sync: The frontend submits this real capture.id to the backend:
typescript
const txId = await recordFullTransaction("PAYPAL", capture.id);
Webhook Support: Additionally, the backend has a webhook handler (/api/payments/webhook) in PaymentController.java to listen for notifications like PAYMENT.CAPTURE.COMPLETED directly from PayPal. When it receives the webhook, it updates the payment state in the MySQL database.
TIP

Conclusion for PayPal: This is a fully functional PayPal Sandbox integration. This is why all simulated PayPal sandbox payments show up in your PayPal Developer Test Business Account -> Transactions section.

3. Visual Flow Diagram
Below is the execution flow demonstrating how both pathways differ in routing transaction data:

PayPal Sandbox API
Local MySQL DB
Payment Gateway Service
Next.js Checkout Page
PayPal Sandbox API
Local MySQL DB
Payment Gateway Service
Next.js Checkout Page
Transaction recorded in your PayPal Sandbox Developer dashboard!
Card data is not captured or read!
Transaction recorded only in local microservice database!
alt
[User Chooses PayPal Checkout]
[User Chooses Credit Card]
Buyer
Click PayPal Button & Login
1
Request checkout authorization (Client ID)
2
Return Capture ID (Success)
3
Post to /api/payments (paymentMethod: PAYPAL, gatewayReference: capture.id)
4
Save payment status as COMPLETED
5
Return complete payment payload
6
Fills card form & Click Pay
7
Generate MOCK-TX-[timestamp]
8
Post to /api/payments (paymentMethod: CREDIT_CARD, gatewayReference: MOCK-TX-...)
9
Sanity Check (getAccessToken)
10
Access Token acquired
11
Save payment status as COMPLETED
12
Return complete payment payload
13
Buyer
4. Recommendations for Testing Denied Cards & Mock Gateway Payments
If you want to support real credit card payments or test denied card scenarios, you can select one of the following approaches:

Option A: Integrate PayPal Advanced Credit Cards (Card Fields)
PayPal supports hosted credit card fields inside their sandbox. This allows you to collect card numbers directly and process them through PayPal.

Under this approach, you can use PayPal Test Cards (e.g., standard visa test numbers) or Mock Decline triggers (such as specific amount values like $100.02 to force a decline in sandbox mode).
Option B: Integrate Stripe/Mock Gateway Processor
If you want to mock credit card rejection or validation logic locally:

Define a list of test credit card numbers on the frontend or backend.
In checkout/page.tsx's card form, collect the card number and read it.
If the card number is a specific mock failure card (e.g., a card ending in 4005 for decline), return a failure error on the frontend/backend:
typescript
if (cardNumber.endsWith("4005")) {
     toast.error("Card payment declined: Insufficient funds.");
     return;
 }
5. Webhook Double Events & Sandbox Decline Simulation
🔄 A. The Double Webhook Event Phenomenon
When a buyer completes a transaction, you will see two webhook events in your PayPal Developer Portal:

CHECKOUT.ORDER.APPROVED (Resource ID: Order ID) — Fired when the buyer enters credentials and clicks "Approve".
PAYMENT.CAPTURE.COMPLETED (Resource ID: Capture ID) — Fired a second later when the frontend executes actions.order.capture() to finalize and capture the funds.
NOTE

No Duplicate DB Records: This is normal PayPal lifecycle design. The frontend records the transaction under the Capture ID (Transaction ID). When the two webhooks arrive, the backend controller handles them safely, only matching and updating the single transaction record in your MySQL database. No duplicate payments are created.

🧪 B. Why Sandbox Accepts Declined/Failed Cards by Default
In the PayPal Sandbox, all payments succeed by default (even dummy card numbers, bad CVVs, or simulated 3D Secure failures). This is designed by PayPal to allow quick "happy path" integration testing.

To simulate declines, rejections, and failed 3D Secure transactions, you must enable Negative Testing for your merchant account.

🛠️ C. How to Configure & Test Real Rejections in Sandbox
Follow these exact steps to enable rejections in sandbox mode:

Step 1: Enable Negative Testing in PayPal
Log in to the PayPal Developer Dashboard.
Navigate to Testing Tools ➡️ Sandbox Accounts.
Locate your Business Merchant Account (the business email matching your clientId).
Click the three dots ... next to it and select View/Edit Account.
Switch to the Settings tab.
Toggle Negative Testing to On.
Step 2: Trigger a Card Decline (INSTRUMENT_DECLINED)
Once Negative Testing is enabled:

Go to the checkout page on your app and choose CARD checkout.
Enter the standard Sandbox Visa: 4111 1111 1111 1111.
In the First Name or Cardholder Name field, type INSTRUMENT_DECLINED exactly.
Click Pay.
The Result: PayPal Sandbox will artificially decline the card. You will see a warning toast on your frontend: "Payment declined. Please try a different card.", and the form will automatically reset to let you try again.
Step 3: Trigger a 3D Secure / Authentication Failure
To test failed 3D Secure card flows:

Ensure Negative Testing is enabled.
When completing checkout with a 3D Secure test card, select Fail Authentication on the simulated 3D Secure bank page popup.
Our frontend's onError callback will safely catch the failure, display an error toast, and reset the checkout buttons to their normal state.





1. Webhook Status = Delivery Status (Not Payment Status)
The "Success" column in the PayPal Developer Dashboard does not mean the customer successfully paid.

Instead, it means Webhook Delivery Success.

It means: "PayPal successfully sent the notification packet to your server's webhook endpoint (/api/payments/webhook), and your server responded back with 200 OK (meaning it received it safely)."
Even if the event is a decline (like PAYMENT.CAPTURE.DECLINED), the act of PayPal telling your server about the decline was completed successfully.

2. What it looks like under different scenarios:
Payment Result	Webhook Event Type	Webhook Delivery Status	What it means
Card Approved	PAYMENT.CAPTURE.COMPLETED	Success	Payment succeeded, and your server got the notification successfully.
Card Declined	PAYMENT.CAPTURE.DECLINED	Success	Card was declined, and your server got the notification about the decline successfully.
Server Offline	Any Event	Failed / Pending	The payment happened or failed, but PayPal could not reach your server (your server did not reply with 200 OK)