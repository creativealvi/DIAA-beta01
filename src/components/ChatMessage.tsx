import React from 'react';
import { Volume2, VolumeX, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import BotAvatar from '../avatar.png';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  messageIndex?: number;
  totalMessages?: number;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSpeak,
  isSpeaking,
  onStopSpeaking,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to format AI responses by converting markdown-like syntax
  const formatAIResponse = (text: string) => {
    if (!text) return '';
    
    let formattedText = text
      // Convert **bold** to <strong> tags
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert *italic* to <em> tags (but not if it's already in bold)
      .replace(/(?<!\*\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
      // Convert # headings to proper heading tags
      .replace(/^# (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h4>$1</h4>')
      .replace(/^### (.*$)/gm, '<h5>$1</h5>')
      // Convert bullet points to proper lists
      .replace(/^• (.*$)/gm, '<li>$1</li>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      // Convert numbered lists
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      // Handle multiple consecutive list items
      .replace(/(<li>.*<\/li>)(\s*<li>.*<\/li>)+/gs, (match) => {
        return `<ul>${match}</ul>`;
      })
      // Convert single list items to ul
      .replace(/<li>(.*?)<\/li>/g, '<ul><li>$1</li></ul>')
      // Convert line breaks to proper spacing
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      // Wrap in paragraph tags
      .replace(/^(.*)$/gm, '<p>$1</p>')
      // Clean up empty paragraphs
      .replace(/<p><\/p>/g, '')
      // Clean up consecutive paragraph tags
      .replace(/<\/p><p>/g, '<br>')
      // Final cleanup
      .replace(/^<p>/, '')
      .replace(/<\/p>$/, '')
      // Clean up any remaining markdown artifacts
      .replace(/\*\*/g, '')
      .replace(/#{1,3}\s*/g, '')
      .replace(/^\s*[-•]\s*/gm, '');
    
    return formattedText;
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Speech synthesis is not supported in your browser');
      return;
    }
    
    if (isSpeaking) {
      onStopSpeaking();
    } else {
      toast.info('Speaking response...');
      onSpeak(message.text);
    }
  };

  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} group message-item`}>
      <div className={`flex items-start space-x-3 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
          message.isUser 
            ? 'bg-gradient-to-r from-[#007BFF] to-[#00C896]' 
            : 'bg-white'
        }`}>
          {message.isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <img 
              src={BotAvatar} 
              alt="AI Assistant" 
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Message Content */}
          <div
          className={`rounded-lg px-4 py-3 flex-1 relative ${
              message.isUser
              ? 'bg-gradient-to-r from-[#007BFF] to-[#00C896] text-white'
              : 'bg-gradient-to-r from-[#D0F1FF] to-[#E0FFF6] text-[#1A1A1A]'
            }`}
          >

                      <div className="break-words">
              {message.isUser ? (
                // User messages display as plain text
                <span>{message.text}</span>
              ) : (
                // AI messages use formatted HTML
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: formatAIResponse(message.text) 
                  }}
                  className="ai-message"
                />
              )}
                          <div className="mt-1 text-xs opacity-70">
              <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
            </div>
            
            {!message.isUser && (
            <div className="flex items-center space-x-1 mt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onSpeak(message.text)}
                className={`p-1 h-6 hover:scale-110 transition-all ${
                  isSpeaking ? 'text-[#1DA1F2]' : 'text-[#007BFF] hover:text-[#1DA1F2]'
                }`}
              >
                  <Volume2 className="w-3 h-3" />
              </Button>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
