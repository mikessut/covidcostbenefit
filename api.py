import flask
from flask import request, jsonify
from flask_cors import CORS
import yaml

app = flask.Flask(__name__)
app.config["DEBUG"] = True
CORS(app)

data = yaml.safe_load(open('costbenefits.yaml'))

# A route to return all of the available entries in our catalog.
@app.route('/api/v1/resources', methods=['GET'])
def api_costs():
    return jsonify(data)

app.run()
