import requests
import json


class KDSMClient:
    def __init__(self, api_key, base_url="http://localhost:3000/api/v1"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {"Content-Type": "application/json", "x-api-key": api_key}

    def encrypt(self, message, key=None):
        try:
            payload = {"message": message}
            if key:
                payload["key"] = key

            response = requests.post(
                f"{self.base_url}/encrypt", headers=self.headers, json=payload
            )
            response.raise_for_status()

            data = response.json()
            if not data.get("success"):
                raise Exception(data.get("error", "Unknown error during encryption"))

            return data.get("data", {})

        except requests.exceptions.RequestException as e:
            raise Exception(f"Network error during encryption: {str(e)}")
        except json.JSONDecodeError:
            raise Exception("Invalid JSON response from server")

    def decrypt(self, encrypted_message, key):
        try:
            payload = {"encryptedMessage": encrypted_message, "key": key}

            response = requests.post(
                f"{self.base_url}/decrypt", headers=self.headers, json=payload
            )
            response.raise_for_status()

            data = response.json()
            if not data.get("success"):
                raise Exception(data.get("error", "Unknown error during decryption"))

            return data.get("data", {})

        except requests.exceptions.RequestException as e:
            raise Exception(f"Network error during decryption: {str(e)}")
        except json.JSONDecodeError:
            raise Exception("Invalid JSON response from server")


# Usage example
client = KDSMClient(
    "kdsm_680851745233f596ae2246a17ea78db26bd2e05826e5462898bdf6132976ae94"
)

try:
    # Encrypt a message
    result = client.encrypt("Op Stuff!!!")
    print(f"Encrypted: {result['encryptedMessage']}")
    print(f"Key: {result['key']}")

    # Decrypt the message
    decrypted = client.decrypt(result["encryptedMessage"], result["key"])
    print(f"Decrypted: {decrypted['decryptedMessage']}")

except Exception as e:
    print(f"Error: {e}")
