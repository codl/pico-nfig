from flask import Flask, send_file
from time import sleep

app = Flask(__name__)

@app.route('/')
def demohtml():
    return send_file("demo.html")

@app.route('/demo.js')
def demojs():
    sleep(3)
    return send_file("demo.js")

@app.route('/nfig.js')
def nfig_delayed():
    return send_file("../../lib/nfig.js")

if __name__ == "__main__":
    app.run()
