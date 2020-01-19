import pandas as pd
import json


def btom(d):
    d = d.rstrip()
    if d[-1] == 'B':
        return round(float(d[:-1])*1000, 2)
    elif d[-1] == 'M':
        return round(float(d[:-1]), 2)


def mtob(d):
    d = d.rstrip()
    if d[-1] == 'M':
        return round(float(d[:-1])/1000, 2)
    elif d[-1] == 'B':
        return round(float(d[:-1]), 2)


df = pd.read_csv('data/data.csv')
df[['Subscribers', 'Views']] = df[['Subscribers', 'Views']].fillna('0')
df['Subscribers'] = df['Subscribers'].apply(btom)
df['Views'] = df['Views'].apply(mtob)


def get_subs():
    month_list = df['Month'].unique()
    df1 = pd.pivot_table(df, index='Month', columns=['Channels'],
                         values='Subscribers').reset_index()
    df1['Month_new'] = pd.Categorical(df1['Month'], categories=month_list, ordered=True)
    df1 = df1.sort_values('Month_new').drop('Month_new', axis=1)
    return df1.to_json(orient='records')


def get_views():
    df1 = pd.pivot_table(df, index='Month', columns=['Channels'], values='Views').reset_index()
    df2 = df1.groupby('Month', sort=False).sum()
    return df2.to_json(orient='columns')


def get_insight():
    result = {}
    new_df = df.groupby('Channels').mean().reset_index()
    trending_channels = new_df.sort_values(
        by=['Subscribers', 'Views'], ascending=False).values.tolist()
    df1 = pd.pivot_table(df, index='Month', columns=['Channels'], values='Views').reset_index()
    df2 = pd.pivot_table(df, index='Month', columns=['Channels'],
                         values='Subscribers').reset_index()
    for channel in trending_channels:
        print(channel)
    return json.dumps(result)

# channel, rank, subs, avg-sub, views, avg-views
