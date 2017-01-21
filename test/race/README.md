this is where i test for race conditions between the pico-8 and nfig

```shell
virtualenv venv
source venv/bin/activate # or activate.fish if you have great taste in shells
pip install -r requirements.txt
```

then

```shell
gunicorn -w 3 slownfig:app
```

or

```shell
gunicorn -w 3 slowcart:app
```

depending on if you want the cart or nfig to load slower

have fun and stay safe
