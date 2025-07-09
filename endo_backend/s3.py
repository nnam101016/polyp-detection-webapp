import boto3

s3 = boto3.client(
    "s3",
    aws_access_key_id="YOUR_AWS_ACCESS_KEY",
    aws_secret_access_key="YOUR_AWS_SECRET_KEY",
)

BUCKET_NAME = "YOUR_BUCKET_NAME"

def upload_to_s3(file_obj, filename):
    s3.upload_fileobj(file_obj, BUCKET_NAME, filename)
    return f"https://{BUCKET_NAME}.s3.amazonaws.com/{filename}"
