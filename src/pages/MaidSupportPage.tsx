import { MaidDashboardLayout } from '@/components/dashboard/MaidDashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  Calendar,
  Clock,
  DollarSign,
  HelpCircle,
  Mail,
  Phone,
  Send,
  Settings,
  Shield
} from 'lucide-react';
import { useState } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'support';
  timestamp: string;
  isTyping?: boolean;
}

interface SupportTicket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  category: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hello! Welcome to Sweepro Support. How can I help you today?",
    sender: 'support',
    timestamp: '10:00 AM'
  },
  {
    id: 2,
    text: "Hi! I have a question about my booking for tomorrow.",
    sender: 'user',
    timestamp: '10:01 AM'
  },
  {
    id: 3,
    text: "Of course! I can help you with that. What's your booking ID or the client's name?",
    sender: 'support',
    timestamp: '10:01 AM'
  }
];

const supportTickets: SupportTicket[] = [
  {
    id: 1,
    title: "Payment Issue - Missing Payment",
    description: "I completed a booking yesterday but haven't received payment yet.",
    status: 'resolved',
    priority: 'high',
    createdAt: '2 hours ago',
    category: 'Payment'
  },
  {
    id: 2,
    title: "Client Cancellation Request",
    description: "Client wants to cancel tomorrow's booking. Need guidance on cancellation policy.",
    status: 'in-progress',
    priority: 'medium',
    createdAt: '1 hour ago',
    category: 'Booking'
  },
  {
    id: 3,
    title: "App Technical Issue",
    description: "Cannot update my availability in the app. Getting error message.",
    status: 'open',
    priority: 'medium',
    createdAt: '30 minutes ago',
    category: 'Technical'
  }
];

const faqItems = [
  {
    question: "How do I update my availability?",
    answer: "Go to your profile settings and click on 'Set Availability'. You can select your working hours and days."
  },
  {
    question: "What should I do if a client cancels?",
    answer: "Contact support immediately. Cancellation policies vary based on timing. We'll help you understand the compensation."
  },
  {
    question: "When do I receive payments?",
    answer: "Payments are processed within 24-48 hours after service completion. You'll receive a notification when payment is sent."
  },
  {
    question: "How do I report a safety concern?",
    answer: "Use the emergency contact button or call our 24/7 support line immediately. Your safety is our priority."
  },
  {
    question: "What cleaning supplies should I bring?",
    answer: "We provide basic supplies, but you can bring your preferred products. Check the booking details for specific requirements."
  },
  {
    question: "How do I handle difficult clients?",
    answer: "Stay professional and contact support if needed. We're here to help resolve any issues or concerns."
  }
];

export default function MaidSupportPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'tickets' | 'faq'>('chat');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI support response
    setTimeout(() => {
      const supportMessage: Message = {
        id: messages.length + 2,
        text: getBotResponse(newMessage),
        sender: 'support',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, supportMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Critical issues - escalate immediately
    if (input.includes('emergency') || input.includes('urgent') || input.includes('safety') || input.includes('danger') || input.includes('police')) {
      return '⚠️ This sounds urgent! Please contact our support team immediately:\n\n📱 WhatsApp: +91 81433 53030\n📧 Email: sweeproindia@gmail.com\n\nFor safety emergencies, call local authorities first, then contact us.';
    }

    // Payment related
    if (input.includes('payment') || input.includes('paid') || input.includes('salary') || input.includes('money')) {
      return 'Payments are processed within 24-48 hours after service completion. If you haven\'t received payment after 48 hours, please contact support via WhatsApp: +91 81433 53030 with your booking ID.';
    }

    // Booking related
    if (input.includes('booking') || input.includes('schedule') || input.includes('appointment') || input.includes('client')) {
      return 'You can view your upcoming bookings in the dashboard. For booking changes, cancellations, or client issues, contact support via WhatsApp with your booking details.';
    }

    // Availability
    if (input.includes('availability') || input.includes('available') || input.includes('time slot') || input.includes('working hours')) {
      return 'You can update your availability in your profile settings. Go to Profile > Set Availability to select your working hours and days. For issues updating availability, contact support.';
    }

    // Cancellation
    if (input.includes('cancel') || input.includes('cancellation')) {
      return 'If a client wants to cancel, contact support immediately. Cancellation policies vary based on timing. We\'ll help you understand compensation and next steps. WhatsApp: +91 81433 53030';
    }

    // Supplies
    if (input.includes('supplies') || input.includes('equipment') || input.includes('bring') || input.includes('products')) {
      return 'We provide basic supplies, but you can bring your preferred products. Check the booking details for specific requirements. For supply issues, contact support.';
    }

    // Technical issues
    if (input.includes('app') || input.includes('technical') || input.includes('error') || input.includes('login') || input.includes('not working')) {
      return 'For technical issues with the app, try clearing your cache or reinstalling the app. If the issue persists, contact support with screenshots of the error. WhatsApp: +91 81433 53030';
    }

    // General help
    return 'I\'m here to help! You can ask me about:\n• Payments and salary\n• Bookings and schedules\n• Availability settings\n• Cancellations\n• Technical issues\n\nFor urgent matters, contact our team:\n📱 WhatsApp: +91 81433 53030\n📧 Email: sweeproindia@gmail.com';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-warning/20 text-warning';
      case 'in-progress':
        return 'bg-primary-light text-primary';
      case 'resolved':
        return 'bg-success-light text-success';
      case 'closed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/20 text-destructive';
      case 'medium':
        return 'bg-warning/20 text-warning';
      case 'low':
        return 'bg-success/20 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <MaidDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-foreground">Support & Help</h1>
          <p className="text-muted-foreground mt-2">
            Get help with bookings, payments, and technical issues
          </p>
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 slide-up">
          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center">
                  <Phone className="h-6 w-6 text-success-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">WhatsApp Support</h3>
                  <p className="text-sm text-muted-foreground">+91 81433 53030</p>
                </div>
                <Button className="h-11 rounded-full border-2 border-transparent bg-[#1800ad] text-white hover:bg-[#ca0013] font-semibold w-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl" onClick={() => window.open('https://wa.me/918143353030', '_blank')}>
                  Chat on WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">Email Support</h3>
                  <p className="text-sm text-muted-foreground">sweeproindia@gmail.com</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Copy the email above to contact us</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 bg-warning rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-warning-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-foreground">Response Time</h3>
                  <p className="text-sm text-muted-foreground">Within 2 hours</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Mon-Sun, 8 AM - 10 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Support Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="dashboard-card slide-up h-[600px] flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Live Chat Support</CardTitle>
                    <CardDescription>Chat with our support team in real-time</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Online</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                          }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-foreground px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Support Options */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="dashboard-card slide-up">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common support requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Booking Issues
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payment Problems
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Safety Concerns
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Technical Issues
                </Button>
              </CardContent>
            </Card>

            {/* Support Tickets */}
            <Card className="dashboard-card slide-up">
              <CardHeader>
                <CardTitle>My Support Tickets</CardTitle>
                <CardDescription>Track your support requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {supportTickets.slice(0, 3).map((ticket) => (
                  <div key={ticket.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm text-foreground">{ticket.title}</h4>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{ticket.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{ticket.createdAt}</span>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline">
                  View All Tickets
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="dashboard-card slide-up">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Find quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqItems.map((item, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-2">{item.question}</h4>
                      <p className="text-sm text-muted-foreground">{item.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </MaidDashboardLayout>
  );
} 