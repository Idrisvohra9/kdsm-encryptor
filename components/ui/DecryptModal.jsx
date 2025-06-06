import { useState } from 'react';
import { decrypt } from '../../utils/kdsm';
import { Button } from './button';
import { Input } from './input';
import { Card } from './card';
import { DecryptedText } from './DecryptedText';

export function DecryptModal({ encryptedMessage, onClose }) {
  const [key, setKey] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [error, setError] = useState('');

  const handleDecrypt = () => {
    if (!encryptedMessage || !key) return;
    
    try {
      const decryptedMessage = decrypt(encryptedMessage, key);
      setDecrypted(decryptedMessage);
      setError('');
    } catch (err) {
      setError('Failed to decrypt. Please check your key.');
      setDecrypted('');
    }
  };

  return (
    <Card className="p-4 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Decrypt Message</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="p-2 bg-muted rounded-md break-all text-sm">
          {encryptedMessage}
        </div>
        
        <div>
          <Input
            placeholder="Enter decryption key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Button onClick={handleDecrypt} className="w-full" disabled={!encryptedMessage || !key}>
          Decrypt
        </Button>
        
        {error && (
          <div className="text-destructive text-sm">{error}</div>
        )}
        
        {decrypted && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-1">Decrypted Message:</h4>
            <div className="p-2 bg-muted rounded-md">
              <DecryptedText text={decrypted} />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}