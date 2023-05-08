import os

def create_env_file(env_file_path):
    variables = {
        "BASE_FRONTEND_IMAGE_NAME": 'dev_frontend',
        "BASE_BACKEND_IMAGE_NAME": 'dev_backend',
        "BASE_DB_IMAGE_NAME": 'dev_db',
        "BASE_FRONTEND_IMAGE_TAG": 'latest',
        "BASE_BACKEND_IMAGE_TAG": 'latest',
        "BASE_DB_IMAGE_TAG": 'latest',
        "BASE_FRONTEND_IMAGE": "dev_frontend:latest",
        "BASE_BACKEND_IMAGE": "dev_backend:latest",
        "BASE_DB_IMAGE": "dev_db:latest",
		"FRONTEND_FOLDER_PATH": "./frontend/dev/app" ,
		"BACKEND_FOLDER_PATH": "./backend/dev/app",
		"DB_FOLDER_PATH" : "./db/dev/app",
        "FRONTEND_PROJECT_PATH" : "frontend/dev",
		"BACKEND_PROJECT_PATH" : "backend/dev",
        "DB_PROJECT_PATH" : "db/dev",
        "FRONTEND_DOCKERFILE_PATH" : "frontend/dev/.devcontainer/",
		"BACKEND_DOCKERFILE_PATH" : "backend/dev/.devcontainer/",
        "DB_DOCKERFILE_PATH" : "db/dev/.devcontainer"
    }

    if os.path.exists(env_file_path):
        with open(env_file_path, 'r') as env_file:
            lines = env_file.readlines()
    else:
        lines = []

    with open(env_file_path, 'a') as env_file:
        for variable, value in variables.items():
            if not any(line.startswith(f"{variable}=") for line in lines):
                env_file.write(f"{variable}={value}\n")    

if __name__ == '__main__':
    env_file_path = './.env'
    create_env_file(env_file_path)
