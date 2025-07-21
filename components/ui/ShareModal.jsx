import { useState, useMemo, useCallback } from 'react';
import { Modal } from '@/components/ui/chats/Modal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  MessageCircle, 
  Send, 
  Instagram, 
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

const ShareModal = ({ isOpen, onClose, encryptedMessage, encryptionKey }) => {
  const [copiedPlatform, setCopiedPlatform] = useState(null);

  // Memoized share message with proper formatting
  const shareMessage = useMemo(() => {
    const baseMessage = `^_~ Try decrypting this message using KDSM Encryptor!\n\n${encryptedMessage}[KDSM_KEY_START]${encryptionKey}[KDSM_KEY_END]\n\n✨ Visit https://kdsm.vercel.app to decrypt this message - just paste it and watch the magic happen!\n\n#KDSMEncryptor #Encryption #Security`;
    return baseMessage;
  }, [encryptedMessage, encryptionKey]);

  // Memoized platform configurations
  const platforms = useMemo(() => [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
      description: 'Share via WhatsApp'
    },
    {
      name: 'X (Twitter)',
      icon: Send,
      color: 'bg-black hover:bg-gray-800',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`,
      description: 'Share on X'
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-blue-500 hover:bg-blue-600',
      url: `https://t.me/share/url?text=${encodeURIComponent(shareMessage)}`,
      description: 'Share on Telegram'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      url: null, // Instagram doesn't support direct URL sharing
      description: 'Copy for Instagram'
    }
  ], [shareMessage]);

  // Handle platform share with optimized copy functionality
  const handleShare = useCallback(async (platform) => {
    try {
      if (platform.url) {
        // Open social media platform
        window.open(platform.url, '_blank', 'noopener,noreferrer');
        toast.success('Redirected', {
          description: `Opened ${platform.name} to share your encrypted message`
        });
      } else {
        // Copy to clipboard for platforms without direct URL support
        await navigator.clipboard.writeText(shareMessage);
        setCopiedPlatform(platform.name);
        
        setTimeout(() => {
          setCopiedPlatform(null);
        }, 2000);
        
        toast.success('Copied', {
          description: `Message copied for ${platform.name}. Paste it manually!`
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Share Failed', {
        description: `Could not share to ${platform.name}`
      });
    }
  }, [shareMessage]);

  // Copy entire message to clipboard
  const copyMessage = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopiedPlatform('clipboard');
      
      setTimeout(() => {
        setCopiedPlatform(null);
      }, 2000);
      
      toast.success('Copied', {
        description: 'Share message copied to clipboard'
      });
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Copy Failed', {
        description: 'Could not copy message to clipboard'
      });
    }
  }, [shareMessage]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center"
          >
            <Send className="w-8 h-8 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground">Share Encrypted Message</h2>
          <p className="text-muted-foreground">
            Invite others to try KDSM by sharing your encrypted message with the key embedded
          </p>
        </div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-muted/50 rounded-lg border"
        >
          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
          <div className="text-xs bg-background rounded p-3 border max-h-32 overflow-y-auto font-tomorrow">
            {shareMessage}
          </div>
        </motion.div>

        {/* Platform Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Button
                onClick={() => handleShare(platform)}
                className={`w-full h-12 ${platform.color} text-white relative overflow-hidden group`}
                variant="ghost"
              >
                <div className="flex items-center gap-2">
                  <platform.icon className="w-5 h-5" />
                  <span className="font-medium">{platform.name}</span>
                </div>
                
                {/* Success indicator */}
                {copiedPlatform === platform.name && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-green-500 flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Copy Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={copyMessage}
            variant="outline"
            className="w-full h-12 border-dashed border-2 hover:border-solid transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              {copiedPlatform === 'clipboard' ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
              <span>Copy Share Message</span>
            </div>
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-xs text-muted-foreground">
            Recipients can paste your message directly into KDSM Encryptor for instant decryption
          </p>
        </motion.div>
      </div>
    </Modal>
  );
};

export default ShareModal;