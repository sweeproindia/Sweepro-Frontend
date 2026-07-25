import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Phone, Mail, Clock, HelpCircle, Search, ChevronRight, Send, Bot, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const faqItems = [
  {
    question: 'How do I reschedule a cleaning appointment?',
    answer: 'You can reschedule appointments up to 24 hours in advance through your dashboard. Go to My Bookings and click Reschedule next to the appointment. For urgent changes, contact support via WhatsApp: +91 81433 53030'
  },
  {
    question: 'What happens if I am not home during the cleaning?',
    answer: 'Our cleaners can work while you are away. Just ensure they have access to your home and any specific instructions. You will receive updates via SMS. For access issues, contact support immediately.'
  },
  {
    question: 'Can I pause my subscription temporarily?',
    answer: 'Yes, you can pause your subscription for up to 3 months. Go to Subscription Details and click "Pause Subscription". Your plan will resume automatically after the pause period ends.'
  },
  {
    question: 'What cleaning supplies do the homecare partners bring?',
    answer: 'Our cleaners bring all necessary supplies including eco-friendly cleaning products, vacuum cleaners, mops, and other equipment. You don\'t need to provide anything unless you have specific preferences.'
  },
  {
    question: 'How do I change my subscription plan?',
    answer: 'You can upgrade or downgrade your plan anytime from the Subscription page. Changes take effect from your next billing cycle. Upgrades are immediate, downgrades apply from next billing cycle.'
  },
  {
    question: 'What if I am not satisfied with the cleaning?',
    answer: 'We offer a 100% satisfaction guarantee. Contact us within 24 hours of the service via WhatsApp (+91 81433 53030) or email (sweeproindia@gmail.com), and we will arrange a re-clean at no extra cost.'
  },
  {
    question: 'How do buffer days work?',
    answer: 'Buffer days allow you to skip cleaning when needed. Available with SweePro Lux plan (3 buffer days/month). Use Buffer Management in your dashboard to request buffer days. Buffer days don\'t affect your subscription billing.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods including UPI, credit/debit cards, net banking, and wallets through Razorpay. All payments are secure and encrypted.'
  },
  {
    question: 'How do I cancel my subscription?',
    answer: 'You can cancel your subscription anytime from the Subscription page. Your subscription will remain active until the end of your current billing cycle. No refunds for partial months.'
  },
  {
    question: 'What if my cleaner doesn\'t show up?',
    answer: 'This rarely happens, but if your cleaner doesn\'t arrive within 30 minutes of the scheduled time, contact support immediately via WhatsApp (+91 81433 53030). We will arrange a replacement or reschedule at no extra cost.'
  }
];

