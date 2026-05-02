from params import *
import random
import requests

def poly_eval(P, x, p):
    return sum([Pi*pow(x, i, p) for i,Pi in enumerate(P)])%p

class Client:
    def __init__(self, host, port):
        self.url = f"http://{host}:{port}"
        self.sess = requests.Session()
        self.p = 2**255 - 19
    
    def get_items(self):
        resp = self.sess.get(self.url + "/api/product").json()
        return resp

    def authenticate(self, order_id, auth_key):
        server_data = self.sess.post(f'{self.url}/api/order/init', json={'order_id': order_id}).json()
        P, masked_server = [server_data[k] for k in ['P', 'masked']] 
        P = [int(Pi, 16) for Pi in P]
        masked_server = [int(ms, 16) for ms in masked_server]
        p = 2**255 - 19

        r = random.randrange(p)
        auth_keys = [random.randrange(p) for _ in range(random.randint(5, 20))] + [int(auth_key, 16)]
        random.shuffle(auth_keys)
        tokens_client = [poly_eval(P, auth_key, p) for auth_key in auth_keys]
        masked_client = [hex((token_client*r) % p)[2:] for token_client in tokens_client]
        masked_server = [hex(((ms*r) % p))[2:] for ms in masked_server]

        resp = self.sess.post(f'{self.url}/api/order/redeem', json={'masked_server': masked_server, 'masked_client': masked_client})

        if resp.status_code == 401:
            return None
        else:
            return resp.json()