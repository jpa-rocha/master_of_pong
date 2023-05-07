def create_env_file(frontend_image_name, image_tag, env_file_path):
    with open(env_file_path, 'w') as env_file:
        # TODO make it so that open uses append and variables are only written if not found
        env_file.write(f"BASE_FRONTEND_IMAGE_NAME={frontend_image_name}\n")
        env_file.write(f"BASE_FRONTEND_IMAGE_TAG={image_tag}\n")
        env_file.write(f"BASE_BACKEND_IMAGE_NAME={backend_image_name}\n")
        env_file.write(f"BASE_BACKEND_IMAGE_TAG={image_tag}\n")

if __name__ == '__main__':
    env_file_path = '../.env'
    frontend_image_name = 'dev_frontend'
    backend_image_name = 'dev_backend'
    image_tag = 'latest'
    create_env_file(frontend_image_name, image_tag, env_file_path)
