export type LegalSection = { h: string; p?: string[]; ul?: string[] };
export type LegalDoc = { title: string; intro: string; sections: LegalSection[] };

export const en = {
  meta: {
    title: "Inzerv | Egyptian government documents, delivered",
    description:
      "Order Egyptian birth, family record and marriage documents online. Inzerv's team in Egypt handles the paperwork and delivers it to you, in Egypt or abroad.",
  },

  nav: {
    services: "Services",
    howItWorks: "How it works",
    about: "About",
    contact: "Contact",
    cta: "Start a request",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "العربية",
    languageLabel: "Switch to Arabic",
    primary: "Primary",
    skip: "Skip to content",
  },

  footer: {
    tagline: "Designed with purpose. Built on trust. Made for you.",
    explore: "Explore",
    legal: "Legal",
    contactTitle: "Contact",
    rights: "Inzerv Group for Digital Marketing & Brokerage. All rights reserved.",
    year: "2026",
    terms: "Terms of Service",
    refund: "Refund Policy",
    privacy: "Privacy Policy",
    checkout: "Place a request",
  },

  common: {
    egp: "EGP",
    perCopy: "per copy",
    startRequest: "Start a request",
    seeServices: "See all services",
    orderThis: "Order this document",
    comingSoon: "Coming soon",
    live: "Available now",
    processing: "Processing time",
    required: "Required",
    optional: "Optional",
    loading: "Loading",
  },

  app: {
    frameLabel: "Screenshot of the Inzerv app: {name}",
    note: "Screens show sample data.",
    shots: {
      home: { name: "Home", caption: "Pick a service and see your current request at a glance." },
      catalog: { name: "Documents", caption: "Three documents, each with its price and processing time." },
      details: { name: "Service details", caption: "What you need to provide, before you start." },
      track: { name: "Tracking", caption: "Every status change, with the note our team left." },
      requests: { name: "My requests", caption: "All your requests, filtered by status." },
      account: { name: "Account", caption: "Profile, support, legal pages and language in one place." },
    },
  },

  home: {
    hero: {
      title: "Get your Egyptian documents",
      titleAccent: "without flying home.",
      chipStatus: "In progress",
      chipStatusSub: "Status updates as they happen",
      chipPrice: "Price shown first",
      sub: "Order birth, family record and marriage documents online. Our team in Egypt collects them from the authorities and delivers them to your door, in Egypt or abroad.",
      primary: "Start a request",
      secondary: "How it works",
      factDocs: "{n} official documents",
      factCountries: "Delivery to {n} countries",
      factTracking: "Live order tracking",
      factLang: "Arabic and English",
    },
    showcase: {
      step: "Screens {a} and {b}",
      title: "See the app before you install it",
      sub: "Real screens from the Inzerv mobile app. The website uses the same account.",
    },
    statement: {
      text: "An official paper from Egypt should not need a relative on the phone, a trip to a government office, or a month of waiting.",
      sub: "Inzerv replaces all three with one request you can follow from your phone.",
    },
    benefits: {
      title: "What you hand over, and what you keep.",
      items: [
        {
          title: "We stand in the queue",
          text: "Our team in Egypt submits your request to the civil authorities, collects the document and checks it before it ships.",
        },
        {
          title: "You see every step",
          text: "From Request Received to Completed, the status changes on your screen and you get a notification each time.",
        },
        {
          title: "It arrives where you live",
          text: "Choose a delivery address in Egypt or in one of the supported countries. The delivery fee is shown before you pay.",
        },
      ],
    },
    services: {
      title: "Documents you can order today",
      sub: "Prices and processing times come from the live service.",
      all: "Details and required documents",
      time: "Processing",
    },
    features: {
      title: "One request, from upload to doorstep",
      sub: "The same flow works on this website and in the Inzerv mobile app, with one account.",
      items: [
        "Upload your ID from a camera or a file, up to 10 MB each",
        "See the total, including delivery, before you pay",
        "Fix problems in place when we mark a request as Action Required",
        "Cancel a request or open a support ticket from the same screen",
        "Rate the service once your document arrives",
      ],
    },
    steps: {
      title: "Four steps, none of them in Egypt",
      sub: "You do the first two. We do the third. The fourth is waiting for the courier.",
      items: [
        { title: "Create your account", text: "An email, a phone number and a password. It takes about a minute." },
        { title: "Choose a document and fill in the details", text: "Order for yourself or for a family member, upload the IDs we ask for, and pick a delivery address." },
        { title: "We handle it in Egypt", text: "Our team files the request with the authorities. If something needs fixing, we flag it and you correct it." },
        { title: "Track it and receive it", text: "Follow the status until the document is under delivery, then completed at your door." },
      ],
    },
    faq: {
      title: "Questions people ask before ordering",
      sub: "Cannot find yours? Write to us and we will answer.",
      items: [
        {
          q: "Which documents can I order?",
          a: "Birth Certificate, Family Record and Marriage Certificate. Other services are planned and will appear on the Services page when they are ready.",
        },
        {
          q: "Can I order a document for someone else?",
          a: "Yes. Choose Another person at checkout, give their details and your relationship to them, and upload your ID. For some documents you can also upload theirs.",
        },
        {
          q: "How long does it take?",
          a: "Each service shows its own processing estimate on the Services page. Delivery time is on top of that and depends on the destination.",
        },
        {
          q: "What does it cost?",
          a: "The service fee per copy plus a delivery fee that depends on where it is going. Both are listed on the Services page, and the exact total is shown before you pay.",
        },
        {
          q: "What if my upload is not accepted?",
          a: "We mark the request as Action Required and tell you what to fix. Once you respond, it goes back to review.",
        },
        {
          q: "Can I cancel?",
          a: "Yes, until the request is under delivery. A request already in progress needs our confirmation. The Refund Policy has the details.",
        },
      ],
    },
    cta: {
      title: "Start your first request",
      sub: "Create an account, pick a document and see the full price before you pay.",
      button: "Start a request",
    },
  },

  services: {
    title: "Services",
    sub: "Government Documents is live. More categories are on the way, each under the same account.",
    liveNote: "",
    staleNote:
      "The live price list could not be reached just now. These amounts may be out of date; the exact total is always shown at checkout.",
    docsTitle: "Government Documents",
    docsSub: "Per copy, plus delivery. Processing time is an estimate and starts once your request is complete.",
    feeLabel: "Service fee",
    requiredDocs: "You will need",
    requiredInfo: "You will be asked for",
    deliveryTitle: "Delivery fees",
    deliverySub: "One fee per order, based on where the documents are going.",
    insideEgypt: "Inside Egypt",
    outsideEgypt: "Outside Egypt",
    comingTitle: "Coming next",
    comingSub: "These categories are planned. None of them can be ordered yet.",
    categories: [
      { name: "Real Estate", text: "Brokerage support for buying and investing." },
      { name: "Limousine and Transportation", text: "Scheduled rides and reliable transport." },
      { name: "Healthcare", text: "Access to medical services." },
      { name: "Offers and Discounts", text: "Deals from partners." },
    ],
  },

  about: {
    title: "A simpler way to get things done in Egypt",
    lead: "Inzerv is a service platform built for people who need something from Egypt and cannot be there to get it.",
    missionTitle: "Why we exist",
    mission: [
      "Official paperwork in Egypt still assumes you can show up. For Egyptians abroad, and for residents who cannot take a day off, that means asking a relative or paying someone you have never met.",
      "Inzerv puts one accountable team and one clear status screen in between. You send the request and the IDs; we deal with the offices; you follow it until it reaches you.",
    ],
    valuesTitle: "What we hold ourselves to",
    values: [
      { title: "Trust", text: "You see the price before you pay and the status while we work. Your IDs are used for your request and nothing else." },
      { title: "Simplicity", text: "Few fields, plain words, one flow. If a step needs explaining, we rewrite the step." },
      { title: "Modernity", text: "Arabic and English, phone and browser, notifications instead of phone calls." },
    ],
    roadmapTitle: "Where it is going",
    roadmapSub: "Government Documents is the first category. The others will use the same account and the same standards.",
    statusLive: "Available now",
    statusSoon: "Planned",
    roadmap: [
      { name: "Government Documents", live: true, text: "Birth, family record and marriage documents, delivered." },
      { name: "Real Estate", live: false, text: "Brokerage support." },
      { name: "Limousine and Transportation", live: false, text: "Scheduled rides." },
      { name: "Healthcare", live: false, text: "Medical services." },
      { name: "Offers and Discounts", live: false, text: "Partner deals." },
    ],
    ctaTitle: "Need a document from Egypt?",
    ctaButton: "Start a request",
  },

  contact: {
    title: "Contact us",
    sub: "Questions before you order, or a problem with an order. Write to us and we will reply by email.",
    emailLabel: "Email",
    inAppTitle: "Already have a request?",
    inAppText:
      "Open Help and Support in the Inzerv app. A ticket attached to your order reaches us with all the details.",
    formTitle: "Send a message",
    name: "Your name",
    email: "Your email",
    topic: "Topic",
    topics: ["Before ordering", "An existing order", "Payment or refund", "Something else"],
    message: "Message",
    messagePlaceholder: "Tell us what you need. Include your order reference if you have one.",
    send: "Write the email",
    note: "This opens your email app with the message filled in. Nothing is sent until you press send there.",
    errors: { name: "Enter your name.", email: "Enter a valid email address.", message: "Write a short message." },
  },

  checkout: {
    title: "Place a request",
    sub: "Sign in or create an account, fill in the details, and see the full price before you pay.",
    stepWord: "Step {n} of {total}",
    steps: {
      account: "Account",
      details: "Details",
      documents: "Documents",
      delivery: "Delivery",
      review: "Review and pay",
    },
    back: "Back",
    next: "Continue",
    catalogDown: "The service list could not be loaded. Check your connection and try again.",
    retry: "Try again",
    account: {
      signIn: "Sign in",
      register: "Create account",
      email: "Email",
      password: "Password",
      firstName: "First name",
      lastName: "Last name",
      phone: "Phone number",
      country: "Country of residence",
      passwordHint: "At least 8 characters, one uppercase letter and one number.",
      signedInAs: "Signed in as {name}",
      signOut: "Use a different account",
      continueAs: "Continue",
    },
    details: {
      service: "Document",
      requestFor: "Who is this for?",
      myself: "Myself",
      another: "Another person",
      copies: "Number of copies",
      holder: "Document holder",
      choose: "Choose",
      processing: "Processing: {t}",
    },
    documents: {
      title: "Upload the documents we need",
      sub: "Photos or scans must be clear and show the whole page.",
      choose: "Choose file",
      replace: "Replace file",
      remove: "Remove",
      allowed: "JPG, PNG or PDF, up to {n} MB",
      tooLarge: "This file is larger than {n} MB.",
      badType: "This file type is not accepted.",
      none: "No documents are required for this selection.",
    },
    delivery: {
      title: "Where should it go?",
      destination: "Country",
      select: "Select a country",
      recipient: "Recipient name",
      recipientPhone: "Recipient phone",
      city: "City",
      governorate: "Governorate (optional)",
      address: "Street address",
      postal: "Postal code (optional)",
      fee: "Delivery fee",
    },
    review: {
      title: "Review and pay",
      service: "Document",
      copies: "Copies",
      serviceFee: "Service fee",
      deliveryFee: "Delivery fee",
      total: "Total",
      method: "Payment method",
      card: "Credit or debit card",
      wallet: "Digital wallet",
      paymentNote: "No card number is collected on this page.",
      agree: "I confirm the information is correct and I agree to the {terms}, {refund} and {privacy}.",
      place: "Place order and pay {amount}",
      holderHeading: "Details you entered",
      files: "Files",
    },
    progress: {
      creating: "Creating your request",
      uploading: "Uploading documents ({i} of {n})",
      paying: "Confirming payment",
    },
    success: {
      title: "Your request is in",
      ref: "Reference number",
      text: "We have received your request and payment. Sign in to the Inzerv app with the same email to follow its status, or contact us with the reference above.",
      again: "Place another request",
    },
    errors: {
      network: "Cannot reach Inzerv right now. Check your connection and try again.",
      generic: "Something went wrong. Please try again.",
      required: "This field is required.",
      email: "Enter a valid email address.",
      password: "Use at least 8 characters with one uppercase letter and one number.",
      session: "Your session expired. Sign in again.",
      agree: "Please confirm to continue.",
      select: "Please choose an option.",
      uploadFailed: "One of the files could not be uploaded. Your request is saved; try again.",
      payFailed: "Payment could not be confirmed. Your request is saved; try again.",
    },
  },

  legal: {
    draftTitle: "Draft for review",
    draftText:
      "This page is a draft and has not yet been approved by Inzerv's legal advisers. It may change before launch.",
    updated: "Last updated",
    toc: "On this page",
    top: "Back to top",
    questions: "Questions about this page? Write to",
    terms: {
      title: "Terms of Service",
      intro:
        "These terms govern your use of the Inzerv website and mobile app. Please read them before placing a request.",
      sections: [
        {
          h: "1. Who we are",
          p: [
            "Inzerv is operated by Inzerv Group for Digital Marketing & Brokerage (\"Inzerv\", \"we\"). By creating an account or placing a request you agree to these terms.",
          ],
        },
        {
          h: "2. What the service is",
          p: [
            "Inzerv acts as an intermediary. We collect your information and documents, submit applications to the relevant Egyptian authorities on your behalf, and deliver the result to the address you give us.",
            "The authorities, not Inzerv, issue the documents. Processing times we show are estimates and can change when an authority is slow or asks for more information.",
          ],
        },
        {
          h: "3. Your account",
          ul: [
            "Give accurate information and keep it up to date.",
            "Choose a password of at least 8 characters with one uppercase letter and one number, and keep it private.",
            "You are responsible for activity on your account. Tell us at once if you think it has been misused.",
          ],
        },
        {
          h: "4. Placing a request",
          p: [
            "You confirm that the details and files you submit are correct before you pay. If you order for another person, you confirm that you are entitled to request the document and have that person's consent.",
            "If we find a problem, we mark the request as Action Required and processing pauses until you respond.",
          ],
        },
        {
          h: "5. Prices and payment",
          p: [
            "The total is the service fee for each copy plus the delivery fee for your destination. It is shown in Egyptian pounds before you pay, and that total is the amount you are charged.",
          ],
        },
        {
          h: "6. Cancellation and refunds",
          p: ["You can cancel a request until it is under delivery. Our Refund Policy explains what happens to your payment."],
        },
        {
          h: "7. Delivery",
          p: [
            "We deliver to the address and phone number you provide. Delivery times depend on the destination and the courier. If a delivery fails because the address or phone number was wrong, extra delivery costs may apply.",
          ],
        },
        {
          h: "8. Acceptable use",
          ul: [
            "Do not submit forged, altered or someone else's documents without their authority.",
            "Do not misuse the service, attempt to access other accounts, or interfere with how it works.",
          ],
        },
        {
          h: "9. Our responsibility",
          p: [
            "We take care in handling your request, but we do not control decisions, delays or refusals by government authorities. To the extent the law allows, Inzerv is not liable for indirect or consequential losses.",
          ],
        },
        {
          h: "10. Changes to these terms",
          p: ["We may update these terms. The date at the top shows the latest version. If you keep using Inzerv after a change, you accept the new terms."],
        },
        {
          h: "11. Governing law",
          p: ["These terms are governed by the laws of the Arab Republic of Egypt."],
        },
      ],
    } as LegalDoc,
    refund: {
      title: "Refund Policy",
      intro: "This page explains when you can cancel a request and what happens to your payment.",
      sections: [
        {
          h: "1. When you can cancel",
          ul: [
            "Requested, Received, Under Review or Action Required: you can cancel and it takes effect immediately.",
            "In Progress: you can ask to cancel. Our team reviews the request and confirms, because work with the authorities may already have started.",
            "Under Delivery, Completed or Cancelled: the request can no longer be cancelled.",
          ],
        },
        {
          h: "2. How to cancel",
          p: [
            "Open the request in the Inzerv app, choose Cancel Request and give a reason. A cancellation cannot be undone; you would need to place a new request.",
          ],
        },
        {
          h: "3. What you get back",
          p: [
            "If you cancel before processing starts, you are refunded the full amount you paid.",
            "If work has already started, costs already spent with the authorities, and the service fee for work done, may be deducted. We tell you the refundable amount when we confirm the cancellation.",
          ],
        },
        {
          h: "4. If something is our fault",
          p: [
            "If a document is delivered with an error that we caused, we will process it again at no extra charge or refund you.",
            "If an authority refuses a request for a reason we cannot resolve, we refund the amount not already spent.",
          ],
        },
        {
          h: "5. How refunds are paid",
          p: [
            "Refunds go back to the payment method you used. We notify you when a refund is issued; how long your bank takes to show it depends on the bank.",
          ],
        },
      ],
    } as LegalDoc,
    privacy: {
      title: "Privacy Policy",
      intro: "This page explains what personal data Inzerv collects, why, and the choices you have.",
      sections: [
        {
          h: "1. What we collect",
          ul: [
            "Account data: name, email, phone number, country of residence and an encrypted password.",
            "Request data: the document holder's name, national ID details, date of birth, mother's name and your relationship to them.",
            "Files you upload, such as ID copies.",
            "Delivery data: recipient name, phone number and address.",
            "Payment records: the method used, the amount and a transaction reference. This website does not collect card numbers.",
            "App data: a device token so we can send notifications, and any support tickets you open.",
          ],
        },
        {
          h: "2. Why we use it",
          ul: [
            "To process your request with the authorities and deliver the result.",
            "To tell you about status changes and verify your identity when you reset a password.",
            "To answer support questions and keep the service secure.",
          ],
        },
        {
          h: "3. Who we share it with",
          p: ["Only as needed to do what you asked:"],
          ul: [
            "Egyptian authorities, for the document you requested.",
            "Delivery couriers, for the recipient name, phone and address.",
            "Service providers that host our systems and send our emails, under their own security obligations.",
          ],
        },
        {
          h: "4. How we protect it",
          p: [
            "Data travels over encrypted connections and passwords are stored hashed. Uploaded documents are available only to you and to staff who need them to process your request.",
          ],
        },
        {
          h: "5. Cookies and local storage",
          p: [
            "This website does not use advertising or tracking cookies. While you place a request, your sign-in is kept in your browser's session storage and is cleared when you close the tab.",
          ],
        },
        {
          h: "6. Keeping your data",
          p: ["We keep request records and files for as long as needed to deliver the service and meet legal obligations, then delete or anonymise them."],
        },
        {
          h: "7. Your choices",
          ul: [
            "Update your personal information in the app's Personal Information screen.",
            "Delete your account from the app's Account screen.",
            "Ask us for a copy of your data or for its correction by email.",
          ],
        },
        {
          h: "8. Changes",
          p: ["If we change this policy, the date at the top will change and we will tell you in the app for significant changes."],
        },
      ],
    } as LegalDoc,
  },
};

export type Dict = typeof en;
