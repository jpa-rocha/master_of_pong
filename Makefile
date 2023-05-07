start_up:
	python3 project_init.py;
	docker compose up

run:
	python3 scripts/create_images.py;
	python3 scripts/setup.py;
	docker compose up;