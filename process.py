import pandas as pd


def get_data():
    df = pd.read_csv('data/data.csv')
    df1 = pd.pivot_table(df, index='Month', columns=['Channels'], values='Subscribers').reset_index()
    return df1.to_json(orient='records')


def get_user():
    pass


def get_insight():
    pass
