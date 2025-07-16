import requests
import json

class KDSMClient:
    def __init__(self, api_key, base_url="http://localhost:3000/api/v1"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": api_key
        }
    
    def encrypt(self, message, key=None):
        payload = {"message": message}
        if key:
            payload["key"] = key
            
        response = requests.post(
            f"{self.base_url}/encrypt",
            headers=self.headers,
            json=payload
        )
        
        data = response.json()
        if not data["success"]:
            raise Exception(data["error"])
            
        return data["data"]
    
    def decrypt(self, encrypted_message, key):
        payload = {
            "encryptedMessage": encrypted_message,
            "key": key
        }
        
        response = requests.post(
            f"{self.base_url}/decrypt",
            headers=self.headers,
            json=payload
        )
        
        data = response.json()
        if not data["success"]:
            raise Exception(data["error"])
            
        return data["data"]

# Usage example
client = KDSMClient("kdsm_3eb76e42948b0ee7db7f0592a4ead316")

try:
    # Encrypt a message
    result = client.encrypt("786", "110")
    print(f"Encrypted: {result['encryptedMessage']}")
    print(f"Key: {result['key']}")
    
    # Decrypt the message
    decrypted = client.decrypt(result['encryptedMessage'], result['key'])
    print(f"Decrypted: {decrypted['decryptedMessage']}")
    
except Exception as e:
    print(f"Error: {e}")