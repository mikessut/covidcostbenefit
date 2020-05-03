import flask
from flask import request, jsonify
from flask_cors import CORS
import yaml
import threading

lock = threading.Lock()

app = flask.Flask(__name__)
app.config["DEBUG"] = True
CORS(app)

DATA_FILE = 'costbenefits.yaml'


# A route to return all of the available entries in our catalog.
@app.route('/api/v1/resources', methods=['GET'])
def api_costs():
    with lock:
        data = yaml.safe_load(open(DATA_FILE))
    return jsonify(data)


@app.route('/api/v1/vote/costs/<int:cost_id>', methods=['POST'])
def vote_costs(cost_id):
    return vote(cost_id, 'costs')


@app.route('/api/v1/vote/benefits/<int:cost_id>', methods=['POST'])
def vote_benefits(cost_id):
    return vote(cost_id, 'benefits')


def vote(cost_id, cb):
    print("remote_addr", request.remote_addr)
    # import pdb; pdb.set_trace()
    if request.remote_addr != '127.0.0.1':
        return jsonify({'result': 'nice try'})
    with lock:
        data = yaml.safe_load(open(DATA_FILE))
        try:
            idx = next(n for n in range(len(data[cb])) if data[cb][n]['id'] == cost_id)
            data[cb][idx]['votes'] += 1
            yaml.dump(data, open(DATA_FILE, 'w'))
            return jsonify({'result': 'success'})
        except StopIteration:
            return jsonify({'result': 'fail'})
        except Exception as e:
            print("Fail")
            print(e)

    return jsonify({'result': 'fail'})


app.run()
