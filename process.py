import pandas as pd


def get_data():
    df = pd.read_csv('data/data.csv')
    return df.to_json(orient='records')


def get_user():
    pass


def get_insight():
    pass
