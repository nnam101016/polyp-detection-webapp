import boto3
import os
from dotenv import load_dotenv

load_dotenv()

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
)

BUCKET_NAME = os.environ["AWS_BUCKET_NAME"]

def generate_presigned_url(filename, expiration=3600):
    return s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET_NAME, "Key": filename},
        ExpiresIn=expiration
    )


def upload_to_s3(file_obj, filename):
    s3_client.upload_fileobj(
        file_obj,
        BUCKET_NAME,
        filename,
        ExtraArgs={"ContentType": "image/jpeg", "ACL": "public-read"}
    )
    url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{filename}"
    return url
