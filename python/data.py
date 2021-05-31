import numpy as np
from sklearn.manifold import TSNE
from sklearn.decomposition import PCA
from sklearn.preprocessing import Normalizer


def getdata(request):
    data = np.loadtxt('data/data.txt')
    data = Normalizer().fit_transform(data)

    labels = np.loadtxt('data/labels.txt').tolist()

    return {"embedding": getEmbedding(data, 'tsne'), 'labels': labels}


def getEmbedding(data, type='pca'):

    embedding = []

    if type == 'pca':
        # PCA(n_components=2).fit_transform(data).tolist()
        embedding = np.loadtxt('data/pca.output', delimiter=',')

    if type == 'tsne':
        # TSNE(n_components=2).fit_transform(data).tolist()
        embedding = np.loadtxt('data/tsne.output', delimiter=',')

    return embedding.tolist()
