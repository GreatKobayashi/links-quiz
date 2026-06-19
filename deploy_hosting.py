#!/usr/bin/env python3
"""Firebase Hosting deployment via REST API using gcloud access token."""
import gzip
import hashlib
import json
import os
import subprocess
import urllib.request

SITE_ID = "question-agent-ytt"
DIST_DIR = "dist"
BASE_URL = "https://firebasehosting.googleapis.com/v1beta1"


def get_access_token():
    result = subprocess.run(
        ["gcloud", "auth", "print-access-token"],
        capture_output=True, text=True, check=True
    )
    return result.stdout.strip()


def request(method, url, token, data=None, binary=None):
    body = json.dumps(data).encode() if data is not None else binary
    content_type = "application/octet-stream" if binary else "application/json"
    req = urllib.request.Request(
        url, data=body,
        headers={"Authorization": f"Bearer {token}", "Content-Type": content_type},
        method=method
    )
    with urllib.request.urlopen(req) as resp:
        raw = resp.read()
        return json.loads(raw) if raw else {}


def collect_files():
    files = {}
    for root, _, filenames in os.walk(DIST_DIR):
        for name in filenames:
            path = os.path.join(root, name)
            with open(path, "rb") as f:
                content = f.read()
            gz = gzip.compress(content, mtime=0)
            h = hashlib.sha256(gz).hexdigest()
            url_path = "/" + os.path.relpath(path, DIST_DIR).replace("\\", "/")
            files[url_path] = (h, gz)
    return files


def main():
    token = get_access_token()
    print("Got access token")

    files = collect_files()
    file_hashes = {path: info[0] for path, info in files.items()}

    print("Creating version...")
    version = request("POST", f"{BASE_URL}/sites/{SITE_ID}/versions", token, {})
    version_name = version["name"]
    print(f"Version: {version_name}")

    print("Populating files...")
    pop = request("POST", f"{BASE_URL}/{version_name}:populateFiles", token, {"files": file_hashes})
    upload_url = pop.get("uploadUrl", "")
    required = set(pop.get("uploadRequiredHashes", []))
    print(f"Files to upload: {len(required)}")

    for path, (h, gz) in files.items():
        if h in required:
            print(f"Uploading {path}")
            request("POST", f"{upload_url}/{h}", token, binary=gz)

    print("Finalizing version...")
    request("PATCH", f"{BASE_URL}/{version_name}?updateMask=status", token, {"status": "FINALIZED"})

    print("Creating release...")
    request("POST", f"{BASE_URL}/sites/{SITE_ID}/releases?versionName={version_name}", token, {})

    print("Deployment complete!")


if __name__ == "__main__":
    main()
