import pandas as pd


def get_subs():
    df = pd.read_csv('data/data.csv')
    df1 = pd.pivot_table(df, index='Month', columns=['Channels'], values='Subscribers').reset_index()
    return df1.to_json(orient='records')


def get_views():
    df = pd.read_csv('data/data.csv')
    df1 = pd.pivot_table(df, index='Month', columns=['Channels'], values='Views').reset_index()
    df2 = df1.groupby('Month', sort=False).sum()
    return df2.to_json(orient='columns')
