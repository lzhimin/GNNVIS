import numpy as np
#from sklearn.manifold import TSNE
#from sklearn.decomposition import PCA
#from sklearn.preprocessing import Normalizer


def getdata(request):
    data = np.loadtxt('data/data.txt')
    labels = np.loadtxt('data/labels.txt')

    # only load the front-ground image
    indexs = labels == 1
    data = data[indexs]
    labels = labels[indexs].tolist()

    # get the important feature
    names, columns = getImportantFeature()
    data = data[:, columns]

    # get app config e.g., color
    config = getconfig()
    result = {}

    result['embedding'] = getEmbedding(data, 'tsne')
    result['labels'] = labels
    result['names'] = names
    result['datasets'] = data.tolist()
    result['config'] = config

    return result


def getEmbedding(data, t='pca'):

    #data = Normalizer().fit_transform(data)
    #pca = PCA(n_components=2).fit_transform(data)
    #tsne = TSNE(n_components=2).fit_transform(data)

    #np.savetxt('pca.out', pca, delimiter=',')
    #np.savetxt('tsne.out', tsne, delimiter=',')

    pca = np.loadtxt('data/pca.out', delimiter=',')
    tsne = np.loadtxt('data/tsne.out', delimiter=',')

    return {'pca': pca.tolist(), 'tsne': tsne.tolist()}


def getImportantFeature():
    f = open("data/important.txt", "r")
    lines = f.read().split('\n')

    # the number of important feature
    N = 10
    columns = []
    names = []

    for i in range(N * 2):
        if i % 2 == 0:
            line = lines[i].split(' ')
            columns.append(int(line[0]))
            names.append(line[2])
    return [names, columns]


def getconfig():
    f = open("config/color.txt", "r")
    lines = f.read().split('\n')
    return {'color': lines}


def getLabel(request):
    labels = np.loadtxt('data/labels.txt')

    # only load the front-ground image
    indexs = labels == 1

    # select the front-ground samples
    labels = labels[indexs].tolist()

    return {'labels': labels}
