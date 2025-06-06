import { useState } from 'react';
import { Card } from './card';
import { Button } from './button';
import { DecryptModal } from './DecryptModal';

export function MessageCard({ message, sender, timestamp, encrypted }) {
  const [showDecrypt, setShowDecrypt] = useState(false);
  
  const formattedTime = new Date(timestamp).toLocaleString();
  
  return (
    <Card className="p-4 mb-4 w-full max-w-md">
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium">{sender}</div>
        <div className="text-xs text-muted-foreground">{formattedTime}</div>
      </div>
      
      {encrypted ? (
        <>
          <div className="p-2 bg-muted rounded-md break-all text-sm mb-2">
            {message.substring(0, 30)}...
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDecrypt(true)}
          >
            Decrypt Message
          </Button>
          
          {showDecrypt && (
            <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
              <DecryptModal 
                encryptedMessage={message} 
                onClose={() => setShowDecrypt(false)} 
              />
            </div>
          )}
        </>
      ) : (
        <div className="p-2 rounded-md">{message}</div>
      )}
    </Card>
  );
}