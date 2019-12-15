import pandas as pd


def get_subs():
    df = pd.read_csv('data/data.csv')
    month_list = df['Month'].unique()
    df1 = pd.pivot_table(df, index='Month', columns=['Channels'], values='Subscribers').reset_index()
    df1['Month_new'] = pd.Categorical(df1['Month'], categories=month_list, ordered=True)
    df1 = df1.sort_values('Month_new').drop('Month_new', axis=1)
    return df1.to_json(orient='records')


def get_views():
    df = pd.read_csv('data/data.csv')
    df1 = pd.pivot_table(df, index='Month', columns=['Channels'], values='Views').reset_index()
    df2 = df1.groupby('Month', sort=False).sum()
    return df2.to_json(orient='columns')


def get_insight():
    df = pd.read_csv('data/data.csv')
    df1 = pd.pivot_table(df, index='Month', columns=['Channels'], values='Views').reset_index()
    df2 = pd.pivot_table(df, index='Month', columns=['Channels'], values='Subscribers').reset_index()
    df3 = df1.append(df2)
    return df3.to_json(orient='records')
