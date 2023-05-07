

import os
import subprocess

def build_image(image_name, dockerfile_path):
    result = subprocess.run(["docker", "image", "inspect", image_name], capture_output=True)
    
    if result.returncode == 0:
        print(f"Image '{image_name}' already exists.")
    else:
        print(f"Building image '{image_name}'...")
        os.chdir(dockerfile_path)
        subprocess.run(["docker", "build", "-t", image_name, "."])
        print(f"Image '{image_name}' created.")

original_dir = os.getcwd()
# Paths to Dockerfiles

f_image_name = "dev_frontend:latest"
f_dockerfile_path = "frontend/dev/.devcontainer/"
b_image_name = "dev_backend:latest"
b_dockerfile_path = "backend/dev/.devcontainer/"


build_image(f_image_name, f_dockerfile_path)
os.chdir(original_dir)
build_image(b_image_name, b_dockerfile_path)
