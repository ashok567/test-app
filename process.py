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


def get_monthly_diff(channel, month, entity):
    months_list = df['Month'].unique().tolist()
    if month != 'JAN':
        idx = months_list.index(month)
        prev_month = months_list[idx-1]
        start = df[(df['Channels'] == channel) &
                   (df['Month'] == prev_month)][entity].values[0]
        end = df[(df['Channels'] == channel) &
                 (df['Month'] == month)][entity].values[0]
        return round(end - start, 2)
    else:
        return 0


df = pd.read_csv('data/data.csv')
df[['Subscribers', 'Views']] = df[['Subscribers', 'Views']].fillna('0')
df['Subscribers'] = df['Subscribers'].apply(btom)
df['Views'] = df['Views'].apply(mtob)
df['Subs_diff'] = df.apply(lambda x: get_monthly_diff(x['Channels'], x['Month'], 'Subscribers'), axis=1)
df['Views_diff'] = df.apply(lambda x: get_monthly_diff(x['Channels'], x['Month'], 'Views'), axis=1)


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


def get_insight(channel):
    insights = {}
    trend = ['most', '2nd most', '3rd most', '3rd least', '2nd least', 'least']
    trending_channels = df.sort_values(
                        by=['Views_diff'], ascending=False)['Channels'].unique().tolist()
    insights['channel'] = channel
    insights['rank'] = trend[trending_channels.index(channel)]
    insights['subs_end'] = df[(df['Channels'] == channel) &
                              (df['Month'] == 'DEC')]['Subscribers'].values[0]
    insights['subs_avg'] = round(df[df['Channels'] == channel]['Subs_diff'].mean(), 2)
    insights['views_avg'] = round(df[df['Channels'] == channel]['Views_diff'].mean()*1000, 2)
    insights['views_gain'] = round(df[df['Channels'] == channel]['Views_diff'].sum(), 2)
    return json.dumps(insights)
