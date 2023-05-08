import os
import subprocess

def create_folder(folder_path):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
        print(f"Folder '{folder_path}' created.")
    else:
        print(f"Folder '{folder_path}' already exists.")

def create_container(container_name, project_path):
    # Check if the container exists
    result = subprocess.run(["docker", "inspect", container_name], capture_output=True)
    if result.returncode == 0:
        print(f"Container '{container_name}' already exists.")
    else:
        print(f"Creating container '{container_name}'...")
        os.chdir(project_path)
        subprocess.run(["devcontainer", "up"])
        subprocess.run(["docker", "stop", f"{container_name}"])
        print(f"Container '{container_name}' created.")

f_folder_path = "./frontend/dev/app" 
b_folder_path = "./backend/dev/app"
d_folder_path = "./db/dev/app"
create_folder(f_folder_path)
create_folder(b_folder_path)
create_folder(d_folder_path)


original_dir = os.getcwd()
f_container_name = "frontend_base"
f_project_path = "frontend/dev"
b_container_name = "backend_base"
b_project_path = "backend/dev"

create_container(f_container_name, f_project_path)
image_name = "dev_frontend:latest"
command = f"docker stop $(docker ps -q --filter ancestor={image_name})"
subprocess.run(command, shell=True)

os.chdir(original_dir)
create_container(b_container_name, b_project_path)
image_name = "dev_backend:latest"
command = f"docker stop $(docker ps -q --filter ancestor={image_name})"
subprocess.run(command, shell=True)