const supportChannels = [
  {
    icon: Phone,
    title: 'WhatsApp Support',
    description: 'Chat directly with our support team',
    availability: 'Mon-Sun, 8 AM - 10 PM',
    action: 'Chat on WhatsApp',
    link: 'https://wa.me/918143353030',
    color: 'text-success',
    hasButton: true
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Send us detailed queries via email',
    availability: 'Response within 4 hours',
    email: 'sweeproindia@gmail.com',
    color: 'text-warning',
    hasButton: false
  }
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, type: 'bot', message: 'Hi! I\'m your AI assistant. How can I help you today?', timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user' as const,
      message: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot' as const,
        message: getBotResponse(chatInput),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);
      setIsChatLoading(false);
    }, 1000);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Critical issues - escalate immediately
    if (input.includes('emergency') || input.includes('urgent') || input.includes('safety') || input.includes('danger')) {
      return '⚠️ This sounds urgent! Please contact our support team immediately:\n\n📱 WhatsApp: +91 81433 53030\n📧 Email: sweeproindia@gmail.com\n\nOur team is available Mon-Sun, 8 AM - 10 PM for critical issues.';
    }

    // Booking related
    if (input.includes('booking') || input.includes('schedule') || input.includes('appointment')) {
      return 'You can book services from your dashboard. Your preferred time slot is already set from your subscription. Just click "Book for Tomorrow" on the Bookings page! Need to change your time slot? Contact support via WhatsApp.';
    }

    // Payment related
    if (input.includes('payment') || input.includes('bill') || input.includes('refund') || input.includes('charge')) {
      return 'You can view your payment history and manage billing in the Payments section. All payments are securely processed through Razorpay. For payment disputes or refunds, please contact support via WhatsApp: +91 81433 53030';
    }

    // Subscription related
    if (input.includes('subscription') || input.includes('plan') || input.includes('upgrade') || input.includes('downgrade')) {
      return 'You can view and manage your subscription plan in the Subscription section. You can upgrade, downgrade, or pause your subscription anytime. Changes take effect from your next billing cycle.';
    }

    // Rescheduling
    if (input.includes('reschedule') || input.includes('cancel') || input.includes('change time')) {
      return 'You can reschedule appointments up to 24 hours in advance through your dashboard. Go to My Bookings and click Reschedule. For urgent changes, contact support via WhatsApp.';
    }

    // Service quality
    if (input.includes('cleaning') || input.includes('quality') || input.includes('satisfied') || input.includes('complaint')) {
      return 'We offer a 100% satisfaction guarantee. If you\'re not satisfied with the cleaning, contact us within 24 hours and we\'ll arrange a re-clean at no extra cost. WhatsApp: +91 81433 53030';
    }

    // Access/entry
    if (input.includes('access') || input.includes('key') || input.includes('not home') || input.includes('away')) {
      return 'Our cleaners can work while you\'re away. Just ensure they have access to your home and any specific instructions. You\'ll receive updates via SMS. For access issues, contact support immediately.';
    }

    // Supplies
    if (input.includes('supplies') || input.includes('equipment') || input.includes('bring')) {
      return 'Our cleaners bring all necessary supplies including eco-friendly cleaning products, vacuum cleaners, mops, and other equipment. You don\'t need to provide anything!';
    }

    // Buffer system
    if (input.includes('buffer') || input.includes('skip') || input.includes('pause')) {
      return 'Buffer days allow you to skip cleaning when needed. Available with SweePro Lux plan. You can manage buffer days in the Buffer Management section of your dashboard.';
    }

    // General help
    return 'I\'m here to help! You can ask me about:\n• Bookings and rescheduling\n• Payments and billing\n• Subscriptions and plans\n• Service quality issues\n• Buffer days\n\nFor complex issues, please use the support form below or contact our team:\n📱 WhatsApp: +91 81433 53030\n📧 Email: sweeproindia@gmail.com';
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Support Center</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Get help with your cleaning services and account management
          </p>
        </div>

        {/* AI Chat Support */}
        <Card className="dashboard-card slide-up">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span>AI Assistant</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Get instant help with common questions and issues
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-4">
              <ScrollArea className="h-64 sm:h-80 w-full border border-border rounded-lg p-3 sm:p-4">
                <div className="space-y-3 sm:space-y-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start space-x-2 max-w-[90%] sm:max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          {msg.type === 'user' ? <User className="h-3 w-3 sm:h-4 sm:w-4" /> : <Bot className="h-3 w-3 sm:h-4 sm:w-4" />}
                        </div>
                        <div className={`rounded-lg p-2 sm:p-3 ${msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p className="text-xs sm:text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <form onSubmit={handleChatSubmit} className="flex space-x-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isChatLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isChatLoading || !chatInput.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Support Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 slide-up max-w-2xl mx-auto">
          {supportChannels.map((channel, index) => (
            <Card
              key={channel.title}
              className="dashboard-card hover:shadow-feature group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="text-center p-4 sm:p-6">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full bg-card border-2 border-border flex items-center justify-center group-hover:border-primary/30 transition-colors ${channel.color}`}>
                  <channel.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <CardTitle className="text-base sm:text-lg">{channel.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{channel.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-2 sm:space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{channel.availability}</span>
                </div>
                {channel.hasButton ? (
                  <Button className="h-11 rounded-full border-2 border-transparent bg-[#1800ad] text-white hover:bg-[#ca0013] font-semibold w-full text-sm sm:text-base shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl" onClick={() => window.open(channel.link, '_blank')}>
                    {channel.action}
                  </Button>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">{channel.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">Copy the email above to contact us</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card className="dashboard-card slide-up">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Frequently Asked Questions</CardTitle>
            <CardDescription className="text-sm">
              Find quick answers to common questions
            </CardDescription>

            {/* FAQ Search */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-3 sm:space-y-4">
              {filteredFAQ.map((item, index) => (
                <details
                  key={index}
                  className="group border border-border rounded-lg p-3 sm:p-4 hover:bg-muted/30 transition-colors"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
                      <span className="font-medium text-foreground text-sm sm:text-base">{item.question}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                  </summary>
                  <div className="mt-2 sm:mt-3 pl-6 sm:pl-8 text-muted-foreground text-sm">
                    {item.answer}
                  </div>
                </details>
              ))}

              {filteredFAQ.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or contact our support team directly.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}