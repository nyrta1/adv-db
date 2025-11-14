import base64
import random
from locust import HttpUser, task, between

def basic_auth_header(username, password):
    auth_string = f"{username}:{password}"
    base64_auth = base64.b64encode(auth_string.encode()).decode()
    return {"Authorization": f"Basic {base64_auth}"}


class APIUser(HttpUser):
    host = "http://localhost:3000"

    wait_time = between(1, 3)

    username = "john@gmail.com"
    password = "password"

    def on_start(self):
        self.auth_header = basic_auth_header(self.username, self.password)

    # -------- USER ROUTES --------

    @task(2)
    def get_user(self):
        # CHANGE ID IF NEEDED
        user_id = "761c3b71-a9ce-4b6f-a691-ac84743ec508"
        self.client.get(f"/users/{user_id}", headers=self.auth_header)

    @task(1)
    def register_user(self):
        payload = {
            "name": "Load Test User",
            "email": f"loadtest_{random.randint(1, 99999)}@example.com",
            "password": "password",
            "age": 30
        }
        self.client.post("/users/register", json=payload, headers=self.auth_header)
    
    @task(2)
    def get_user_history(self):
        user_id = random.choice([
            "761c3b71-a9ce-4b6f-a691-ac84743ec508",
            "123e4567-e89b-12d3-a456-426614174000",
            "987e6543-e21b-12d3-a456-426614174999",
            "456e7890-e21b-12d3-a456-426614174111"
        ])
        self.client.get(f"/users/{user_id}/history", headers=self.auth_header)

    @task(1)
    def login_user(self):
        payload = {
            "email": "john@gmail.com",
            "password": "password"
        }
        self.client.post("/users/login", json=payload)

    # -------- PRODUCT ROUTES --------

    @task(3)
    def list_products(self):
        self.client.get("/products", headers=self.auth_header)

    @task(2)
    def list_products_with_filters(self):
        brand = random.choice(["Nike", "Adidas", "Puma", "Reebok", ""])
        category = random.choice(["Sneakers", "Boots", "Running", "Casual", ""])
        url = f"/products?brand={brand}&category={category}"
        self.client.get(url, headers=self.auth_header)

    @task(1)
    def get_single_product(self):
        product_id = random.choice([
            "7824407a-2768-4f8b-ae0d-82cf56348545",
            "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
        ])
        self.client.get(f"/products/{product_id}", headers=self.auth_header)

    @task(1)
    def get_recommendations(self):
        self.client.get(f"/products/recommendations", headers=self.auth_header)
