RUN_SCRIPT = python3 scripts/

# Run on project init, creates base containers, creates app templates, and docker .env file
start_up:
	python3 project_init.py;

# Copies app folders into prodution container and runs docker compose up
run:
	$(RUN_SCRIPT)setup.py;
	$(RUN_SCRIPT)create_images.py;
	docker compose up;