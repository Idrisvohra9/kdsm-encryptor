import { useState } from 'react';
import { encrypt, generateKey } from '../../utils/kdsm';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Card } from './card';

export function EncryptBox({ onEncrypt }) {
  const [message, setMessage] = useState('');
  const [key, setKey] = useState('');
  const [encrypted, setEncrypted] = useState('');

  const handleEncrypt = () => {
    if (!message) return;
    
    const encryptionKey = key || generateKey();
    const encryptedMessage = encrypt(message, encryptionKey);
    
    setEncrypted(encryptedMessage);
    setKey(encryptionKey);
    
    if (onEncrypt) {
      onEncrypt({
        message,
        key: encryptionKey,
        encrypted: encryptedMessage
      });
    }
  };

  const handleGenerateKey = () => {
    setKey(generateKey());
  };

  return (
    <Card className="p-4 w-full max-w-md">
      <h3 className="text-lg font-medium mb-4">Encrypt Message</h3>
      
      <div className="space-y-4">
        <div>
          <Textarea
            placeholder="Enter your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full min-h-[100px]"
          />
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Encryption key (optional)"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleGenerateKey} variant="outline" size="sm">
            Generate
          </Button>
        </div>
        
        <Button onClick={handleEncrypt} className="w-full" disabled={!message}>
          Encrypt
        </Button>
        
        {encrypted && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-1">Encrypted Message:</h4>
            <div className="p-2 bg-muted rounded-md break-all">
              {encrypted}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}