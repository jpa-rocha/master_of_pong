import subprocess

def call_python_script(script_path):
    subprocess.run(["python3", script_path])

# Usage example
images_path = "scripts/create_images.py"
container_path = "scripts/create_dev_containers.py"
setup_path = "scripts/setup.py"

call_python_script(images_path)
call_python_script(container_path)
call_python_script(setup_path)