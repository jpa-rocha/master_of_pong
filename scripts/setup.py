import os

def create_env_file(frontend_image_name, backend_image_name, db_image_name, image_tag, env_file_path):
    variables = {
        "BASE_FRONTEND_IMAGE_NAME": frontend_image_name,
        "BASE_BACKEND_IMAGE_NAME": backend_image_name,
        "BASE_DB_IMAGE_NAME": db_image_name,
        "BASE_FRONTEND_IMAGE_TAG": image_tag,
        "BASE_BACKEND_IMAGE_TAG": image_tag,
        "BASE_DB_IMAGE_TAG": image_tag,
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
    frontend_image_name = 'dev_frontend'
    backend_image_name = 'dev_backend'
    db_image_name = 'dev_db'
    image_tag = 'latest'
    create_env_file(frontend_image_name, backend_image_name, db_image_name, image_tag, env_file_path)
