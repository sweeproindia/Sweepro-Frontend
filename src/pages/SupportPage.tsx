import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Phone, Mail, Clock, HelpCircle, Search, ChevronRight, Send, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const faqItems = [
  {
    question: 'How do I reschedule a cleaning appointment?',
    answer: 'You can reschedule appointments up to 24 hours in advance through your dashboard. Go to My Bookings and click Reschedule next to the appointment.'
  },
  {
    question: 'What happens if I am not home during the cleaning?',
    answer: 'Our cleaners can work while you are away. Just ensure they have access to your home and any specific instructions. You will receive updates via SMS.'
  },
  {
    question: 'Can I pause my subscription temporarily?',
    answer: 'Yes, you can pause your subscription for up to 3 months. Go to Subscription Details and click "Pause Subscription". Your plan will resume automatically.'
  },
  {
    question: 'What cleaning supplies do the homecare partners bring?',
    answer: 'Our cleaners bring all necessary supplies including eco-friendly cleaning products, vacuum cleaners, mops, and other equipment.'
  },
  {
    question: 'How do I change my subscription plan?',
    answer: 'You can upgrade or downgrade your plan anytime from the Subscription page. Changes take effect from your next billing cycle.'
  },
  {
    question: 'What if I am not satisfied with the cleaning?',
    answer: 'We offer a 100% satisfaction guarantee. Contact us within 24 hours of the service, and we will arrange a re-clean at no extra cost.'
  }
];

const supportChannels = [

  {
    icon: Phone,
    title: 'Whatsapp Support',
    description: 'Speak directly with our specialists',
    availability: 'Mon-Sun, 8 AM - 10 PM',
    action: 'Call Now: +91 98765 43210',
    color: 'text-success'
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Send us detailed queries via email',
    availability: 'Response within 4 hours',
    action: 'Send Email',
    color: 'text-warning'
  }
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: ''
  });
  const [chatMessages, setChatMessages] = useState([
    { id: 1, type: 'bot', message: 'Hi! I\'m your AI assistant. How can I help you today?', timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const { toast } = useToast();

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Support ticket created!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ subject: '', category: '', message: '' });
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
    if (input.includes('booking') || input.includes('schedule')) {
      return 'You can book services from your dashboard. Your preferred time slot is already set from your subscription. Just click "Book for Tomorrow" on the Bookings page!';
    } else if (input.includes('payment') || input.includes('bill')) {
      return 'You can view your payment history and manage billing in the Payments section. All payments are securely processed through Razorpay.';
    } else if (input.includes('subscription') || input.includes('plan')) {
      return 'You can view and manage your subscription plan in the Subscription section. You can upgrade, downgrade, or pause your subscription anytime.';
    } else if (input.includes('time') || input.includes('reschedule')) {
      return 'Your time slot was set during subscription signup. To change it, please contact our support team or update it in your subscription settings.';
    } else {
      return 'I\'m here to help! You can ask me about bookings, payments, subscriptions, or any other questions. For complex issues, please use the support form below or contact our human agents.';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">Support Center</h1>
          <p className="text-muted-foreground mt-2">
            Get help with your cleaning services and account management
          </p>
        </div>

        {/* AI Chat Support */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-primary" />
              <span>AI Assistant</span>
            </CardTitle>
            <CardDescription>
              Get instant help with common questions and issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ScrollArea className="h-80 w-full border border-border rounded-lg p-4">
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start space-x-2 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          {msg.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={`rounded-lg p-3 ${msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p className="text-sm">{msg.message}</p>
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
              className="dashboard-card hover:shadow-feature cursor-pointer group"
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
                <Button className="w-full btn-hero text-sm sm:text-base">
                  {channel.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Support Form */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Submit a Support Request</CardTitle>
            <CardDescription>
              Describe your issue and we'll get back to you as soon as possible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking">Booking Issues</SelectItem>
                      <SelectItem value="billing">Billing & Payments</SelectItem>
                      <SelectItem value="service">Service Quality</SelectItem>
                      <SelectItem value="technical">Technical Issues</SelectItem>
                      <SelectItem value="general">General Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Please provide detailed information about your issue..."
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" className="btn-hero" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Find quick answers to common questions
            </CardDescription>

            {/* FAQ Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFAQ.map((item, index) => (
                <details
                  key={index}
                  className="group border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <div className="flex items-center space-x-3">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">{item.question}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-3 pl-8 text-muted-foreground">
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