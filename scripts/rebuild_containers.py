import argparse
import docker

def rebuild_container(container_name, path_to_dockerfile, image_tag):
    # Create a Docker client
    client = docker.from_env()

    try:
        # Find the container by name
        container = client.containers.get(container_name)

        # Stop and remove the container
        container.stop()
        container.remove()

        # Build a new image
        client.images.build(path=path_to_dockerfile, tag=image_tag)

        # Run a new container with the new image
        client.containers.run(image_tag, detach=True, name=container_name)

        print(f"Container '{container_name}' rebuilt successfully.")
    except docker.errors.NotFound:
        print(f"Container '{container_name}' not found.")

if __name__ == '__main__':
    # Create the argument parser
    parser = argparse.ArgumentParser(description='Rebuild a specific container.')

    # Add the command-line arguments
    parser.add_argument('container_name', type=str, help='Name of the container to rebuild')
    parser.add_argument('path_to_dockerfile', type=str, help='Path to the directory containing the Dockerfile')
    parser.add_argument('image_tag', type=str, help='Tag for the rebuilt image')

    # Parse the command-line arguments
    args = parser.parse_args()

    # Call the function to rebuild the specific container
    rebuild_container(args.container_name, args.path_to_dockerfile, args.image_tag)
