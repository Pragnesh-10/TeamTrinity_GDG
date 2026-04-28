import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_image_by_id(image_id: str):
    response = supabase.table("images").select("*").eq("id", image_id).execute()
    if response.data:
        return response.data[0]
    return None