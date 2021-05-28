import numpy as np
from sklearn.manifold import TSNE
from sklearn.decomposition import PCA
from sklearn.preprocessing import Normalizer


def getdata(request):
    data = np.loadtxt('data/data.txt')
    data = Normalizer().fit_transform(data)

    return {"embedding": getEmbedding(data, 'tsne')}


def getEmbedding(data, type='tsne'):

    if type == 'pca':
        return PCA(n_components=2).fit_transform(data).tolist()

    if type == 'tsne':
        return TSNE(n_components=2).fit_transform(data).tolist()

    return []
