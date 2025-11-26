/**
 * Book Strategy Call Page
 * Public-facing page for customers to book free strategy calls
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import BookingForm from '@/components/booking/BookingForm';

const BookStrategyCall: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Book Your Free Strategy Call | Your Mate Agency</title>
        <meta
          name="description"
          content="Book a free 60-minute strategy call with Your Mate Agency. We help regional Victorian businesses grow through digital marketing. No obligation, just genuine advice."
        />
        <meta name="keywords" content="marketing strategy, free consultation, digital marketing, Victoria, regional business" />
        <meta property="og:title" content="Book Your Free Strategy Call | Your Mate Agency" />
        <meta property="og:description" content="Get a free marketing strategy session tailored for your regional Victorian business" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://yourmateagency.com.au/book-strategy-call" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute -top-40 -right-32 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-32 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left column - Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
                  G'day! Ready to
                  <span className="text-orange-400"> grow your business</span>?
                </h1>

                <p className="text-xl lg:text-2xl text-blue-100 mb-8 leading-relaxed">
                  Book a free 60-minute strategy call with Your Mate Agency.
                  We help regional Victorian businesses attract more customers and increase revenue through proven digital marketing.
                </p>

                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-blue-100">100% Free, No Strings Attached</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-blue-100">60 Minutes of Expert Advice</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-blue-100">Regional Victoria Specialists</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-blue-100">Tailored Action Plan</span>
                  </div>
                </div>

                <div className="bg-blue-700 bg-opacity-50 rounded-lg p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold mb-3 text-orange-400">What We'll Cover:</h3>
                  <ul className="text-blue-100 space-y-2 text-sm lg:text-base">
                    <li>• Current marketing audit and opportunities</li>
                    <li>• Competitor analysis for your local market</li>
                    <li>• Digital strategy tailored to your industry</li>
                    <li>• Immediate action steps you can implement</li>
                  </ul>
                </div>
              </div>

              {/* Right column - Form preview/testimonial */}
              <div className="lg:pl-8">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Get Started?</h3>
                    <p className="text-gray-600">Book your free strategy call now - it only takes 2 minutes!</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                      <span className="text-gray-700">Tell us about your business</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                      <span className="text-gray-700">Choose your preferred time</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                      <span className="text-gray-700">Confirm your details</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">⏰ All times shown in Melbourne time</p>
                      <p className="text-sm text-gray-500">📞 Need help? Call us on +61 478 101 521</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Form Section */}
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <BookingForm />
          </div>
        </section>

        {/* Trust/Social Proof Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Trusted by Regional Victorian Businesses
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From cafes in Geelong to tradies in Ballarat, we've helped hundreds of local businesses grow their customer base and increase revenue.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">☕</span>
                </div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "Your Mate Agency transformed our online presence. We went from struggling during lockdown to having more orders than we could handle!"
                </blockquote>
                <div className="font-semibold text-gray-900">Sarah M.</div>
                <div className="text-gray-500 text-sm">Geelong Coffee Co.</div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🔧</span>
                </div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "The strategy call alone was worth thousands. Matt showed us exactly what we needed to do to get more local customers."
                </blockquote>
                <div className="font-semibold text-gray-900">Mike T.</div>
                <div className="text-gray-500 text-sm">Ballarat Plumbing Solutions</div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">💪</span>
                </div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "Finally, someone who understands regional businesses! Our gym membership doubled in 6 months."
                </blockquote>
                <div className="font-semibold text-gray-900">Lisa K.</div>
                <div className="text-gray-500 text-sm">Bendigo Fitness Centre</div>
              </div>
            </div>

            {/* Contact Fallback */}
            <div className="mt-16 text-center">
              <div className="bg-blue-600 rounded-2xl shadow-xl text-white p-8 lg:p-12">
                <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                  Prefer to Chat First?
                </h3>
                <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                  No worries! Give us a call or send an email. We're always happy to have a quick chat about your business goals.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
                  <a
                    href="tel:+61478101521"
                    className="flex items-center space-x-3 text-white hover:text-orange-400 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-semibold">+61 478 101 521</span>
                  </a>

                  <a
                    href="mailto:matt@yourmateagency.com.au"
                    className="flex items-center space-x-3 text-white hover:text-orange-400 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-semibold">matt@yourmateagency.com.au</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BookStrategyCall;