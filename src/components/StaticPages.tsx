import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  onBack: () => void;
}

const PageLayout = ({ title, children, onBack }: { title: string; children: React.ReactNode; onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-surface text-ink font-sans flex flex-col">
      <nav className="h-20 border-b border-border bg-surface-alt px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-surface rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <button onClick={onBack} className="flex items-center gap-2 border-none bg-transparent hover:opacity-80 transition-opacity cursor-pointer p-0">
            <span className="text-xl font-bold tracking-tight font-display text-ink">uJuzi</span>
          </button>
        </div>
      </nav>
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-black font-display mb-12 tracking-tight text-ink">{title}</h1>
        <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-ink prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-accent hover:prose-a:text-accent/80 prose-li:text-slate-600 dark:prose-p:text-slate-400 dark:prose-li:text-slate-400">
          {children}
        </div>
      </main>
      <footer className="h-20 border-t border-border bg-surface-alt px-6 md:px-12 flex items-center justify-center shrink-0">
        <span className="text-sm font-medium text-slate-500">© {new Date().getFullYear()} uJuzi. Built for the next generation of Nigerian learners.</span>
      </footer>
    </div>
  );
};

export const AboutPage = ({ onBack }: PageProps) => (
  <PageLayout title="About uJuzi" onBack={onBack}>
    <p>
      uJuzi was built to bridge the gap between generic study applications and the reality of the Nigerian educational system. 
      Whether you're studying for WAEC, JAMB, or a university degree, you need materials that reflect your actual syllabus, not an approximation of it.
    </p>
    <h2>Our Mission</h2>
    <p>
      Our mission is simple: to transform how Nigerian students learn by turning any curriculum into a highly personalized, AI-powered study plan. 
      We believe that every student learns differently, and that technology should adapt to the student, not the other way around.
    </p>
    <h2>Who We Are</h2>
    <p>
      We are a team of educators, technologists, and designers based in Lagos, passionate about building the future of learning in Africa. 
      We saw students spending countless hours manually creating flashcards and practice quizzes, and we knew there had to be a better way.
    </p>
  </PageLayout>
);

export const ContactPage = ({ onBack }: PageProps) => (
  <PageLayout title="Contact Us" onBack={onBack}>
    <p>
      Have a question, feedback, or need support? We're here to help. Reach out to the uJuzi team and we'll get back to you as soon as possible.
    </p>
    <h2>Get in Touch</h2>
    <div className="flex flex-col gap-4 mt-6 not-prose">
      <a href="mailto:hello@ujuzi.app" className="flex items-center gap-4 p-6 bg-surface-alt border border-border rounded-2xl hover:border-accent transition-colors group">
        <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-ink mb-1">Email Us</h3>
          <p className="text-slate-500 font-medium">hello@ujuzi.app</p>
        </div>
      </a>
      
      <div className="flex items-center gap-4 p-6 bg-surface-alt border border-border rounded-2xl">
        <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-ink mb-1">Office</h3>
          <p className="text-slate-500 font-medium">Lagos, Nigeria</p>
        </div>
      </div>
    </div>
  </PageLayout>
);

export const TermsPage = ({ onBack }: PageProps) => (
  <PageLayout title="Terms of Service" onBack={onBack}>
    <p>Last updated: August 8, 2026</p>
    <p>
      Welcome to uJuzi. By accessing or using our application, you agree to be bound by these Terms of Service and our Privacy Policy.
    </p>
    <h2>1. Use of the Service</h2>
    <p>
      uJuzi provides AI-powered study tools. You may use our service only as permitted by law and according to these terms. 
      You are responsible for your account and all activity associated with it.
    </p>
    <h2>2. User Content</h2>
    <p>
      When you upload a syllabus or curriculum to uJuzi, you retain ownership of that content. However, you grant us a license to use, 
      process, and store that content to generate your personalized study materials.
    </p>
    <h2>3. Prohibited Conduct</h2>
    <p>
      You agree not to upload any content that is illegal, harmful, or infringes on the intellectual property rights of others. 
      You also agree not to misuse our services or attempt to access them using a method other than the interface and instructions we provide.
    </p>
    <h2>4. Termination</h2>
    <p>
      We may suspend or terminate your access to uJuzi if you violate these terms or for any other reason at our discretion.
    </p>
  </PageLayout>
);

export const PrivacyPage = ({ onBack }: PageProps) => (
  <PageLayout title="Privacy Policy" onBack={onBack}>
    <p>Last updated: August 8, 2026</p>
    <p>
      At uJuzi, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.
    </p>
    <h2>Information We Collect</h2>
    <p>
      We collect information you provide directly to us, such as when you create an account, upload a curriculum, or contact support. 
      This may include your name, email address, educational level, and study preferences.
    </p>
    <h2>How We Use Your Information</h2>
    <p>
      We use the information we collect to provide, maintain, and improve our services, to personalize your study experience, 
      and to communicate with you. Your uploaded curriculum documents are used strictly to generate study materials for your account.
    </p>
    <h2>Data Security</h2>
    <p>
      We implement industry-standard security measures to protect your data from unauthorized access, disclosure, or destruction. 
      However, no method of transmission over the internet or electronic storage is 100% secure.
    </p>
    <h2>Sharing Your Information</h2>
    <p>
      We do not sell your personal data. We may share information with trusted third-party service providers who assist us in operating 
      our application, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
    </p>
  </PageLayout>
);
