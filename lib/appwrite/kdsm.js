// Contributors: Ensure that the environment variables are set correctly in your .env.local file.

export const config = {
  project_id: process.env.APPWRITE_PROJECT,
  endpoint: process.env.APPWRITE_ENDPOINT,
  api_key: process.env.APPWRITE_API_KEY,
  database: process.env.APPWRITE_DATABASE,
};
export const collections = {
    api_keys: process.env.APPWRITE_COLLECTION_API_KEY,
    api_usage: process.env.APPWRITE_COLLECTION_API_USAGE,
    chatRooms: process.env.APPWRITE_COLLECTION_CHAT_ROOMS,
}